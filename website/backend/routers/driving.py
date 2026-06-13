from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user

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

@router.get("/stats")
def driving_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.DrivingEvent.id)).scalar()
    speeding = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "speeding").scalar()
    phone_use = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "phone_use").scalar()
    harsh_brake = db.query(func.count(models.DrivingEvent.id)).filter(models.DrivingEvent.type == "harsh_brake").scalar()
    return {"total": total, "speeding": speeding, "phone_use": phone_use, "harsh_brake": harsh_brake}
