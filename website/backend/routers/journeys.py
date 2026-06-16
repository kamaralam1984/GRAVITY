from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user
from datetime import datetime, timedelta

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


def _stops_to_timeline(stops: list) -> list:
    """Convert LocationStop rows to a timeline list."""
    result = []
    for i, s in enumerate(stops):
        if i > 0:
            prev = stops[i - 1]
            result.append({
                "type": "transit",
                "transport_mode": s.transport_mode,
                "distance_km": s.distance_from_prev_km,
            })
        result.append({
            "type": "stop",
            "id": s.id,
            "lat": s.lat,
            "lng": s.lng,
            "place_name": s.place_name or f"{s.lat:.4f},{s.lng:.4f}",
            "arrived_at": s.arrived_at.isoformat() if s.arrived_at else None,
            "left_at": s.left_at.isoformat() if s.left_at else None,
            "duration_minutes": s.duration_minutes,
            "is_current": s.left_at is None,
        })
    return result


@router.get("/my-timeline")
def my_timeline(
    hours: int = 24,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Child's own journey timeline — last N hours (default 24)."""
    since = datetime.utcnow() - timedelta(hours=hours)
    stops = (db.query(models.LocationStop)
        .filter(models.LocationStop.user_id == user.id,
                models.LocationStop.arrived_at >= since)
        .order_by(models.LocationStop.arrived_at)
        .all())
    return {"timeline": _stops_to_timeline(stops), "hours": hours}


@router.get("/timeline/{child_user_id}")
def child_timeline(
    child_user_id: int,
    date: Optional[str] = Query(None),    # YYYY-MM-DD
    week: Optional[str] = Query(None),    # YYYY-WNN  e.g. 2026-W24
    year: Optional[int] = Query(None),
    hours: Optional[int] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Parent views a child's journey history — day / week / year."""
    # Verify same family
    my_families = [m.family_id for m in db.query(models.FamilyMember)
                   .filter(models.FamilyMember.user_id == current_user.id).all()]
    child_in_family = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == child_user_id,
        models.FamilyMember.family_id.in_(my_families)).first()
    if not child_in_family and current_user.id != child_user_id:
        raise HTTPException(status_code=403, detail="Not in same family")

    now = datetime.utcnow()
    if hours:
        since, until = now - timedelta(hours=hours), now
    elif date:
        since = datetime.strptime(date, "%Y-%m-%d")
        until = since + timedelta(days=1)
    elif week:
        y, w = week.split("-W")
        # Monday of that week
        since = datetime.strptime(f"{y}-W{int(w):02d}-1", "%Y-W%W-%w")
        until = since + timedelta(weeks=1)
    elif year:
        since = datetime(year, 1, 1)
        until = datetime(year + 1, 1, 1)
    else:
        since = now.replace(hour=0, minute=0, second=0, microsecond=0)
        until = since + timedelta(days=1)

    stops = (db.query(models.LocationStop)
        .filter(models.LocationStop.user_id == child_user_id,
                models.LocationStop.arrived_at >= since,
                models.LocationStop.arrived_at < until)
        .order_by(models.LocationStop.arrived_at)
        .all())

    # For year view, also return daily summary
    daily_summary = None
    if year:
        from sqlalchemy import cast, Date as SqlDate
        rows = (db.query(
                func.date(models.LocationStop.arrived_at).label("day"),
                func.count(models.LocationStop.id).label("stops"),
                func.sum(models.LocationStop.distance_from_prev_km).label("km"),
                func.sum(models.LocationStop.duration_minutes).label("mins"))
            .filter(models.LocationStop.user_id == child_user_id,
                    models.LocationStop.arrived_at >= since,
                    models.LocationStop.arrived_at < until)
            .group_by(func.date(models.LocationStop.arrived_at))
            .all())
        daily_summary = [{"date": str(r.day), "stops": r.stops,
                          "km": round(float(r.km or 0), 1),
                          "active_minutes": int(r.mins or 0)} for r in rows]

    return {
        "timeline": _stops_to_timeline(stops),
        "daily_summary": daily_summary,
        "total_stops": len(stops),
        "total_km": round(sum(s.distance_from_prev_km for s in stops), 1),
    }
