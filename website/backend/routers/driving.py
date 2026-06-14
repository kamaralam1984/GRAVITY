from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user
from datetime import datetime, timezone, timedelta

router = APIRouter()

class DrivingEventCreate(BaseModel):
    type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    speed: Optional[float] = None
    severity: str = "medium"
    journey_id: Optional[int] = None

@router.post("/event")
def log_driving_event(data: DrivingEventCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = models.DrivingEvent(user_id=user.id, type=data.type, lat=data.lat, lng=data.lng, speed=data.speed, severity=data.severity, journey_id=data.journey_id)
    db.add(event)
    db.commit()
    return {"message": "Event logged", "type": data.type}

@router.get("/events")
def get_driving_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(models.DrivingEvent).order_by(desc(models.DrivingEvent.occurred_at)).limit(limit).all()
    result = []
    for e in events:
        user = db.query(models.User).filter(models.User.id == e.user_id).first()
        result.append({"id": e.id, "type": e.type, "severity": e.severity, "speed": e.speed, "user_name": user.name if user else "Unknown", "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None, "resolved": e.resolved})
    return result

@router.get("/member/{user_id}")
def get_member_driving(user_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    journeys = db.query(models.Journey).filter(models.Journey.user_id == user_id).order_by(desc(models.Journey.started_at)).limit(10).all()
    events = db.query(models.DrivingEvent).filter(models.DrivingEvent.user_id == user_id).order_by(desc(models.DrivingEvent.occurred_at)).limit(20).all()

    harsh_brakes = sum(1 for e in events if e.type == 'harsh_brake')
    speeding = sum(1 for e in events if e.type == 'speeding')
    phone_use = sum(1 for e in events if e.type == 'phone_use')
    rapid_accel = sum(1 for e in events if e.type == 'rapid_accel')

    score = None
    if journeys:
        score = max(0, 100 - harsh_brakes * 5 - speeding * 8 - phone_use * 10 - rapid_accel * 4)

    total_km = sum((j.distance_km or 0) for j in journeys)

    result_journeys = []
    for j in journeys:
        duration_min = None
        if j.started_at and j.arrived_at:
            start = j.started_at if j.started_at.tzinfo else j.started_at.replace(tzinfo=timezone.utc)
            end = j.arrived_at if j.arrived_at.tzinfo else j.arrived_at.replace(tzinfo=timezone.utc)
            duration_min = int((end - start).total_seconds() / 60)
        result_journeys.append({
            "id": j.id,
            "from_location": j.from_location or "Unknown",
            "to_location": j.to_location or "Unknown",
            "started_at": j.started_at.isoformat() if j.started_at else None,
            "arrived_at": j.arrived_at.isoformat() if j.arrived_at else None,
            "status": j.status,
            "distance_km": j.distance_km,
            "duration_min": duration_min,
        })

    recent_events = [{"type": e.type, "severity": e.severity, "speed": e.speed, "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None} for e in events[:5]]

    return {
        "score": score,
        "total_trips": len(journeys),
        "total_km": round(total_km, 1),
        "harsh_brakes": harsh_brakes,
        "speeding": speeding,
        "phone_use": phone_use,
        "journeys": result_journeys,
        "recent_events": recent_events,
    }

@router.get("/summary/{family_id}")
def driving_summary(family_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return driving summary for all members of a family."""
    members = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id).all()
    member_summaries = []
    all_scores = []

    for m in members:
        member_user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if not member_user:
            continue

        journeys = db.query(models.Journey).filter(models.Journey.user_id == m.user_id).order_by(desc(models.Journey.started_at)).limit(10).all()
        events = db.query(models.DrivingEvent).filter(models.DrivingEvent.user_id == m.user_id).order_by(desc(models.DrivingEvent.occurred_at)).limit(20).all()

        harsh_brakes = sum(1 for e in events if e.type == 'harsh_brake')
        speeding = sum(1 for e in events if e.type == 'speeding')
        phone_use_count = sum(1 for e in events if e.type == 'phone_use')
        rapid_accel = sum(1 for e in events if e.type == 'rapid_accel')
        total_harsh = harsh_brakes + speeding + phone_use_count + rapid_accel

        score = None
        if journeys:
            score = max(0, 100 - harsh_brakes * 5 - speeding * 8 - phone_use_count * 10 - rapid_accel * 4)
            all_scores.append(score)

        recent_trips = []
        for j in journeys[:5]:
            duration_min = None
            if j.started_at and j.arrived_at:
                start = j.started_at if j.started_at.tzinfo else j.started_at.replace(tzinfo=timezone.utc)
                end = j.arrived_at if j.arrived_at.tzinfo else j.arrived_at.replace(tzinfo=timezone.utc)
                duration_min = int((end - start).total_seconds() / 60)
            recent_trips.append({
                "id": j.id,
                "from_location": j.from_location or "Unknown",
                "to_location": j.to_location or "Unknown",
                "started_at": j.started_at.isoformat() if j.started_at else None,
                "status": j.status,
                "distance_km": j.distance_km,
                "duration_min": duration_min,
            })

        member_summaries.append({
            "user_id": m.user_id,
            "name": member_user.name,
            "role": m.role,
            "score": score,
            "total_trips": len(journeys),
            "harsh_brakes": harsh_brakes,
            "speeding": speeding,
            "phone_use": phone_use_count,
            "rapid_accel": rapid_accel,
            "total_harsh_events": total_harsh,
            "recent_trips": recent_trips,
        })

    overall_score = round(sum(all_scores) / len(all_scores)) if all_scores else None
    return {
        "family_id": family_id,
        "overall_score": overall_score,
        "members": member_summaries,
    }

@router.get("/stats")
def driving_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.DrivingEvent.id)).scalar()
    speeding = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "speeding").scalar()
    phone_use = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "phone_use").scalar()
    harsh_brake = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "harsh_brake").scalar()
    return {"total": total, "speeding": speeding, "phone_use": phone_use, "harsh_brake": harsh_brake}
