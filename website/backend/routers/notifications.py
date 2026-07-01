import os
import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db, engine
import models
from auth import get_current_user

logger = logging.getLogger(__name__)

FIREBASE_SERVER_KEY = os.getenv("FIREBASE_SERVER_KEY", "")

router = APIRouter()

# Defensive migration: add the `read_at` column to a pre-existing
# `notifications` table that was created before this column existed
# (create_all only creates missing tables, it never alters existing ones).
try:
    with engine.connect() as conn:
        conn.exec_driver_sql("ALTER TABLE notifications ADD COLUMN read_at DATETIME")
        conn.commit()
except Exception:
    pass  # column already exists (or dialect quirk) — safe to ignore

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
def list_notifications(
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # In-app notifications for the current user: their own targeted
    # notifications plus broadcast ("all") ones.
    notifs = (
        db.query(models.Notification)
        .filter(
            (models.Notification.user_id == current_user.id)
            | (models.Notification.target == "all")
            | (models.Notification.target == str(current_user.id))
        )
        .order_by(desc(models.Notification.sent_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "type": n.type,
            "target": n.target,
            "read": n.read_at is not None,
            "sent_count": n.sent_count,
            "delivered_count": n.delivered_count,
            "opened_count": n.opened_count,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None,
            "created_at": n.sent_at.isoformat() if n.sent_at else None,
        }
        for n in notifs
    ]


@router.patch("/read-all")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark every in-app notification visible to the current user as read."""
    now = datetime.now(timezone.utc)
    notifs = (
        db.query(models.Notification)
        .filter(
            (models.Notification.user_id == current_user.id)
            | (models.Notification.target == "all")
            | (models.Notification.target == str(current_user.id))
        )
        .all()
    )
    updated = 0
    for n in notifs:
        if n.read_at is None:
            n.read_at = now
            updated += 1
    if updated:
        db.commit()
    return {"message": "All notifications marked as read", "updated": updated}


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    is_visible = (
        notif.user_id == current_user.id
        or notif.target == "all"
        or notif.target == str(current_user.id)
    )
    if not is_visible:
        raise HTTPException(status_code=403, detail="Not authorized")
    if notif.read_at is None:
        notif.read_at = datetime.now(timezone.utc)
        db.commit()
    return {"message": "Notification marked as read", "id": notif.id}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    # Only delete notifications that belong to the current user (personally
    # targeted). Broadcast notifications aren't owned by any single user.
    if notif.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's notification")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}


@router.get("/stats")
def notification_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Notification.id)).scalar()
    total_sent = db.query(func.sum(models.Notification.sent_count)).scalar() or 0
    total_delivered = db.query(func.sum(models.Notification.delivered_count)).scalar() or 0
    total_opened = db.query(func.sum(models.Notification.opened_count)).scalar() or 0
    return {"total_notifications": total, "total_sent": total_sent, "total_delivered": total_delivered, "total_opened": total_opened, "delivery_rate": round(total_delivered / total_sent * 100, 1) if total_sent else 0, "open_rate": round(total_opened / total_sent * 100, 1) if total_sent else 0}
