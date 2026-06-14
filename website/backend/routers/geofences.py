"""Geofence zone CRUD and event logging."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

class GeofenceCreate(BaseModel):
    family_id: int
    name: str
    type: str = "custom"
    center_lat: float
    center_lng: float
    radius_meters: float = 200
    color: str = "#4B80F0"
    alert_on_enter: bool = True
    alert_on_exit: bool = True

class GeofenceEvent(BaseModel):
    geofence_id: int
    user_id: int
    event_type: str
    lat: Optional[float] = None
    lng: Optional[float] = None

@router.post("/")
def create_geofence(
    data: GeofenceCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify user is a member of this family
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == data.family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    g = models.Geofence(**data.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    return {"id": g.id, "name": g.name, "message": "Geofence created"}

@router.get("/family/{family_id}")
def get_family_geofences(
    family_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    geofences = db.query(models.Geofence).filter(models.Geofence.family_id == family_id).all()
    return [
        {
            "id": g.id, "name": g.name, "type": g.type,
            "center_lat": g.center_lat, "center_lng": g.center_lng,
            "radius_meters": g.radius_meters, "color": g.color,
            "is_active": g.is_active,
        }
        for g in geofences
    ]

@router.post("/event")
def log_geofence_event(
    data: GeofenceEvent,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = models.GeofenceEvent(**data.model_dump())
    db.add(event)
    db.commit()
    return {"message": "Event logged"}

@router.get("/events")
def get_geofence_events(
    limit: int = 50,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Return only events for geofences in families user belongs to
    user_family_ids = [
        m.family_id for m in db.query(models.FamilyMember).filter(
            models.FamilyMember.user_id == user.id
        ).all()
    ]
    # Single JOIN query: events + user name + geofence name
    rows = (
        db.query(models.GeofenceEvent, models.User, models.Geofence)
        .join(models.User, models.User.id == models.GeofenceEvent.user_id)
        .join(models.Geofence, models.Geofence.id == models.GeofenceEvent.geofence_id)
        .filter(models.Geofence.family_id.in_(user_family_ids))
        .order_by(desc(models.GeofenceEvent.occurred_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "user_name": member.name if member else "Unknown",
            "geofence_name": geofence.name if geofence else "Unknown",
            "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
        }
        for e, member, geofence in rows
    ]

@router.patch("/{geofence_id}")
def toggle_geofence(
    geofence_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(models.Geofence).filter(models.Geofence.id == geofence_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Not found")

    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == g.family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    g.is_active = not g.is_active
    db.commit()
    return {"id": g.id, "is_active": g.is_active}


@router.delete("/{geofence_id}")
def delete_geofence(
    geofence_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(models.Geofence).filter(models.Geofence.id == geofence_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Not found")

    # Verify user belongs to this geofence's family
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == g.family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    db.delete(g)
    db.commit()
    return {"message": "Deleted"}
