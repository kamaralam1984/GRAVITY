from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_admin

router = APIRouter()


class SecurityEventCreate(BaseModel):
    event_type: str
    severity: str
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    description: str
    metadata: Optional[dict] = None


class BlockIPRequest(BaseModel):
    ip_address: str
    reason: str


@router.post("/log")
def log_security_event(
    data: SecurityEventCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    event = models.SecurityLog(
        event_type=data.event_type,
        severity=data.severity,
        user_id=data.user_id,
        ip_address=data.ip_address,
        description=data.description,
        metadata_json=data.metadata,
        resolved=False,
    )
    db.add(event)
    db.commit()
    return {"message": "Security event logged", "id": event.id}


@router.get("/logs")
def get_security_logs(
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(models.SecurityLog)
    if severity:
        q = q.filter(models.SecurityLog.severity == severity)
    if event_type:
        q = q.filter(models.SecurityLog.event_type == event_type)
    total = q.count()
    logs = q.order_by(desc(models.SecurityLog.created_at)).offset(offset).limit(limit).all()
    result = []
    for log in logs:
        user = None
        if log.user_id:
            user = db.query(models.User).filter(models.User.id == log.user_id).first()
        result.append({
            "id": log.id,
            "event_type": log.event_type,
            "severity": log.severity,
            "user_name": user.name if user else None,
            "user_email": user.email if user else None,
            "ip_address": log.ip_address,
            "description": log.description,
            "resolved": log.resolved,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })
    return {"total": total, "logs": result}


@router.get("/stats")
def security_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(models.SecurityLog.id)).scalar()
    critical = db.query(func.count(models.SecurityLog.id)).filter(models.SecurityLog.severity == "critical").scalar()
    failed_logins = db.query(func.count(models.SecurityLog.id)).filter(models.SecurityLog.event_type == "failed_login").scalar()
    blocked_ips = db.query(func.count(models.BlockedIP.id)).filter(models.BlockedIP.unblocked_at == None).scalar()
    return {
        "total_events": total,
        "critical_events": critical,
        "failed_logins": failed_logins,
        "blocked_ips": blocked_ips,
    }


@router.post("/block-ip")
def block_ip(
    data: BlockIPRequest,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(models.BlockedIP).filter(
        models.BlockedIP.ip_address == data.ip_address,
        models.BlockedIP.unblocked_at == None,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="IP already blocked")
    blocked = models.BlockedIP(
        ip_address=data.ip_address,
        reason=data.reason,
        blocked_by=admin.email,
    )
    db.add(blocked)
    db.commit()
    return {"message": f"IP {data.ip_address} blocked"}


@router.get("/blocked-ips")
def get_blocked_ips(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    ips = db.query(models.BlockedIP).filter(models.BlockedIP.unblocked_at == None).all()
    return [
        {
            "id": b.id,
            "ip_address": b.ip_address,
            "reason": b.reason,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in ips
    ]


@router.delete("/blocked-ips/{ip_address}")
def unblock_ip(
    ip_address: str,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from datetime import datetime
    blocked = db.query(models.BlockedIP).filter(
        models.BlockedIP.ip_address == ip_address,
        models.BlockedIP.unblocked_at == None,
    ).first()
    if not blocked:
        raise HTTPException(status_code=404, detail="Blocked IP not found")
    blocked.unblocked_at = datetime.utcnow()
    db.commit()
    return {"message": f"IP {ip_address} unblocked"}


@router.get("/score")
def security_score(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(days=7)
    recent_critical = db.query(func.count(models.SecurityLog.id)).filter(
        models.SecurityLog.severity == "critical",
        models.SecurityLog.created_at >= cutoff,
    ).scalar()
    recent_high = db.query(func.count(models.SecurityLog.id)).filter(
        models.SecurityLog.severity == "high",
        models.SecurityLog.created_at >= cutoff,
    ).scalar()
    score = max(0, 100 - (recent_critical * 10) - (recent_high * 3))
    return {"score": score, "critical_last_7d": recent_critical, "high_last_7d": recent_high}
