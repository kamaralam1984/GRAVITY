"""Venus Integration — Vehicle Tracking, Driver Monitoring."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

class VehicleCreate(BaseModel):
    name: str
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    plate: Optional[str] = None
    color: Optional[str] = None
    family_id: Optional[int] = None

class VehicleLocationUpdate(BaseModel):
    lat: float
    lng: float
    speed: float = 0.0
    heading: Optional[float] = None

class TripCreate(BaseModel):
    vehicle_id: int
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    start_place: Optional[str] = None

class TripEnd(BaseModel):
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None
    end_place: Optional[str] = None
    distance_km: float = 0.0
    duration_minutes: int = 0
    max_speed_kmh: float = 0.0
    avg_speed_kmh: float = 0.0

class BehaviorEventCreate(BaseModel):
    vehicle_id: int
    event_type: str   # harsh_brake | harsh_accel | speeding | phone_use | fatigue | lane_change
    severity: str = "medium"
    speed_at_event: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    trip_id: Optional[int] = None

# ── Vehicle CRUD ─────────────────────────────────────────────────────────────

@router.get("/vehicles")
def list_vehicles(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Vehicle).filter(models.Vehicle.user_id == user.id).all()

@router.post("/vehicles")
def add_vehicle(data: VehicleCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = models.Vehicle(user_id=user.id, family_id=data.family_id, name=data.name,
        make=data.make, model=data.model, year=data.year, plate=data.plate, color=data.color)
    db.add(v); db.commit(); db.refresh(v)
    return v

@router.get("/vehicles/{vid}")
def get_vehicle(vid: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(models.Vehicle).filter(models.Vehicle.id == vid, models.Vehicle.user_id == user.id).first()
    if not v: raise HTTPException(404, "Vehicle not found")
    return v

@router.delete("/vehicles/{vid}")
def delete_vehicle(vid: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(models.Vehicle).filter(models.Vehicle.id == vid, models.Vehicle.user_id == user.id).first()
    if not v: raise HTTPException(404, "Vehicle not found")
    db.delete(v); db.commit()
    return {"message": "Vehicle removed"}

# ── Real-time location ────────────────────────────────────────────────────────

@router.post("/vehicles/{vid}/location")
def update_vehicle_location(vid: int, data: VehicleLocationUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(models.Vehicle).filter(models.Vehicle.id == vid, models.Vehicle.user_id == user.id).first()
    if not v: raise HTTPException(404, "Vehicle not found")
    v.lat = data.lat; v.lng = data.lng; v.speed = data.speed
    v.heading = data.heading; v.last_seen = datetime.utcnow()
    db.commit()
    return {"message": "Location updated", "lat": v.lat, "lng": v.lng, "speed": v.speed}

@router.get("/vehicles/{vid}/location")
def get_vehicle_location(vid: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(models.Vehicle).filter(models.Vehicle.id == vid, models.Vehicle.user_id == user.id).first()
    if not v: raise HTTPException(404, "Vehicle not found")
    return {"id": v.id, "name": v.name, "lat": v.lat, "lng": v.lng, "speed": v.speed, "heading": v.heading, "last_seen": v.last_seen.isoformat() if v.last_seen else None}

# ── Trips ─────────────────────────────────────────────────────────────────────

@router.post("/trips/start")
def start_trip(data: TripCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = models.TripRecord(vehicle_id=data.vehicle_id, driver_id=user.id,
        start_lat=data.start_lat, start_lng=data.start_lng, start_place=data.start_place, started_at=datetime.utcnow())
    db.add(trip); db.commit(); db.refresh(trip)
    return {"trip_id": trip.id, "started_at": trip.started_at.isoformat(), "message": "Trip started"}

@router.post("/trips/{trip_id}/end")
def end_trip(trip_id: int, data: TripEnd, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.TripRecord).filter(models.TripRecord.id == trip_id, models.TripRecord.driver_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    trip.end_lat = data.end_lat; trip.end_lng = data.end_lng; trip.end_place = data.end_place
    trip.distance_km = data.distance_km; trip.duration_minutes = data.duration_minutes
    trip.max_speed_kmh = data.max_speed_kmh; trip.avg_speed_kmh = data.avg_speed_kmh
    trip.ended_at = datetime.utcnow()
    db.commit()
    return {"message": "Trip ended", "distance_km": trip.distance_km, "duration_minutes": trip.duration_minutes}

@router.get("/trips")
def list_trips(vehicle_id: Optional[int] = Query(None), limit: int = 20, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(models.TripRecord).filter(models.TripRecord.driver_id == user.id)
    if vehicle_id: q = q.filter(models.TripRecord.vehicle_id == vehicle_id)
    return q.order_by(desc(models.TripRecord.started_at)).limit(limit).all()

# ── Driver Behavior ───────────────────────────────────────────────────────────

@router.post("/behavior/event")
def log_behavior_event(data: BehaviorEventCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    ev = models.DriverBehaviorEvent(vehicle_id=data.vehicle_id, user_id=user.id, trip_id=data.trip_id,
        event_type=data.event_type, severity=data.severity, speed_at_event=data.speed_at_event,
        lat=data.lat, lng=data.lng)
    db.add(ev); db.commit(); db.refresh(ev)
    return {"message": "Behavior event logged", "id": ev.id, "type": ev.event_type, "severity": ev.severity}

@router.get("/behavior/events")
def get_behavior_events(vehicle_id: Optional[int] = Query(None), limit: int = 50, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(models.DriverBehaviorEvent).filter(models.DriverBehaviorEvent.user_id == user.id)
    if vehicle_id: q = q.filter(models.DriverBehaviorEvent.vehicle_id == vehicle_id)
    return q.order_by(desc(models.DriverBehaviorEvent.created_at)).limit(limit).all()

@router.get("/behavior/score")
def get_driver_score(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(models.DriverBehaviorEvent).filter(models.DriverBehaviorEvent.user_id == user.id).all()
    trips = db.query(models.TripRecord).filter(models.TripRecord.driver_id == user.id).all()
    harsh = sum(1 for e in events if e.severity in ("high","critical"))
    medium = sum(1 for e in events if e.severity == "medium")
    score = max(0, 100 - harsh * 10 - medium * 3)
    return {
        "score": score,
        "grade": "A+" if score>=95 else "A" if score>=90 else "B" if score>=80 else "C" if score>=70 else "D",
        "total_trips": len(trips),
        "total_km": sum(t.distance_km or 0 for t in trips),
        "harsh_events": harsh,
        "medium_events": medium,
        "breakdown": {
            "harsh_brake": sum(1 for e in events if e.event_type=="harsh_brake"),
            "harsh_accel": sum(1 for e in events if e.event_type=="harsh_accel"),
            "speeding": sum(1 for e in events if e.event_type=="speeding"),
            "phone_use": sum(1 for e in events if e.event_type=="phone_use"),
        }
    }

@router.get("/dashboard")
def venus_dashboard(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).filter(models.Vehicle.user_id == user.id).all()
    trips = db.query(models.TripRecord).filter(models.TripRecord.driver_id == user.id).limit(5).all()
    events = db.query(models.DriverBehaviorEvent).filter(models.DriverBehaviorEvent.user_id == user.id).limit(10).all()
    return {
        "total_vehicles": len(vehicles),
        "vehicles": [{"id":v.id,"name":v.name,"plate":v.plate,"lat":v.lat,"lng":v.lng,"speed":v.speed,"last_seen":v.last_seen.isoformat() if v.last_seen else None} for v in vehicles],
        "recent_trips": [{"id":t.id,"distance_km":t.distance_km,"duration_minutes":t.duration_minutes,"started_at":t.started_at.isoformat() if t.started_at else None} for t in trips],
        "recent_events": [{"type":e.event_type,"severity":e.severity,"created_at":e.created_at.isoformat() if e.created_at else None} for e in events],
    }
