from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter()

class AuditLogCreate(BaseModel):
    event_type: str
    actor: Optional[str] = None
    action: str
    resource: Optional[str] = None
    ip_address: Optional[str] = None
    status: str = "success"
    details: Optional[dict] = None

@router.post("/log")
def create_log(data: AuditLogCreate, db: Session = Depends(get_db)):
    log = models.AuditLog(**data.model_dump())
    db.add(log)
    db.commit()
    return {"message": "Logged"}

@router.get("/")
def list_logs(event_type: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    q = db.query(models.AuditLog)
    if event_type:
        q = q.filter(models.AuditLog.event_type == event_type)
    logs = q.order_by(desc(models.AuditLog.created_at)).limit(limit).all()
    return [{"id": l.id, "event_type": l.event_type, "actor": l.actor, "action": l.action, "resource": l.resource, "ip_address": l.ip_address, "status": l.status, "created_at": l.created_at.isoformat() if l.created_at else None} for l in logs]
