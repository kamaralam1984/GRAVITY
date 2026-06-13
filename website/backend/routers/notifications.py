from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter()

class NotificationCreate(BaseModel):
    title: str
    body: Optional[str] = None
    type: str = "info"
    target: str = "all"

@router.post("/send")
def send_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    notif = models.Notification(title=data.title, body=data.body, type=data.type, target=data.target, sent_count=0)
    db.add(notif)
    db.commit()
    return {"message": "Notification queued", "id": notif.id}

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
