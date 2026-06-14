import os
import logging
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

logger = logging.getLogger(__name__)

FIREBASE_SERVER_KEY = os.getenv("FIREBASE_SERVER_KEY", "")

router = APIRouter()

class NotificationCreate(BaseModel):
    title: str
    body: Optional[str] = None
    type: str = "info"
    target: str = "all"


async def _send_fcm(token: str, title: str, body: str) -> bool:
    """Send a single FCM push notification. Returns True on success."""
    if not FIREBASE_SERVER_KEY:
        logger.info("FIREBASE_SERVER_KEY not set — skipping FCM push")
        return False

    payload = {
        "to": token,
        "notification": {
            "title": title,
            "body": body or "",
            "sound": "default",
        },
        "priority": "high",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://fcm.googleapis.com/fcm/send",
                json=payload,
                headers={
                    "Authorization": f"key={FIREBASE_SERVER_KEY}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            return True
    except Exception as exc:
        logger.warning("FCM send failed for token %s…: %s", token[:10], exc)
        return False


@router.post("/send")
async def send_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    notif = models.Notification(
        title=data.title,
        body=data.body,
        type=data.type,
        target=data.target,
        sent_count=0,
    )
    db.add(notif)
    db.commit()

    # Determine which push tokens to target
    if data.target == "all":
        devices = db.query(models.Device).filter(
            models.Device.push_token != None  # noqa: E711
        ).all()
    else:
        # target is treated as a user_id
        try:
            target_user_id = int(data.target)
            devices = db.query(models.Device).filter(
                models.Device.user_id == target_user_id,
                models.Device.push_token != None,  # noqa: E711
            ).all()
        except (ValueError, TypeError):
            devices = []

    sent = 0
    for device in devices:
        success = await _send_fcm(device.push_token, data.title, data.body or "")
        if success:
            sent += 1

    # Update sent_count with the number of tokens successfully dispatched
    notif.sent_count = sent
    db.commit()

    return {"message": "Notification queued", "id": notif.id, "sent_count": sent}


@router.get("/")
def list_notifications(limit: int = 50, db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).order_by(desc(models.Notification.sent_at)).limit(limit).all()
    return [{"id": n.id, "title": n.title, "body": n.body, "type": n.type, "target": n.target, "sent_count": n.sent_count, "delivered_count": n.delivered_count, "opened_count": n.opened_count, "sent_at": n.sent_at.isoformat() if n.sent_at else None} for n in notifs]


@router.get("/stats")
def notification_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Notification.id)).scalar()
    total_sent = db.query(func.sum(models.Notification.sent_count)).scalar() or 0
    total_delivered = db.query(func.sum(models.Notification.delivered_count)).scalar() or 0
    total_opened = db.query(func.sum(models.Notification.opened_count)).scalar() or 0
    return {"total_notifications": total, "total_sent": total_sent, "total_delivered": total_delivered, "total_opened": total_opened, "delivery_rate": round(total_delivered / total_sent * 100, 1) if total_sent else 0, "open_rate": round(total_opened / total_sent * 100, 1) if total_sent else 0}
