"""SOS alert management."""
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

class SOSCreate(BaseModel):
    family_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    place_name: Optional[str] = None
    message: Optional[str] = None

@router.post("/trigger")
def trigger_sos(data: SOSCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = models.SOSAlert(user_id=user.id, family_id=data.family_id, lat=data.lat, lng=data.lng, place_name=data.place_name, message=data.message, status="active")
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"id": alert.id, "status": "active", "message": "SOS triggered. Family notified."}

@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.SOSAlert).filter(models.SOSAlert.status == "active").order_by(desc(models.SOSAlert.triggered_at)).all()
    result = []
    for a in alerts:
        user = db.query(models.User).filter(models.User.id == a.user_id).first()
        family = db.query(models.Family).filter(models.Family.id == a.family_id).first()
        result.append({"id": a.id, "user_name": user.name if user else "Unknown", "family_name": family.name if family else "Unknown", "place_name": a.place_name, "lat": a.lat, "lng": a.lng, "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None})
    return result

@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(models.SOSAlert).filter(models.SOSAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Not found")
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = user.name
    db.commit()
    return {"message": "Alert resolved"}

@router.get("/history/{family_id}")
def sos_history(family_id: int, db: Session = Depends(get_db)):
    alerts = db.query(models.SOSAlert).filter(models.SOSAlert.family_id == family_id).order_by(desc(models.SOSAlert.triggered_at)).all()
    return [{"id": a.id, "status": a.status, "place_name": a.place_name, "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None, "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None} for a in alerts]
