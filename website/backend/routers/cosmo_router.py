"""Cosmo AI Integration — AI Dashcam, Driver Behavior Analysis."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, os
from auth import get_current_user
from datetime import datetime

router = APIRouter()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY", "")

class DashcamEventCreate(BaseModel):
    vehicle_id: Optional[int] = None
    event_type: str
    severity: str = "medium"
    confidence: float = 0.9
    lat: Optional[float] = None
    lng: Optional[float] = None
    speed_at_event: Optional[float] = None
    image_url: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    event_id: Optional[int] = None
    event_type: str
    severity: str
    speed: Optional[float] = None
    context: Optional[str] = None

# ── Dashcam Events ────────────────────────────────────────────────────────────

@router.post("/events")
def log_dashcam_event(data: DashcamEventCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    ev = models.DashcamEvent(user_id=user.id, vehicle_id=data.vehicle_id, event_type=data.event_type,
        severity=data.severity, confidence=data.confidence, lat=data.lat, lng=data.lng,
        speed_at_event=data.speed_at_event, image_url=data.image_url)
    db.add(ev); db.commit(); db.refresh(ev)
    return {"id": ev.id, "event_type": ev.event_type, "severity": ev.severity, "confidence": ev.confidence}

@router.get("/events")
def list_dashcam_events(vehicle_id: Optional[int] = Query(None), severity: Optional[str] = Query(None), limit: int = 50, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(models.DashcamEvent).filter(models.DashcamEvent.user_id == user.id)
    if vehicle_id: q = q.filter(models.DashcamEvent.vehicle_id == vehicle_id)
    if severity: q = q.filter(models.DashcamEvent.severity == severity)
    events = q.order_by(desc(models.DashcamEvent.created_at)).limit(limit).all()
    return [{"id":e.id,"event_type":e.event_type,"severity":e.severity,"confidence":e.confidence,"lat":e.lat,"lng":e.lng,"speed_at_event":e.speed_at_event,"ai_analysis":e.ai_analysis,"created_at":e.created_at.isoformat() if e.created_at else None} for e in events]

@router.post("/events/{event_id}/review")
def mark_reviewed(event_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    ev = db.query(models.DashcamEvent).filter(models.DashcamEvent.id == event_id, models.DashcamEvent.user_id == user.id).first()
    if not ev: raise HTTPException(404, "Event not found")
    ev.is_reviewed = True; db.commit()
    return {"message": "Marked as reviewed"}

# ── AI Analysis ───────────────────────────────────────────────────────────────

@router.post("/analyze")
async def ai_analyze_event(data: AIAnalysisRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Use Cosmo AI to analyze a driving event and generate feedback."""
    prompt = f"""You are Cosmo AI, an advanced driving safety assistant.
Analyze this driving event and provide concise safety feedback:

Event Type: {data.event_type}
Severity: {data.severity}
Speed at event: {data.speed or 'unknown'} km/h
Additional context: {data.context or 'none'}

Respond with:
1. What happened (1 sentence)
2. Risk level explanation (1 sentence)
3. Safety tip to prevent this (1 sentence)
Keep it under 60 words total. Be direct and helpful."""

    analysis = None

    # Try Anthropic first
    if ANTHROPIC_API_KEY:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-haiku-4-5-20251001", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]},
                    timeout=15)
                if resp.status_code == 200:
                    analysis = resp.json()["content"][0]["text"]
        except Exception:
            pass

    # Fallback: rule-based analysis
    if not analysis:
        tips = {
            "harsh_brake": "Sudden braking detected. Maintain 3-second following distance to avoid emergencies.",
            "harsh_accel": "Aggressive acceleration detected. Smooth acceleration improves safety and fuel efficiency.",
            "speeding": "Speed limit exceeded. Reduce speed — stopping distance increases dramatically above limits.",
            "phone_use": "Phone usage detected while driving. Pull over safely before using your phone.",
            "fatigue": "Fatigue indicators detected. Take a 20-minute break immediately at the nearest safe stop.",
            "lane_departure": "Lane departure detected. Stay alert and keep eyes on road markings.",
            "collision_warning": "Forward collision risk detected. Increase following distance and reduce speed.",
            "pedestrian": "Pedestrian detected ahead. Slow down and yield — pedestrian safety is top priority.",
        }
        analysis = tips.get(data.event_type, f"Safety event logged: {data.event_type}. Please drive carefully.")

    # Save analysis if event_id provided
    if data.event_id:
        ev = db.query(models.DashcamEvent).filter(models.DashcamEvent.id == data.event_id).first()
        if ev:
            ev.ai_analysis = analysis
            db.commit()

    return {"analysis": analysis, "event_type": data.event_type, "severity": data.severity}

@router.get("/behavior-report")
async def behavior_report(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate comprehensive AI driving behavior report."""
    events = db.query(models.DashcamEvent).filter(models.DashcamEvent.user_id == user.id).all()
    behavior_events = db.query(models.DriverBehaviorEvent).filter(models.DriverBehaviorEvent.user_id == user.id).all()

    total = len(events) + len(behavior_events)
    critical = sum(1 for e in events if e.severity == "critical") + sum(1 for e in behavior_events if e.severity == "critical")
    high = sum(1 for e in events if e.severity == "high") + sum(1 for e in behavior_events if e.severity == "high")
    score = max(0, 100 - critical * 15 - high * 8 - (total - critical - high) * 2)

    event_types = {}
    for e in events:
        event_types[e.event_type] = event_types.get(e.event_type, 0) + 1
    for e in behavior_events:
        event_types[e.event_type] = event_types.get(e.event_type, 0) + 1

    top_issue = max(event_types, key=event_types.get) if event_types else None

    # Generate AI tip for top issue
    ai_tip = None
    if top_issue and ANTHROPIC_API_KEY:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-haiku-4-5-20251001", "max_tokens": 100, "messages": [{"role": "user", "content": f"Give a 20-word actionable tip for a driver whose most common issue is: {top_issue}"}]},
                    timeout=10)
                if resp.status_code == 200:
                    ai_tip = resp.json()["content"][0]["text"]
        except Exception:
            pass

    return {
        "score": score,
        "grade": "A+" if score>=95 else "A" if score>=90 else "B" if score>=80 else "C" if score>=70 else "D",
        "total_events": total,
        "critical_events": critical,
        "high_events": high,
        "top_issue": top_issue,
        "event_breakdown": event_types,
        "ai_tip": ai_tip or f"Focus on reducing {top_issue} incidents for a better driving score." if top_issue else "Great driving! Keep it up.",
    }

@router.get("/dashboard")
def cosmo_dashboard(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(models.DashcamEvent).filter(models.DashcamEvent.user_id == user.id).order_by(desc(models.DashcamEvent.created_at)).limit(5).all()
    unreviewed = db.query(models.DashcamEvent).filter(models.DashcamEvent.user_id == user.id, models.DashcamEvent.is_reviewed == False).count()
    critical = db.query(models.DashcamEvent).filter(models.DashcamEvent.user_id == user.id, models.DashcamEvent.severity == "critical").count()
    return {
        "unreviewed_alerts": unreviewed,
        "critical_alerts": critical,
        "recent_events": [{"id":e.id,"event_type":e.event_type,"severity":e.severity,"confidence":e.confidence,"created_at":e.created_at.isoformat() if e.created_at else None} for e in events],
    }
