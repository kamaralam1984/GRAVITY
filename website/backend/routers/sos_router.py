"""SOS alert management."""
import os
import logging
import httpx
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user
from datetime import datetime
from ws_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

class SOSCreate(BaseModel):
    family_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    place_name: Optional[str] = None
    message: Optional[str] = None


async def _send_push_to_family(family_id: int, alert: models.SOSAlert, user: models.User, db: Session):
    """Send FCM push notifications to all family members who have a push token."""
    FIREBASE_SERVER_KEY = os.getenv("FIREBASE_SERVER_KEY", "")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

    if not FIREBASE_SERVER_KEY or not FIREBASE_PROJECT_ID:
        logger.info("FCM env vars not set — skipping push for SOS alert %s", alert.id)
        return

    # Collect all member user_ids in this family
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id
    ).all()
    member_ids = [m.user_id for m in members]

    if not member_ids:
        return

    # Fetch push tokens for those users (exclude triggering user — they know already)
    devices = db.query(models.Device).filter(
        models.Device.user_id.in_(member_ids),
        models.Device.push_token != None,  # noqa: E711
    ).all()

    if not devices:
        logger.info("No push tokens found for family %s — SOS push skipped", family_id)
        return

    title = f"SOS Alert from {user.name}"
    body = alert.place_name or alert.message or "Immediate help needed!"

    async with httpx.AsyncClient(timeout=10) as client:
        for device in devices:
            payload = {
                "to": device.push_token,
                "notification": {
                    "title": title,
                    "body": body,
                    "sound": "default",
                },
                "data": {
                    "type": "sos_alert",
                    "alert_id": str(alert.id),
                    "user_id": str(user.id),
                    "family_id": str(family_id),
                    "lat": str(alert.lat or ""),
                    "lng": str(alert.lng or ""),
                },
                "priority": "high",
            }
            try:
                resp = await client.post(
                    "https://fcm.googleapis.com/fcm/send",
                    json=payload,
                    headers={
                        "Authorization": f"key={FIREBASE_SERVER_KEY}",
                        "Content-Type": "application/json",
                    },
                )
                resp.raise_for_status()
                logger.info("FCM push sent to device %s (user %s)", device.id, device.user_id)
            except Exception as exc:
                logger.warning("FCM push failed for device %s: %s", device.id, exc)


@router.post("/trigger")
async def trigger_sos(data: SOSCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = models.SOSAlert(
        user_id=user.id,
        family_id=data.family_id,
        lat=data.lat,
        lng=data.lng,
        place_name=data.place_name,
        message=data.message,
        status="active",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Broadcast via WebSocket to all connected family members
    ws_payload = {
        "type": "sos_alert",
        "alert_id": alert.id,
        "user_id": user.id,
        "user_name": user.name,
        "lat": data.lat,
        "lng": data.lng,
        "place_name": data.place_name,
        "message": data.message,
        "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else datetime.utcnow().isoformat(),
    }
    await manager.broadcast_to_room(str(data.family_id), ws_payload)

    # Send FCM push notifications to family members
    await _send_push_to_family(data.family_id, alert, user, db)

    return {"id": alert.id, "status": "active", "message": "SOS triggered. Family notified."}


@router.get("/active")
def get_active_alerts(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user.id).all()
    family_ids = [m.family_id for m in memberships]
    alerts = db.query(models.SOSAlert).filter(models.SOSAlert.family_id.in_(family_ids), models.SOSAlert.status == "active").order_by(desc(models.SOSAlert.triggered_at)).all()
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
    membership = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == alert.family_id, models.FamilyMember.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = user.name
    db.commit()
    return {"message": "Alert resolved"}


@router.get("/history/{family_id}")
def sos_history(family_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id, models.FamilyMember.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")
    alerts = db.query(models.SOSAlert).filter(models.SOSAlert.family_id == family_id).order_by(desc(models.SOSAlert.triggered_at)).all()
    return [{"id": a.id, "status": a.status, "place_name": a.place_name, "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None, "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None} for a in alerts]
