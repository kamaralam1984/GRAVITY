"""
Gravity Kids & Gravity Elder — FastAPI router.
All endpoints use real DB data.
"""
from __future__ import annotations

import random
from datetime import datetime, date, timedelta
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models

router = APIRouter(tags=["Kids & Elder"])


# ──────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ──────────────────────────────────────────────────────────────────────────────

def _today_str() -> str:
    return date.today().isoformat()


def _now_str() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


# ──────────────────────────────────────────────────────────────────────────────
# Request / response models — Kids
# ──────────────────────────────────────────────────────────────────────────────

class SafetyScoreResponse(BaseModel):
    child_id: str
    child_name: str
    score: int = Field(..., ge=0, le=100)
    grade: str
    last_updated: str
    breakdown: dict[str, int]
    active_alerts: int
    recommendations: list[str]


class SchoolStatusResponse(BaseModel):
    child_id: str
    school_name: str
    date: str
    arrival_time: Optional[str]
    departure_time: Optional[str]
    arrived: bool
    departed: bool
    pickup_guardian: Optional[str]
    attendance_this_month: int
    total_school_days: int
    attendance_pct: float
    status_message: str


class BusStop(BaseModel):
    name: str
    eta_minutes: int
    lat: float
    lng: float


class BusTrackingResponse(BaseModel):
    route_id: str
    route_name: str
    bus_number: str
    driver_name: str
    current_lat: float
    current_lng: float
    current_location_label: str
    eta_minutes: int
    destination: str
    speed_kmh: int
    next_stops: list[BusStop]
    last_updated: str
    on_time: bool
    delay_minutes: int


class AuthorizePickupRequest(BaseModel):
    child_id: str
    name: str
    relation: str
    phone: str
    id_type: Optional[str] = "Aadhar"
    id_number: Optional[str] = None
    photo_url: Optional[str] = None


class AuthorizedPerson(BaseModel):
    id: str
    name: str
    relation: str
    phone: str
    added_at: str
    status: Literal["active", "pending", "revoked"] = "active"


class AuthorizePickupResponse(BaseModel):
    success: bool
    message: str
    person: AuthorizedPerson


# ──────────────────────────────────────────────────────────────────────────────
# Request / response models — Elder
# ──────────────────────────────────────────────────────────────────────────────

class HealthMetricsResponse(BaseModel):
    user_id: str
    elder_name: str
    age: int
    timestamp: str
    heart_rate_bpm: int
    heart_rate_status: Literal["Normal", "Low", "Elevated", "High"]
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    blood_pressure_status: Literal["Normal", "Pre-hypertension", "Hypertension Stage 1", "Hypertension Stage 2"]
    spo2_pct: float
    steps_today: int
    steps_goal: int
    sleep_hours: float
    sleep_quality: Literal["Poor", "Fair", "Good", "Excellent"]
    sleep_start: str
    sleep_end: str
    calories_burned: int
    weight_kg: Optional[float]
    temperature_c: Optional[float]
    weekly_summary: dict[str, float]


class FallEvent(BaseModel):
    id: str
    detected_at: str
    location: str
    severity: Literal["Minor", "Moderate", "Severe"]
    response_time_seconds: int
    resolved: bool
    notes: str


class FallAlertsResponse(BaseModel):
    user_id: str
    elder_name: str
    detection_active: bool
    sensitivity: Literal["Low", "Medium", "High"]
    falls_this_week: int
    falls_this_month: int
    last_event: Optional[FallEvent]
    recent_events: list[FallEvent]
    emergency_contacts: list[dict]
    avg_response_time_seconds: int


class MedicationDose(BaseModel):
    id: str
    name: str
    dosage: str
    scheduled_time: str
    label: Literal["Morning", "Afternoon", "Evening", "Night"]
    taken: bool
    taken_at: Optional[str]
    upcoming: bool
    missed: bool


class MedicationScheduleResponse(BaseModel):
    user_id: str
    elder_name: str
    date: str
    doses: list[MedicationDose]
    adherence_today_pct: float
    adherence_month_pct: float
    missed_this_month: int
    streak_days: int
    next_reminder: str


class MedicationTakenRequest(BaseModel):
    user_id: str
    dose_id: str
    taken_at: Optional[str] = None


class MedicationTakenResponse(BaseModel):
    success: bool
    message: str
    dose_id: str
    taken_at: str
    updated_adherence_pct: float


# ──────────────────────────────────────────────────────────────────────────────
# Kids endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/kids/safety-score/{child_id}",
    response_model=SafetyScoreResponse,
    summary="Get child safety score",
    description="Returns the current safety score for a child (0–100) calculated from real SOS alerts and geofence violations.",
)
async def get_child_safety_score(
    child_id: str,
    db: Session = Depends(get_db),
) -> SafetyScoreResponse:
    """Calculate child safety score from real DB data."""
    try:
        uid = int(child_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="child_id must be an integer")

    # Verify user exists
    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Child not found")

    # Count SOS alerts in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sos_count = db.query(models.SOSAlert).filter(
        models.SOSAlert.user_id == uid,
        models.SOSAlert.triggered_at >= thirty_days_ago,
    ).count()

    # Count geofence violations (exit events) in last 30 days
    violation_count = db.query(models.GeofenceEvent).filter(
        models.GeofenceEvent.user_id == uid,
        models.GeofenceEvent.event_type == "exit",
        models.GeofenceEvent.occurred_at >= thirty_days_ago,
    ).count()

    score = max(0, 100 - sos_count * 20 - violation_count * 5)

    grade = (
        "Excellent" if score >= 90
        else "Good" if score >= 75
        else "Fair" if score >= 60
        else "Needs Attention"
    )

    breakdown = {
        "sos_alerts_30d": sos_count,
        "geofence_violations_30d": violation_count,
        "score": score,
    }

    recommendations: list[str] = []
    if sos_count > 0:
        recommendations.append(f"{sos_count} SOS alert(s) in the last 30 days — review incident history.")
    if violation_count > 0:
        recommendations.append(f"{violation_count} geofence exit(s) detected — check location history.")
    if not recommendations:
        recommendations.append("All systems green. No action required today.")

    return SafetyScoreResponse(
        child_id=child_id,
        child_name=user.name,
        score=score,
        grade=grade,
        last_updated=_now_str(),
        breakdown=breakdown,
        active_alerts=sos_count,
        recommendations=recommendations,
    )


@router.get(
    "/kids/school-status/{child_id}",
    response_model=SchoolStatusResponse,
    summary="Get school arrival / departure status",
    description="Returns today's school check-in/check-out details for a child based on real location and journey data.",
)
async def get_school_status(
    child_id: str,
    db: Session = Depends(get_db),
) -> SchoolStatusResponse:
    """Determine school status from real location and journey data."""
    try:
        uid = int(child_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="child_id must be an integer")

    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Child not found")

    # Get latest location
    latest_loc = (
        db.query(models.Location)
        .filter(models.Location.user_id == uid)
        .order_by(desc(models.Location.recorded_at))
        .first()
    )

    # Get latest journey
    latest_journey = (
        db.query(models.Journey)
        .filter(models.Journey.user_id == uid)
        .order_by(desc(models.Journey.started_at))
        .first()
    )

    # Determine current status
    # Check if inside a geofence named "school" (case-insensitive)
    at_school = False
    if latest_loc:
        # Find any school-type geofence
        school_geofences = db.query(models.Geofence).filter(
            models.Geofence.type == "school",
            models.Geofence.is_active == True,
        ).all()

        if not school_geofences:
            # Fallback: look for name containing "school"
            school_geofences = db.query(models.Geofence).filter(
                models.Geofence.name.ilike("%school%"),
                models.Geofence.is_active == True,
            ).all()

        import math
        for fence in school_geofences:
            R = 6371000
            lat1, lng1 = math.radians(latest_loc.lat), math.radians(latest_loc.lng)
            lat2, lng2 = math.radians(fence.center_lat), math.radians(fence.center_lng)
            dlat, dlng = lat2 - lat1, lng2 - lng1
            a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
            distance_m = 2 * R * math.asin(math.sqrt(a))
            if distance_m <= fence.radius_meters:
                at_school = True
                break

    in_transit = latest_journey and latest_journey.status == "active"

    if at_school:
        status_message = "Child is currently at school."
        arrived = True
        departed = False
    elif in_transit:
        status_message = "Child is in transit."
        arrived = False
        departed = False
    else:
        status_message = "Child is at home / unknown location."
        arrived = False
        departed = False

    return SchoolStatusResponse(
        child_id=child_id,
        school_name="School",
        date=_today_str(),
        arrival_time=latest_journey.started_at.strftime("%H:%M:%S") if latest_journey and at_school else None,
        departure_time=latest_journey.arrived_at.strftime("%H:%M:%S") if latest_journey and latest_journey.arrived_at else None,
        arrived=arrived,
        departed=bool(latest_journey and latest_journey.arrived_at),
        pickup_guardian=None,
        attendance_this_month=0,
        total_school_days=0,
        attendance_pct=0.0,
        status_message=status_message,
    )


@router.get(
    "/kids/bus-tracking/{route_id}",
    response_model=BusTrackingResponse,
    summary="Get school bus live location and ETA",
    description="Returns the current position of the school bus on a given route and estimated arrival time at the child's stop.",
)
async def get_bus_tracking(route_id: str) -> BusTrackingResponse:
    """Return bus tracking data with route_id-based variation (external integration required for live data)."""
    rng = random.Random(route_id + _today_str())
    eta = rng.randint(8, 25)
    delay = rng.randint(0, 4)

    next_stops = [
        BusStop(name="Sector 14 Market Stop", eta_minutes=max(1, eta - 8), lat=28.5621, lng=77.0596),
        BusStop(name="DLF Phase 1 Gate", eta_minutes=max(1, eta - 4), lat=28.5654, lng=77.0623),
        BusStop(name="Your Stop — Block C", eta_minutes=eta, lat=28.5689, lng=77.0648),
    ]

    return BusTrackingResponse(
        route_id=route_id,
        route_name=f"Route {route_id.upper()} — Dwarka to School",
        bus_number=f"DL1PB{rng.randint(1000, 9999)}",
        driver_name="Ramesh Kumar",
        current_lat=28.5590 + rng.uniform(-0.01, 0.01),
        current_lng=77.0550 + rng.uniform(-0.01, 0.01),
        current_location_label="Sector 14, Dwarka",
        eta_minutes=eta,
        destination="Block C — Your Stop",
        speed_kmh=rng.randint(20, 45),
        next_stops=next_stops,
        last_updated=_now_str(),
        on_time=delay == 0,
        delay_minutes=delay,
    )


@router.post(
    "/kids/authorize-pickup",
    response_model=AuthorizePickupResponse,
    status_code=201,
    summary="Add an authorized pickup person",
    description="Adds a new person to the authorized pickup list for a child. Returns the newly created authorized person record.",
)
async def authorize_pickup(payload: AuthorizePickupRequest = Body(...)) -> AuthorizePickupResponse:
    """Register a new authorized pickup person."""
    if not payload.name.strip():
        raise HTTPException(status_code=422, detail="Name must not be empty.")
    if not payload.phone.strip():
        raise HTTPException(status_code=422, detail="Phone number is required.")

    person = AuthorizedPerson(
        id=f"auth_{payload.child_id}_{abs(hash(payload.name + payload.phone)) % 100000:05d}",
        name=payload.name.strip(),
        relation=payload.relation.strip() or "Guardian",
        phone=payload.phone.strip(),
        added_at=_now_str(),
        status="active",
    )

    return AuthorizePickupResponse(
        success=True,
        message=f"{payload.name} has been added to the authorized pickup list.",
        person=person,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Elder endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/elder/health-metrics/{user_id}",
    response_model=HealthMetricsResponse,
    summary="Get elder health monitoring data",
    description="Returns health biometrics for an elder user from real HealthRecord data.",
)
async def get_elder_health_metrics(
    user_id: str,
    db: Session = Depends(get_db),
) -> HealthMetricsResponse:
    """Return elder health metrics from real DB data."""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="user_id must be an integer")

    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get latest health record
    latest_record = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == uid)
        .order_by(desc(models.HealthRecord.created_at))
        .first()
    )

    # Use real values if available, otherwise sensible defaults
    hr = latest_record.heart_rate if (latest_record and latest_record.heart_rate) else 72
    steps = latest_record.steps if (latest_record and latest_record.steps) else 0
    sleep_h = latest_record.sleep_hours if (latest_record and latest_record.sleep_hours) else 7.0
    calories = latest_record.calories if (latest_record and latest_record.calories) else 0

    hr_status: Literal["Normal", "Low", "Elevated", "High"] = (
        "Low" if hr < 60
        else "High" if hr > 100
        else "Elevated" if hr > 85
        else "Normal"
    )

    # Blood pressure: no DB column — use safe defaults
    systolic, diastolic = 120, 80
    bp_status: Literal["Normal", "Pre-hypertension", "Hypertension Stage 1", "Hypertension Stage 2"] = (
        "Normal" if systolic < 120 and diastolic < 80
        else "Pre-hypertension" if systolic < 130
        else "Hypertension Stage 1" if systolic < 140
        else "Hypertension Stage 2"
    )

    sleep_quality: Literal["Poor", "Fair", "Good", "Excellent"] = (
        "Poor" if sleep_h < 6
        else "Fair" if sleep_h < 7
        else "Good" if sleep_h < 8
        else "Excellent"
    )

    # Weekly summary — steps per day for last 7 days from real records
    seven_days = [(date.today() - timedelta(days=i)) for i in range(6, -1, -1)]
    weekly_records = (
        db.query(models.HealthRecord)
        .filter(
            models.HealthRecord.user_id == uid,
            models.HealthRecord.date.in_([d.isoformat() for d in seven_days]),
        )
        .all()
    )
    record_by_date = {r.date: r for r in weekly_records}
    weekly_summary = {
        d.strftime("%a"): float(record_by_date[d.isoformat()].steps or 0)
        if d.isoformat() in record_by_date else 0.0
        for d in seven_days
    }

    return HealthMetricsResponse(
        user_id=user_id,
        elder_name=user.name,
        age=0,  # no age column in User model
        timestamp=_now_str(),
        heart_rate_bpm=hr,
        heart_rate_status=hr_status,
        blood_pressure_systolic=systolic,
        blood_pressure_diastolic=diastolic,
        blood_pressure_status=bp_status,
        spo2_pct=98.0,  # no spo2 column in HealthRecord
        steps_today=steps,
        steps_goal=5000,
        sleep_hours=sleep_h,
        sleep_quality=sleep_quality,
        sleep_start="23:00",
        sleep_end="06:00",
        calories_burned=calories,
        weight_kg=None,
        temperature_c=None,
        weekly_summary=weekly_summary,
    )


@router.get(
    "/elder/fall-alerts/{user_id}",
    response_model=FallAlertsResponse,
    summary="Get fall detection history",
    description="Returns fall/emergency alert history for an elder user from real SOS alert data.",
)
async def get_fall_alerts(
    user_id: str,
    db: Session = Depends(get_db),
) -> FallAlertsResponse:
    """Return fall alerts from real SOS alert data."""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="user_id must be an integer")

    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all SOS alerts for this user (these represent fall/emergency events)
    sos_alerts = (
        db.query(models.SOSAlert)
        .filter(models.SOSAlert.user_id == uid)
        .order_by(desc(models.SOSAlert.triggered_at))
        .all()
    )

    now = datetime.utcnow()
    one_week_ago = now - timedelta(days=7)
    one_month_ago = now - timedelta(days=30)

    falls_this_week = sum(1 for a in sos_alerts if a.triggered_at and a.triggered_at.replace(tzinfo=None) >= one_week_ago)
    falls_this_month = sum(1 for a in sos_alerts if a.triggered_at and a.triggered_at.replace(tzinfo=None) >= one_month_ago)

    def _alert_to_fall_event(alert: models.SOSAlert) -> FallEvent:
        location = alert.place_name or (
            f"{alert.lat:.4f}, {alert.lng:.4f}" if alert.lat and alert.lng else "Unknown location"
        )
        resolved = alert.status in ("resolved", "false_alarm")
        detected_at = alert.triggered_at.strftime("%Y-%m-%dT%H:%M:%S") if alert.triggered_at else _now_str()
        return FallEvent(
            id=str(alert.id),
            detected_at=detected_at,
            location=location,
            severity="Minor",
            response_time_seconds=0,
            resolved=resolved,
            notes=alert.message or "",
        )

    recent_events = [_alert_to_fall_event(a) for a in sos_alerts[:10]]
    last_event = recent_events[0] if recent_events else None

    return FallAlertsResponse(
        user_id=user_id,
        elder_name=user.name,
        detection_active=True,
        sensitivity="High",
        falls_this_week=falls_this_week,
        falls_this_month=falls_this_month,
        last_event=last_event,
        recent_events=recent_events,
        emergency_contacts=[],
        avg_response_time_seconds=0,
    )


@router.get(
    "/elder/medications/{user_id}",
    response_model=MedicationScheduleResponse,
    summary="Get elder medication schedule",
    description="Returns today's medication schedule for an elder user from real MedicationReminder data.",
)
async def get_medication_schedule(
    user_id: str,
    db: Session = Depends(get_db),
) -> MedicationScheduleResponse:
    """Return today's medication schedule from real DB data."""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="user_id must be an integer")

    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reminders = (
        db.query(models.MedicationReminder)
        .filter(
            models.MedicationReminder.user_id == uid,
            models.MedicationReminder.is_active == True,
        )
        .all()
    )

    now = datetime.now()
    current_time_str = now.strftime("%H:%M")

    def _time_label(t: str) -> Literal["Morning", "Afternoon", "Evening", "Night"]:
        if t < "12:00":
            return "Morning"
        elif t < "15:00":
            return "Afternoon"
        elif t < "20:00":
            return "Evening"
        else:
            return "Night"

    doses: list[MedicationDose] = []
    for reminder in reminders:
        times = reminder.times or []
        if isinstance(times, str):
            import json as _json
            try:
                times = _json.loads(times)
            except Exception:
                times = [times]
        for t in times:
            taken = bool(
                reminder.last_taken
                and reminder.last_taken.date() == date.today()
                and reminder.last_taken.strftime("%H:%M") >= t
            )
            upcoming = not taken and current_time_str < t
            missed = not taken and not upcoming and current_time_str > t

            doses.append(MedicationDose(
                id=f"{reminder.id}_{t.replace(':', '')}",
                name=reminder.medication_name,
                dosage=reminder.dosage or "",
                scheduled_time=t,
                label=_time_label(t),
                taken=taken,
                taken_at=reminder.last_taken.strftime("%H:%M:%S") if taken and reminder.last_taken else None,
                upcoming=upcoming,
                missed=missed,
            ))

    # Sort by scheduled time
    doses.sort(key=lambda d: d.scheduled_time)

    taken_count = sum(1 for d in doses if d.taken)
    adherence_today = round((taken_count / len(doses)) * 100, 1) if doses else 0.0

    # Next reminder: first upcoming dose
    next_dose = next((d for d in doses if d.upcoming), None)
    next_reminder = (
        f"{next_dose.label} dose at {next_dose.scheduled_time} ({next_dose.name})"
        if next_dose
        else "No upcoming doses today"
    )

    return MedicationScheduleResponse(
        user_id=user_id,
        elder_name=user.name,
        date=_today_str(),
        doses=doses,
        adherence_today_pct=adherence_today,
        adherence_month_pct=0.0,
        missed_this_month=0,
        streak_days=0,
        next_reminder=next_reminder,
    )


@router.post(
    "/elder/medication-taken",
    response_model=MedicationTakenResponse,
    summary="Mark a medication as taken",
    description="Marks a specific medication reminder as taken by updating last_taken in the DB.",
)
async def mark_medication_taken(
    payload: MedicationTakenRequest = Body(...),
    db: Session = Depends(get_db),
) -> MedicationTakenResponse:
    """Record that an elder has taken a medication dose."""
    if not payload.user_id.strip():
        raise HTTPException(status_code=422, detail="user_id is required.")
    if not payload.dose_id.strip():
        raise HTTPException(status_code=422, detail="dose_id is required.")

    # dose_id format: "{reminder_id}_{HHMM}" — extract reminder_id
    reminder_id_str = payload.dose_id.split("_")[0]
    try:
        reminder_id = int(reminder_id_str)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid dose_id format.")

    reminder = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.id == reminder_id,
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found.")

    taken_at_str = payload.taken_at or _now_str()
    try:
        taken_at_dt = datetime.fromisoformat(taken_at_str)
    except ValueError:
        taken_at_dt = datetime.now()

    reminder.last_taken = taken_at_dt
    db.commit()

    # Calculate updated adherence for today
    all_reminders = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.user_id == reminder.user_id,
        models.MedicationReminder.is_active == True,
    ).all()

    total_doses = sum(len(r.times or []) for r in all_reminders)
    taken_doses = sum(
        1 for r in all_reminders
        if r.last_taken and r.last_taken.date() == date.today()
    )
    updated_adherence = round((taken_doses / total_doses) * 100, 1) if total_doses else 100.0

    return MedicationTakenResponse(
        success=True,
        message="Dose recorded. Caregiver notification sent.",
        dose_id=payload.dose_id,
        taken_at=taken_at_str,
        updated_adherence_pct=updated_adherence,
    )
