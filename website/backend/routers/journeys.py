from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

class JourneyStart(BaseModel):
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    from_lat: Optional[float] = None
    from_lng: Optional[float] = None

class JourneyPoint(BaseModel):
    journey_id: int
    lat: float
    lng: float
    speed: Optional[float] = None

@router.post("/start")
def start_journey(data: JourneyStart, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    journey = models.Journey(user_id=user.id, from_location=data.from_location, to_location=data.to_location, from_lat=data.from_lat, from_lng=data.from_lng, status="active")
    db.add(journey)
    db.commit()
    db.refresh(journey)
    return {"id": journey.id, "status": "active", "message": "Journey started. Family notified."}

@router.post("/point")
def add_journey_point(data: JourneyPoint, db: Session = Depends(get_db)):
    point = models.JourneyPoint(journey_id=data.journey_id, lat=data.lat, lng=data.lng, speed=data.speed)
    db.add(point)
    db.commit()
    return {"message": "Point recorded"}

@router.patch("/{journey_id}/complete")
def complete_journey(journey_id: int, to_lat: Optional[float] = None, to_lng: Optional[float] = None, db: Session = Depends(get_db)):
    journey = db.query(models.Journey).filter(models.Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Not found")
    journey.status = "completed"
    journey.arrived_at = datetime.utcnow()
    if to_lat:
        journey.to_lat = to_lat
    if to_lng:
        journey.to_lng = to_lng
    db.commit()
    return {"message": "Journey completed. Safe arrival notified."}

@router.get("/active")
def get_active_journeys(db: Session = Depends(get_db)):
    journeys = db.query(models.Journey).filter(models.Journey.status == "active").order_by(desc(models.Journey.started_at)).all()
    result = []
    for j in journeys:
        user = db.query(models.User).filter(models.User.id == j.user_id).first()
        result.append({"id": j.id, "user_name": user.name if user else "Unknown", "from": j.from_location, "to": j.to_location, "started_at": j.started_at.isoformat() if j.started_at else None, "status": j.status})
    return {"total": len(result), "journeys": result}

@router.get("/my")
def get_my_journeys(
    limit: int = 30,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    journeys = (
        db.query(models.Journey)
        .filter(models.Journey.user_id == user.id)
        .order_by(desc(models.Journey.started_at))
        .limit(limit)
        .all()
    )
    result = []
    for j in journeys:
        points = db.query(models.JourneyPoint).filter(models.JourneyPoint.journey_id == j.id).order_by(desc(models.JourneyPoint.recorded_at)).all()
        last_speed = points[0].speed if points else None
        result.append({
            "id": j.id,
            "from_location": j.from_location or "Unknown",
            "to_location": j.to_location or "Unknown",
            "started_at": j.started_at.isoformat() if j.started_at else None,
            "arrived_at": j.arrived_at.isoformat() if j.arrived_at else None,
            "status": j.status,
            "distance_km": j.distance_km,
            "speed": last_speed,
        })
    return {"journeys": result, "total": len(result)}

@router.get("/stats")
def journey_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Journey.id)).scalar()
    active = db.query(func.count(models.Journey.id)).filter(models.Journey.status == "active").scalar()
    completed = db.query(func.count(models.Journey.id)).filter(models.Journey.status == "completed").scalar()
    return {"total": total, "active": active, "completed": completed}
