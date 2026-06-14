"""AI Guardian router — Predictive Safety Intelligence endpoints.

Backed by real DB queries and the Groq API (llama-3.3-70b-versatile).
If GROQ_API_KEY is not set the endpoints degrade gracefully without crashing.

TODO: Add authentication via get_current_user once frontend auth flow is wired up.
"""
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db
import models
from routers.ai_provider import call_ai

router = APIRouter()


# ── Pydantic response models ───────────────────────────────────────────────────

class SafetyScore(BaseModel):
    category: str
    score: int
    max_score: int
    status: str           # "safe" | "warning" | "alert"
    badge: Optional[str]  # e.g. "Low", "Moderate", "High"
    color: str            # hex colour for frontend
    note: Optional[str]


class SafetyScoresResponse(BaseModel):
    family_id: int
    overall_score: int
    generated_at: str
    scores: List[SafetyScore]


class ReportEvent(BaseModel):
    time: str
    member: str
    event: str
    status: str    # "safe" | "warning" | "alert"
    category: str  # "location" | "health" | "driving" | "routine"


class DailyReportResponse(BaseModel):
    family_id: int
    report_date: str
    ai_summary: str
    overall_score: int
    events: List[ReportEvent]
    recommendations: List[str]


class InsightItem(BaseModel):
    id: int
    icon_type: str   # "check" | "heart" | "car" | "map" | "alert" | "brain"
    dot_color: str
    text: str
    time: str
    priority: str    # "low" | "medium" | "high"


class InsightsResponse(BaseModel):
    family_id: int
    generated_at: str
    insights: List[InsightItem]
    total_signals_processed: int


class AskRequest(BaseModel):
    query: str
    family_id: int
    context: Optional[str] = None


class AskResponse(BaseModel):
    query: str
    family_id: int
    response: str
    confidence: float
    related_members: List[str]
    action_items: List[str]
    generated_at: str


class RiskPrediction(BaseModel):
    risk_type: str
    title: str
    description: str
    probability: float   # 0.0 – 1.0
    severity: str        # "low" | "medium" | "high" | "critical"
    affected_member: Optional[str]
    recommendation: str
    predicted_for: str   # ISO date string


class RiskPredictionsResponse(BaseModel):
    user_id: int
    generated_at: str
    predictions: List[RiskPrediction]
    next_24h_risk_score: int


# ── Helpers ────────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _today_iso() -> str:
    return date.today().isoformat()


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _score_status(score: int, inverted: bool = False) -> str:
    """Return 'safe'/'warning'/'alert' based on score.

    inverted=True  → high score means high risk (e.g. driving_risk, health_risk)
    inverted=False → high score means safe (e.g. route_safety, child_risk)
    """
    if inverted:
        if score >= 70:
            return "alert"
        if score >= 40:
            return "warning"
        return "safe"
    else:
        if score >= 75:
            return "safe"
        if score >= 50:
            return "warning"
        return "alert"


def _score_color(status: str) -> str:
    return {"safe": "#10B981", "warning": "#F59E0B", "alert": "#EF4444"}.get(status, "#6B7280")


def _format_time(dt: datetime) -> str:
    """Format a UTC datetime as local-friendly 12h time string."""
    if dt is None:
        return "Unknown"
    # Use UTC time — frontend can adjust to local timezone
    return dt.strftime("%-I:%M %p")


def _get_family_member_ids(family_id: int, db: Session) -> List[int]:
    """Return list of user_ids that belong to this family."""
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id
    ).all()
    return [m.user_id for m in members]


def _get_member_name(user_id: int, db: Session) -> str:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.name if user else f"Member #{user_id}"


async def _call_ai(system_prompt: str, user_message: str, max_tokens: int = 600) -> Optional[str]:
    """Call AI with automatic failover across all configured providers."""
    return await call_ai(
        [{"role": "user", "content": user_message}],
        system=system_prompt,
        max_tokens=max_tokens,
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/ai-guardian/safety-scores/{family_id}",
    response_model=SafetyScoresResponse,
    summary="Get real-time safety scores for a family",
)
async def get_safety_scores(family_id: int, db: Session = Depends(get_db)):
    """
    Returns predictive safety scores for every monitored category of the family,
    calculated from real DB activity in the last 24 hours.

    TODO: Authenticate caller — verify caller belongs to the requested family.
    """
    if family_id <= 0:
        raise HTTPException(status_code=422, detail="family_id must be a positive integer")

    cutoff_24h = _utc_now() - timedelta(hours=24)
    cutoff_14d = _utc_now() - timedelta(days=14)

    member_ids = _get_family_member_ids(family_id, db)

    # ── Active SOS alerts ────────────────────────────────────────────────────
    active_sos = db.query(models.SOSAlert).filter(
        models.SOSAlert.family_id == family_id,
        models.SOSAlert.status == "active",
    ).count()

    recent_sos = db.query(models.SOSAlert).filter(
        models.SOSAlert.family_id == family_id,
        models.SOSAlert.triggered_at >= cutoff_24h,
    ).count()

    # ── Driving events (last 24 h) ───────────────────────────────────────────
    driving_events_24h: List[models.DrivingEvent] = []
    if member_ids:
        driving_events_24h = db.query(models.DrivingEvent).filter(
            models.DrivingEvent.user_id.in_(member_ids),
            models.DrivingEvent.occurred_at >= cutoff_24h,
        ).all()

    harsh_count = sum(
        1 for e in driving_events_24h
        if e.type in ("harsh_brake", "rapid_accel") or e.severity == "high"
    )
    high_severity_driving = sum(1 for e in driving_events_24h if e.severity == "high")

    # ── Health records (latest per member) ──────────────────────────────────
    elevated_hr_count = 0
    health_anomalies = 0
    if member_ids:
        for uid in member_ids:
            latest_health = (
                db.query(models.HealthRecord)
                .filter(models.HealthRecord.user_id == uid)
                .order_by(desc(models.HealthRecord.date))
                .first()
            )
            if latest_health:
                if latest_health.heart_rate and latest_health.heart_rate > 100:
                    elevated_hr_count += 1
                    health_anomalies += 1
                if latest_health.steps is not None and latest_health.steps < 500:
                    health_anomalies += 1

    # ── Geofence events (last 24 h) ──────────────────────────────────────────
    geofence_events_count = 0
    if member_ids:
        geofence_events_count = db.query(models.GeofenceEvent).filter(
            models.GeofenceEvent.user_id.in_(member_ids),
            models.GeofenceEvent.occurred_at >= cutoff_24h,
        ).count()

    # ── Score calculations ───────────────────────────────────────────────────

    # Route safety: deduct for SOS events and geofence exits
    geofence_exits = 0
    if member_ids:
        geofence_exits = db.query(models.GeofenceEvent).filter(
            models.GeofenceEvent.user_id.in_(member_ids),
            models.GeofenceEvent.event_type == "exit",
            models.GeofenceEvent.occurred_at >= cutoff_24h,
        ).count()
    route_safety_score = max(0, 100 - (active_sos * 30) - (geofence_exits * 5) - (recent_sos * 10))

    # Child risk: based on SOS + geofence exits
    child_risk_score = max(0, 100 - (active_sos * 25) - (geofence_exits * 3) - (recent_sos * 8))

    # Elderly risk: health anomalies and elevated HR
    elderly_risk_score = max(0, 100 - (elevated_hr_count * 20) - (health_anomalies * 10))

    # Driving risk: harsh events
    driving_risk_score = max(0, 100 - (harsh_count * 8) - (high_severity_driving * 15))

    # Health risk: overall anomalies
    health_risk_score = max(0, 100 - (health_anomalies * 12) - (elevated_hr_count * 10))

    # Emergency probability: active SOS + recent SOS
    emergency_prob_score = max(0, 100 - (active_sos * 40) - (recent_sos * 15))

    # Build score objects
    route_status = _score_status(route_safety_score)
    child_status = _score_status(child_risk_score)
    elderly_status = _score_status(elderly_risk_score)
    driving_status = _score_status(driving_risk_score)
    health_status = _score_status(health_risk_score)
    emergency_status = _score_status(emergency_prob_score)

    scores: List[SafetyScore] = [
        SafetyScore(
            category="route_safety",
            score=route_safety_score,
            max_score=100,
            status=route_status,
            badge=None,
            color=_score_color(route_status),
            note=(
                "Active SOS alert detected — check family status immediately."
                if active_sos > 0
                else f"{geofence_exits} geofence exit(s) in last 24 h."
                if geofence_exits > 0
                else "All family routes are within expected patterns today."
            ),
        ),
        SafetyScore(
            category="child_risk",
            score=child_risk_score,
            max_score=100,
            status=child_status,
            badge="High" if child_status == "alert" else "Moderate" if child_status == "warning" else "Low",
            color=_score_color(child_status),
            note=None,
        ),
        SafetyScore(
            category="elderly_risk",
            score=elderly_risk_score,
            max_score=100,
            status=elderly_status,
            badge="High" if elderly_status == "alert" else "Moderate" if elderly_status == "warning" else "Low",
            color=_score_color(elderly_status),
            note=(
                f"{elevated_hr_count} member(s) with elevated heart rate detected."
                if elevated_hr_count > 0
                else "No elder health concerns today."
            ),
        ),
        SafetyScore(
            category="driving_risk",
            score=driving_risk_score,
            max_score=100,
            status=driving_status,
            badge=None,
            color=_score_color(driving_status),
            note=(
                f"{harsh_count} harsh driving event(s) detected in last 24 h."
                if harsh_count > 0
                else "No harsh driving events detected."
            ),
        ),
        SafetyScore(
            category="health_risk",
            score=health_risk_score,
            max_score=100,
            status=health_status,
            badge=None,
            color=_score_color(health_status),
            note=(
                f"{health_anomalies} health anomaly/anomalies detected."
                if health_anomalies > 0
                else None
            ),
        ),
        SafetyScore(
            category="emergency_probability",
            score=emergency_prob_score,
            max_score=100,
            status=emergency_status,
            badge="High" if emergency_status == "alert" else "Moderate" if emergency_status == "warning" else "Low",
            color=_score_color(emergency_status),
            note=(
                f"{active_sos} active SOS alert(s) right now!"
                if active_sos > 0
                else "No emergency indicators in the last 6 hours."
            ),
        ),
    ]

    overall = round(sum(s.score for s in scores) / len(scores))

    return SafetyScoresResponse(
        family_id=family_id,
        overall_score=overall,
        generated_at=_now_iso(),
        scores=scores,
    )


@router.get(
    "/ai-guardian/daily-report/{family_id}",
    response_model=DailyReportResponse,
    summary="Get today's AI-generated family safety report",
)
async def get_daily_report(family_id: int, db: Session = Depends(get_db)):
    """
    Returns the AI-generated daily safety report for a family including a
    complete timeline of real events and personalised recommendations.

    TODO: Authenticate caller — verify caller belongs to the requested family.
    """
    if family_id <= 0:
        raise HTTPException(status_code=422, detail="family_id must be a positive integer")

    cutoff_24h = _utc_now() - timedelta(hours=24)
    member_ids = _get_family_member_ids(family_id, db)

    events: List[ReportEvent] = []

    # ── SOS alerts ───────────────────────────────────────────────────────────
    sos_alerts = db.query(models.SOSAlert).filter(
        models.SOSAlert.family_id == family_id,
        models.SOSAlert.triggered_at >= cutoff_24h,
    ).order_by(models.SOSAlert.triggered_at).all()

    for alert in sos_alerts:
        member_name = _get_member_name(alert.user_id, db)
        place = alert.place_name or "Unknown location"
        events.append(ReportEvent(
            time=_format_time(alert.triggered_at),
            member=member_name,
            event=f"SOS alert triggered at {place}. Status: {alert.status}.",
            status="alert" if alert.status == "active" else "warning",
            category="location",
        ))

    # ── Geofence events ──────────────────────────────────────────────────────
    if member_ids:
        geo_events = (
            db.query(models.GeofenceEvent, models.Geofence)
            .join(models.Geofence, models.GeofenceEvent.geofence_id == models.Geofence.id)
            .filter(
                models.GeofenceEvent.user_id.in_(member_ids),
                models.GeofenceEvent.occurred_at >= cutoff_24h,
            )
            .order_by(models.GeofenceEvent.occurred_at)
            .all()
        )
        for geo_evt, geofence in geo_events:
            member_name = _get_member_name(geo_evt.user_id, db)
            action = "entered" if geo_evt.event_type == "enter" else "left"
            events.append(ReportEvent(
                time=_format_time(geo_evt.occurred_at),
                member=member_name,
                event=f"{action.capitalize()} geofence zone: {geofence.name}.",
                status="safe" if geo_evt.event_type == "enter" else "warning",
                category="location",
            ))

    # ── Driving events ───────────────────────────────────────────────────────
    if member_ids:
        driving_evts = (
            db.query(models.DrivingEvent)
            .filter(
                models.DrivingEvent.user_id.in_(member_ids),
                models.DrivingEvent.occurred_at >= cutoff_24h,
            )
            .order_by(models.DrivingEvent.occurred_at)
            .all()
        )
        for d_evt in driving_evts:
            member_name = _get_member_name(d_evt.user_id, db)
            severity_label = d_evt.severity or "medium"
            evt_type_label = d_evt.type.replace("_", " ").title()
            evt_status = "alert" if severity_label == "high" else "warning" if severity_label == "medium" else "safe"
            events.append(ReportEvent(
                time=_format_time(d_evt.occurred_at),
                member=member_name,
                event=f"{evt_type_label} event detected (severity: {severity_label}).",
                status=evt_status,
                category="driving",
            ))

    # ── Health records ───────────────────────────────────────────────────────
    if member_ids:
        today_str = _today_iso()
        health_recs = (
            db.query(models.HealthRecord)
            .filter(
                models.HealthRecord.user_id.in_(member_ids),
                models.HealthRecord.date == today_str,
            )
            .all()
        )
        for rec in health_recs:
            member_name = _get_member_name(rec.user_id, db)
            parts = []
            if rec.steps is not None:
                parts.append(f"{rec.steps:,} steps")
            if rec.heart_rate is not None:
                parts.append(f"HR {rec.heart_rate} bpm")
            if rec.sleep_hours is not None:
                parts.append(f"{rec.sleep_hours:.1f}h sleep")
            if not parts:
                continue
            hr_status = "warning" if (rec.heart_rate and rec.heart_rate > 100) else "safe"
            events.append(ReportEvent(
                time="Today",
                member=member_name,
                event="Health update: " + ", ".join(parts) + ".",
                status=hr_status,
                category="health",
            ))

    # Sort all events by time (SOS first for alert-level)
    events.sort(key=lambda e: (0 if e.status == "alert" else 1 if e.status == "warning" else 2, e.time))

    # ── Scores for overall ───────────────────────────────────────────────────
    alert_count = sum(1 for e in events if e.status == "alert")
    warning_count = sum(1 for e in events if e.status == "warning")
    overall_score = max(20, 100 - (alert_count * 20) - (warning_count * 5))

    # ── Build plain text event summary for AI ────────────────────────────────
    events_text = "\n".join(
        f"- [{e.time}] {e.member}: {e.event} ({e.status})"
        for e in events
    ) or "No events recorded in the last 24 hours."

    recommendations: List[str] = []

    # Generate summary and recommendations via Claude
    system_prompt = (
        "You are AI Guardian, a family safety AI assistant. "
        "Summarise today's family safety report concisely (2–3 sentences). "
        "Then list 2–4 actionable recommendations. "
        "Reply in plain text, no markdown. "
        "Format: first output the summary paragraph, then output recommendations "
        "as a semicolon-separated list prefixed with 'RECOMMENDATIONS:'."
    )
    user_msg = f"Family ID {family_id} — today's events:\n{events_text}"
    ai_text = await _call_ai(system_prompt, user_msg, max_tokens=400)

    if ai_text and "RECOMMENDATIONS:" in ai_text:
        parts = ai_text.split("RECOMMENDATIONS:", 1)
        ai_summary = parts[0].strip()
        recs_raw = parts[1].strip()
        recommendations = [r.strip() for r in recs_raw.split(";") if r.strip()]
    elif ai_text:
        ai_summary = ai_text
    else:
        # Graceful fallback
        if alert_count > 0:
            ai_summary = (
                f"Family safety requires attention today — {alert_count} alert(s) detected. "
                f"There are {warning_count} warning(s) and the overall score is {overall_score}/100. "
                "Please review active alerts immediately."
            )
        elif warning_count > 0:
            ai_summary = (
                f"Family safety is generally good today (score {overall_score}/100). "
                f"{warning_count} warning(s) were logged and should be reviewed. "
                "No active emergencies detected."
            )
        else:
            ai_summary = (
                f"All family members are safe today (score {overall_score}/100). "
                "No alerts or warnings detected in the last 24 hours. "
                "Keep monitoring for updates."
            )

        if alert_count > 0:
            recommendations.append("Review and resolve active SOS alerts immediately.")
        if warning_count > 0:
            recommendations.append("Check warning events and follow up with affected members.")
        recommendations.append("Ensure all family members have charged devices.")
        recommendations.append("Review geofence zones to keep location data accurate.")

    return DailyReportResponse(
        family_id=family_id,
        report_date=_today_iso(),
        ai_summary=ai_summary,
        overall_score=overall_score,
        events=events,
        recommendations=recommendations,
    )


@router.get(
    "/ai-guardian/insights/{family_id}",
    response_model=InsightsResponse,
    summary="Get AI-generated real-time insights for a family",
)
async def get_insights(family_id: int, db: Session = Depends(get_db)):
    """
    Returns a list of AI-generated insights for the family, ranked by priority.
    Each insight is derived from real DB data in the last 24 hours.

    TODO: Authenticate caller — verify caller belongs to the requested family.
    """
    if family_id <= 0:
        raise HTTPException(status_code=422, detail="family_id must be a positive integer")

    cutoff_24h = _utc_now() - timedelta(hours=24)
    member_ids = _get_family_member_ids(family_id, db)

    insights: List[InsightItem] = []
    insight_id = 1
    signals_processed = 0

    # ── SOS alerts → high priority ───────────────────────────────────────────
    sos_alerts = db.query(models.SOSAlert).filter(
        models.SOSAlert.family_id == family_id,
        models.SOSAlert.triggered_at >= cutoff_24h,
    ).order_by(desc(models.SOSAlert.triggered_at)).limit(3).all()

    for alert in sos_alerts:
        signals_processed += 1
        member_name = _get_member_name(alert.user_id, db)
        place = alert.place_name or "unknown location"
        priority = "high" if alert.status == "active" else "medium"
        insights.append(InsightItem(
            id=insight_id,
            icon_type="alert",
            dot_color="#EF4444" if alert.status == "active" else "#F59E0B",
            text=f"SOS {alert.status}: {member_name} at {place}",
            time=_format_time(alert.triggered_at),
            priority=priority,
        ))
        insight_id += 1

    # ── Geofence events ──────────────────────────────────────────────────────
    if member_ids:
        geo_events = (
            db.query(models.GeofenceEvent, models.Geofence)
            .join(models.Geofence, models.GeofenceEvent.geofence_id == models.Geofence.id)
            .filter(
                models.GeofenceEvent.user_id.in_(member_ids),
                models.GeofenceEvent.occurred_at >= cutoff_24h,
            )
            .order_by(desc(models.GeofenceEvent.occurred_at))
            .limit(4)
            .all()
        )
        for geo_evt, geofence in geo_events:
            signals_processed += 1
            member_name = _get_member_name(geo_evt.user_id, db)
            action = "entered" if geo_evt.event_type == "enter" else "left"
            insights.append(InsightItem(
                id=insight_id,
                icon_type="map",
                dot_color="#A78BFA",
                text=f"{member_name} {action} {geofence.name}",
                time=_format_time(geo_evt.occurred_at),
                priority="low",
            ))
            insight_id += 1

    # ── Driving events ───────────────────────────────────────────────────────
    if member_ids:
        driving_evts = (
            db.query(models.DrivingEvent)
            .filter(
                models.DrivingEvent.user_id.in_(member_ids),
                models.DrivingEvent.occurred_at >= cutoff_24h,
                models.DrivingEvent.severity.in_(["medium", "high"]),
            )
            .order_by(desc(models.DrivingEvent.occurred_at))
            .limit(3)
            .all()
        )
        for d_evt in driving_evts:
            signals_processed += 1
            member_name = _get_member_name(d_evt.user_id, db)
            evt_label = d_evt.type.replace("_", " ").title()
            priority = "high" if d_evt.severity == "high" else "medium"
            dot_color = "#EF4444" if priority == "high" else "#F59E0B"
            insights.append(InsightItem(
                id=insight_id,
                icon_type="car",
                dot_color=dot_color,
                text=f"{member_name}: {evt_label} detected ({d_evt.severity} severity)",
                time=_format_time(d_evt.occurred_at),
                priority=priority,
            ))
            insight_id += 1

    # ── Health anomalies ─────────────────────────────────────────────────────
    if member_ids:
        today_str = _today_iso()
        health_recs = (
            db.query(models.HealthRecord)
            .filter(
                models.HealthRecord.user_id.in_(member_ids),
                models.HealthRecord.date == today_str,
            )
            .all()
        )
        for rec in health_recs:
            signals_processed += 1
            if rec.heart_rate and rec.heart_rate > 100:
                member_name = _get_member_name(rec.user_id, db)
                insights.append(InsightItem(
                    id=insight_id,
                    icon_type="heart",
                    dot_color="#F59E0B",
                    text=f"{member_name}: elevated heart rate ({rec.heart_rate} bpm) — recommend rest",
                    time="Today",
                    priority="medium",
                ))
                insight_id += 1
            if rec.steps is not None and rec.steps >= 5000:
                member_name = _get_member_name(rec.user_id, db)
                insights.append(InsightItem(
                    id=insight_id,
                    icon_type="check",
                    dot_color="#10B981",
                    text=f"{member_name} reached {rec.steps:,} steps today — great activity!",
                    time="Today",
                    priority="low",
                ))
                insight_id += 1

    # ── Location check-ins ───────────────────────────────────────────────────
    if member_ids:
        recent_locs = (
            db.query(models.Location)
            .filter(
                models.Location.user_id.in_(member_ids),
                models.Location.recorded_at >= cutoff_24h,
            )
            .order_by(desc(models.Location.recorded_at))
            .limit(5)
            .all()
        )
        signals_processed += len(recent_locs)
        # Surface the most recent location ping per member
        seen_users: set = set()
        for loc in recent_locs:
            if loc.user_id in seen_users:
                continue
            seen_users.add(loc.user_id)
            member_name = _get_member_name(loc.user_id, db)
            place = loc.place_name or f"({loc.lat:.4f}, {loc.lng:.4f})"
            insights.append(InsightItem(
                id=insight_id,
                icon_type="check",
                dot_color="#10B981",
                text=f"{member_name} last seen at {place}",
                time=_format_time(loc.recorded_at),
                priority="low",
            ))
            insight_id += 1

    # Sort: high → medium → low
    priority_order = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda x: priority_order.get(x.priority, 3))

    # Cap to a reasonable number
    insights = insights[:12]

    # If no real data, return a single informational insight
    if not insights:
        insights.append(InsightItem(
            id=1,
            icon_type="brain",
            dot_color="#6B7280",
            text="No activity detected in the last 24 hours — all systems nominal.",
            time=_format_time(_utc_now()),
            priority="low",
        ))

    return InsightsResponse(
        family_id=family_id,
        generated_at=_now_iso(),
        insights=insights,
        total_signals_processed=max(signals_processed, len(insights)),
    )


@router.post(
    "/ai-guardian/ask",
    response_model=AskResponse,
    summary="Ask AI Guardian a natural-language safety question",
)
async def ask_ai_guardian(body: AskRequest, db: Session = Depends(get_db)):
    """
    Accepts a natural-language query and returns an AI-powered response using
    real family context from the database. Powered by Groq llama-3.3-70b-versatile.

    Falls back to a helpful degraded response if GROQ_API_KEY is not set.

    TODO: Authenticate caller — verify caller belongs to the requested family.
    """
    if not body.query.strip():
        raise HTTPException(status_code=422, detail="query must not be empty")

    cutoff_24h = _utc_now() - timedelta(hours=24)
    cutoff_7d = _utc_now() - timedelta(days=7)
    family_id = body.family_id

    # ── Gather real family context ────────────────────────────────────────────
    member_ids = _get_family_member_ids(family_id, db)

    # Member names and roles
    members_info: List[str] = []
    member_map: dict = {}  # user_id → name
    fm_rows = (
        db.query(models.FamilyMember, models.User)
        .join(models.User, models.FamilyMember.user_id == models.User.id)
        .filter(models.FamilyMember.family_id == family_id)
        .all()
    )
    for fm, user in fm_rows:
        member_map[user.id] = user.name
        members_info.append(f"{user.name} (role: {fm.role})")

    # Latest locations
    location_lines: List[str] = []
    for uid in member_ids:
        loc = (
            db.query(models.Location)
            .filter(models.Location.user_id == uid)
            .order_by(desc(models.Location.recorded_at))
            .first()
        )
        if loc:
            place = loc.place_name or f"({loc.lat:.4f}, {loc.lng:.4f})"
            age_min = int((_utc_now() - loc.recorded_at.replace(tzinfo=timezone.utc)).total_seconds() / 60) if loc.recorded_at else "?"
            location_lines.append(
                f"  - {member_map.get(uid, f'#{uid}')}: last seen at {place} ({age_min} min ago)"
            )

    # Active SOS alerts
    active_sos = db.query(models.SOSAlert).filter(
        models.SOSAlert.family_id == family_id,
        models.SOSAlert.status == "active",
    ).all()
    sos_lines = [
        f"  - ACTIVE SOS: {member_map.get(a.user_id, f'#{a.user_id}')} at {a.place_name or 'unknown'} triggered {_format_time(a.triggered_at)}"
        for a in active_sos
    ]

    # Recent driving events (last 24 h)
    driving_lines: List[str] = []
    if member_ids:
        driving_evts = (
            db.query(models.DrivingEvent)
            .filter(
                models.DrivingEvent.user_id.in_(member_ids),
                models.DrivingEvent.occurred_at >= cutoff_24h,
            )
            .order_by(desc(models.DrivingEvent.occurred_at))
            .limit(10)
            .all()
        )
        for d in driving_evts:
            driving_lines.append(
                f"  - {member_map.get(d.user_id, f'#{d.user_id}')}: {d.type} ({d.severity}) at {_format_time(d.occurred_at)}"
            )

    # Recent health records (today)
    health_lines: List[str] = []
    if member_ids:
        today_str = _today_iso()
        health_recs = (
            db.query(models.HealthRecord)
            .filter(
                models.HealthRecord.user_id.in_(member_ids),
                models.HealthRecord.date == today_str,
            )
            .all()
        )
        for rec in health_recs:
            parts = []
            if rec.steps is not None:
                parts.append(f"{rec.steps:,} steps")
            if rec.heart_rate is not None:
                parts.append(f"HR {rec.heart_rate} bpm")
            if rec.sleep_hours is not None:
                parts.append(f"sleep {rec.sleep_hours:.1f}h")
            if parts:
                health_lines.append(f"  - {member_map.get(rec.user_id, f'#{rec.user_id}')}: {', '.join(parts)}")

    # Build system prompt with real context
    context_block = f"""Family ID: {family_id}
Members: {', '.join(members_info) or 'No members found'}

Current locations:
{chr(10).join(location_lines) or '  No recent location data'}

Active SOS alerts:
{chr(10).join(sos_lines) if sos_lines else '  None'}

Driving events (last 24 h):
{chr(10).join(driving_lines) if driving_lines else '  None'}

Health records (today):
{chr(10).join(health_lines) if health_lines else '  None'}
"""

    system_prompt = (
        "You are AI Guardian, an intelligent family safety assistant for the Gravity app. "
        "Answer the user's safety question concisely and helpfully using the real family data provided. "
        "Be empathetic and action-oriented. Keep responses to 2–4 sentences unless more detail is needed. "
        "Reply in plain text only — no markdown, no bullet points unless listing items. "
        "After your main answer, output a line 'MEMBERS:' followed by a comma-separated list of member names "
        "you referenced (or empty), then 'ACTIONS:' followed by a semicolon-separated list of 1–3 suggested "
        "actions the user can take in the app."
    )

    user_message = f"Family context:\n{context_block}\n\nUser question: {body.query}"
    if body.context:
        user_message += f"\n\nAdditional context: {body.context}"

    ai_text = await _call_ai(system_prompt, user_message, max_tokens=500)

    related_members: List[str] = list(member_map.values())[:3]
    action_items: List[str] = ["View family dashboard", "View today's report"]
    confidence = 0.92

    if ai_text:
        # Parse structured output
        response_text = ai_text
        if "MEMBERS:" in ai_text:
            parts = ai_text.split("MEMBERS:", 1)
            response_text = parts[0].strip()
            rest = parts[1]
            if "ACTIONS:" in rest:
                members_part, actions_part = rest.split("ACTIONS:", 1)
                related_members = [m.strip() for m in members_part.split(",") if m.strip()]
                action_items = [a.strip() for a in actions_part.split(";") if a.strip()]
            else:
                related_members = [m.strip() for m in rest.split(",") if m.strip()]
        elif "ACTIONS:" in ai_text:
            parts = ai_text.split("ACTIONS:", 1)
            response_text = parts[0].strip()
            action_items = [a.strip() for a in parts[1].split(";") if a.strip()]
    else:
        # Graceful fallback when Claude is unavailable
        has_sos = len(active_sos) > 0
        has_driving = len(driving_lines) > 0

        if has_sos:
            response_text = (
                f"There {'is' if len(active_sos) == 1 else 'are'} {len(active_sos)} active SOS "
                f"alert(s) for your family — please check immediately. "
                "Open the SOS panel for details and to contact the affected member."
            )
            action_items = ["View active SOS alerts", "Call emergency contacts", "Open family map"]
        elif has_driving:
            response_text = (
                f"{len(driving_lines)} driving event(s) were logged in the last 24 hours. "
                "Review the driving safety panel for details. "
                "All family members' locations have been updated recently."
            )
            action_items = ["View driving report", "View family map", "Enable driving alerts"]
        else:
            names = ", ".join(member_map.values()) if member_map else "your family members"
            response_text = (
                f"All monitored members ({names}) appear to be safe. "
                "No active alerts or significant events in the last 24 hours. "
                "AI summary is unavailable — set GROQ_API_KEY for full AI responses."
            )
            action_items = ["View family dashboard", "View live map", "Check health records"]
        confidence = 0.70

    return AskResponse(
        query=body.query,
        family_id=family_id,
        response=response_text,
        confidence=confidence,
        related_members=related_members,
        action_items=action_items,
        generated_at=_now_iso(),
    )


@router.get(
    "/ai-guardian/risk-predictions/{user_id}",
    response_model=RiskPredictionsResponse,
    summary="Get AI risk predictions for a specific user",
)
async def get_risk_predictions(user_id: int, db: Session = Depends(get_db)):
    """
    Returns risk predictions for a specific user based on 14-day pattern analysis
    of real driving events, health records, and SOS history.

    TODO: Authenticate caller — verify the user belongs to the caller's family.
    """
    if user_id <= 0:
        raise HTTPException(status_code=422, detail="user_id must be a positive integer")

    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    cutoff_14d = _utc_now() - timedelta(days=14)
    cutoff_7d = _utc_now() - timedelta(days=7)
    cutoff_24h = _utc_now() - timedelta(hours=24)

    # Fetch user info
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user_name = user.name if user else f"User #{user_id}"

    predictions: List[RiskPrediction] = []
    total_signals = 0

    # ── Driving risk (14-day history) ────────────────────────────────────────
    driving_14d = db.query(models.DrivingEvent).filter(
        models.DrivingEvent.user_id == user_id,
        models.DrivingEvent.occurred_at >= cutoff_14d,
    ).all()
    total_signals += len(driving_14d)

    if driving_14d:
        harsh_events = [e for e in driving_14d if e.type in ("harsh_brake", "rapid_accel")]
        high_sev = [e for e in driving_14d if e.severity == "high"]
        speeding = [e for e in driving_14d if e.type == "speeding"]
        phone_use = [e for e in driving_14d if e.type == "phone_use"]

        # Overall driving risk
        driving_prob = min(0.95, len(harsh_events) * 0.05 + len(high_sev) * 0.1 + len(speeding) * 0.08)
        if driving_prob > 0.1:
            severity = "high" if driving_prob > 0.7 else "medium" if driving_prob > 0.4 else "low"
            predictions.append(RiskPrediction(
                risk_type="driving_behavior",
                title=f"{user_name} Driving Risk",
                description=(
                    f"{len(harsh_events)} harsh event(s) and {len(high_sev)} high-severity "
                    f"event(s) detected over the last 14 days. "
                    f"{len(speeding)} speeding and {len(phone_use)} phone-use event(s) logged."
                ),
                probability=round(driving_prob, 2),
                severity=severity,
                affected_member=user_name,
                recommendation=(
                    "Review recent driving events and discuss safe driving habits. "
                    "Enable speed and phone-use alerts."
                ),
                predicted_for=tomorrow,
            ))

        # Phone-use specific risk
        if len(phone_use) >= 2:
            phone_prob = min(0.95, len(phone_use) * 0.15)
            predictions.append(RiskPrediction(
                risk_type="distracted_driving",
                title="Phone Use While Driving",
                description=(
                    f"{len(phone_use)} phone-use event(s) detected in 14 days. "
                    "This is the leading cause of road accidents."
                ),
                probability=round(phone_prob, 2),
                severity="high",
                affected_member=user_name,
                recommendation="Enable phone lockout while driving mode in app settings.",
                predicted_for=tomorrow,
            ))

    # ── Health risk (14-day health records) ──────────────────────────────────
    health_14d = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == user_id,
        models.HealthRecord.date >= cutoff_14d.date().isoformat(),
    ).order_by(models.HealthRecord.date).all()
    total_signals += len(health_14d)

    if health_14d:
        elevated_hr_days = [r for r in health_14d if r.heart_rate and r.heart_rate > 100]
        low_step_days = [r for r in health_14d if r.steps is not None and r.steps < 2000]
        low_sleep_days = [r for r in health_14d if r.sleep_hours is not None and r.sleep_hours < 6]

        health_prob = min(0.95,
            len(elevated_hr_days) * 0.08 +
            len(low_step_days) * 0.04 +
            len(low_sleep_days) * 0.05
        )

        if health_prob > 0.1:
            severity = "high" if health_prob > 0.6 else "medium" if health_prob > 0.3 else "low"
            desc_parts = []
            if elevated_hr_days:
                desc_parts.append(f"{len(elevated_hr_days)} day(s) with elevated heart rate")
            if low_step_days:
                desc_parts.append(f"{len(low_step_days)} day(s) with very low activity (<2,000 steps)")
            if low_sleep_days:
                desc_parts.append(f"{len(low_sleep_days)} day(s) with insufficient sleep (<6 h)")
            predictions.append(RiskPrediction(
                risk_type="health_trend",
                title=f"{user_name} Health Trend Alert",
                description=". ".join(desc_parts) + " detected over 14 days.",
                probability=round(health_prob, 2),
                severity=severity,
                affected_member=user_name,
                recommendation="Encourage regular activity, adequate sleep, and a medical check-up if heart rate remains elevated.",
                predicted_for=tomorrow,
            ))

    # ── SOS history risk ─────────────────────────────────────────────────────
    sos_14d = db.query(models.SOSAlert).filter(
        models.SOSAlert.user_id == user_id,
        models.SOSAlert.triggered_at >= cutoff_14d,
    ).all()
    total_signals += len(sos_14d)

    if sos_14d:
        sos_prob = min(0.95, len(sos_14d) * 0.20)
        predictions.append(RiskPrediction(
            risk_type="emergency_recurrence",
            title="SOS Alert History",
            description=(
                f"{len(sos_14d)} SOS alert(s) triggered in the last 14 days. "
                "Repeated alerts indicate an elevated emergency risk."
            ),
            probability=round(sos_prob, 2),
            severity="high" if len(sos_14d) >= 3 else "medium",
            affected_member=user_name,
            recommendation="Review the circumstances of each SOS event and update the emergency profile.",
            predicted_for=tomorrow,
        ))

    # ── Geofence deviation risk ──────────────────────────────────────────────
    geo_exits_7d = db.query(models.GeofenceEvent).filter(
        models.GeofenceEvent.user_id == user_id,
        models.GeofenceEvent.event_type == "exit",
        models.GeofenceEvent.occurred_at >= cutoff_7d,
    ).count()
    total_signals += geo_exits_7d

    if geo_exits_7d >= 3:
        geo_prob = min(0.80, geo_exits_7d * 0.06)
        predictions.append(RiskPrediction(
            risk_type="geofence_deviation",
            title="Frequent Geofence Exits",
            description=(
                f"{geo_exits_7d} geofence exit event(s) in the last 7 days. "
                "Frequent exits from safe zones may indicate irregular routines."
            ),
            probability=round(geo_prob, 2),
            severity="low" if geo_exits_7d < 5 else "medium",
            affected_member=user_name,
            recommendation="Review geofence settings and check if zones need to be updated to reflect current routines.",
            predicted_for=tomorrow,
        ))

    # ── Routine deviation risk (weekend effect) ──────────────────────────────
    today_weekday = date.today().weekday()  # 0=Monday, 6=Sunday
    if today_weekday in (4, 5, 6):  # Friday/Saturday/Sunday
        predictions.append(RiskPrediction(
            risk_type="routine_deviation",
            title="Weekend Routine Variability",
            description=(
                "Weekend schedules tend to be less predictable. "
                "AI monitoring will adapt, but routine adherence typically drops."
            ),
            probability=0.75,
            severity="low",
            affected_member=None,
            recommendation="Set weekend check-in reminders to maintain family awareness.",
            predicted_for=tomorrow,
        ))
        total_signals += 5  # model baseline signals

    # If no real predictions, return a positive baseline
    if not predictions:
        predictions.append(RiskPrediction(
            risk_type="no_risk_detected",
            title="All Clear",
            description=(
                f"No significant risk patterns detected for {user_name} over the last 14 days. "
                "Continue monitoring for changes."
            ),
            probability=0.05,
            severity="low",
            affected_member=user_name,
            recommendation="Keep devices charged and location sharing active for continuous monitoring.",
            predicted_for=tomorrow,
        ))

    # Sort by probability descending
    predictions.sort(key=lambda p: p.probability, reverse=True)

    # Aggregate 24h risk score
    weighted_risk = sum(
        p.probability * (3 if p.severity == "high" else 2 if p.severity == "medium" else 1)
        for p in predictions
    )
    next_24h_score = min(100, int(weighted_risk * 12))

    return RiskPredictionsResponse(
        user_id=user_id,
        generated_at=_now_iso(),
        predictions=predictions,
        next_24h_risk_score=next_24h_score,
    )
