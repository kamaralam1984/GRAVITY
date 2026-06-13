"""Titan Integration — Smart Locks, Entry Alerts, Exit Alerts."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models, os
from auth import get_current_user
from datetime import datetime

router = APIRouter()

# ── Pydantic schemas ─────────────────────────────────────────────────────────

class LockCreate(BaseModel):
    name: str
    location: Optional[str] = None
    family_id: Optional[int] = None
    auto_lock_minutes: int = 0

class LockUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    auto_lock_minutes: Optional[int] = None

class LockAction(BaseModel):
    action: str   # "lock" | "unlock"
    note: Optional[str] = None

class LockResponse(BaseModel):
    id: int
    name: str
    location: Optional[str]
    is_locked: bool
    is_online: bool
    battery_level: int
    last_action: Optional[str]
    last_action_by: Optional[str]
    auto_lock_minutes: int
    class Config:
        from_attributes = True

# ── CRUD: Smart Locks ────────────────────────────────────────────────────────

@router.get("/locks")
def list_locks(
    family_id: Optional[int] = Query(None),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.SmartLock).filter(models.SmartLock.user_id == user.id)
    if family_id:
        q = q.filter(models.SmartLock.family_id == family_id)
    locks = q.all()
    return locks

@router.post("/locks")
def create_lock(
    data: LockCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lock = models.SmartLock(
        user_id=user.id,
        family_id=data.family_id,
        name=data.name,
        location=data.location,
        auto_lock_minutes=data.auto_lock_minutes,
        is_locked=True,
        is_online=True,
        battery_level=100,
    )
    db.add(lock)
    db.commit()
    db.refresh(lock)
    return lock

@router.get("/locks/{lock_id}")
def get_lock(lock_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    return lock

@router.patch("/locks/{lock_id}")
def update_lock(lock_id: int, data: LockUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    if data.name is not None: lock.name = data.name
    if data.location is not None: lock.location = data.location
    if data.auto_lock_minutes is not None: lock.auto_lock_minutes = data.auto_lock_minutes
    db.commit()
    return lock

@router.delete("/locks/{lock_id}")
def delete_lock(lock_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    db.delete(lock)
    db.commit()
    return {"message": "Lock removed"}

# ── Lock Actions ─────────────────────────────────────────────────────────────

@router.post("/locks/{lock_id}/action")
def lock_action(
    lock_id: int,
    data: LockAction,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    if data.action not in ("lock", "unlock"):
        raise HTTPException(400, "Action must be 'lock' or 'unlock'")

    is_locked = (data.action == "lock")
    lock.is_locked = is_locked
    lock.last_action = "locked" if is_locked else "unlocked"
    lock.last_action_by = user.name

    # Log the event
    event = models.LockEvent(
        lock_id=lock_id,
        user_id=user.id,
        action=lock.last_action,
        triggered_by="remote",
        note=data.note,
    )
    db.add(event)
    db.commit()
    db.refresh(lock)

    return {
        "message": f"Lock {lock.last_action} successfully",
        "lock": {"id": lock.id, "name": lock.name, "is_locked": lock.is_locked, "last_action_by": lock.last_action_by},
    }

# ── Entry / Exit Alerts ──────────────────────────────────────────────────────

@router.get("/alerts")
def get_alerts(
    lock_id: Optional[int] = Query(None),
    limit: int = Query(50),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get entry/exit alert history across all user's locks."""
    # Get all lock IDs belonging to user
    lock_ids = [l.id for l in db.query(models.SmartLock).filter(models.SmartLock.user_id == user.id).all()]
    if not lock_ids:
        return []

    q = db.query(models.LockEvent).filter(models.LockEvent.lock_id.in_(lock_ids))
    if lock_id:
        q = q.filter(models.LockEvent.lock_id == lock_id)

    events = q.order_by(desc(models.LockEvent.created_at)).limit(limit).all()
    result = []
    for e in events:
        lock = db.query(models.SmartLock).filter(models.SmartLock.id == e.lock_id).first()
        result.append({
            "id": e.id,
            "lock_id": e.lock_id,
            "lock_name": lock.name if lock else "Unknown",
            "action": e.action,
            "triggered_by": e.triggered_by,
            "note": e.note,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        })
    return result

@router.post("/alerts/entry")
def entry_alert(
    lock_id: int,
    note: Optional[str] = None,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger an entry alert (door opened)."""
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    event = models.LockEvent(lock_id=lock_id, user_id=user.id, action="door_open", triggered_by="sensor", note=note or "Entry detected")
    db.add(event)
    db.commit()
    return {"message": "Entry alert logged", "lock": lock.name, "time": datetime.utcnow().isoformat()}

@router.post("/alerts/exit")
def exit_alert(
    lock_id: int,
    note: Optional[str] = None,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger an exit alert (door closed)."""
    lock = db.query(models.SmartLock).filter(models.SmartLock.id == lock_id, models.SmartLock.user_id == user.id).first()
    if not lock:
        raise HTTPException(404, "Lock not found")
    event = models.LockEvent(lock_id=lock_id, user_id=user.id, action="door_close", triggered_by="sensor", note=note or "Exit detected")
    db.add(event)
    db.commit()
    return {"message": "Exit alert logged", "lock": lock.name, "time": datetime.utcnow().isoformat()}

@router.get("/dashboard")
def titan_dashboard(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Summary dashboard for all smart locks."""
    locks = db.query(models.SmartLock).filter(models.SmartLock.user_id == user.id).all()
    lock_ids = [l.id for l in locks]
    recent_events = db.query(models.LockEvent).filter(models.LockEvent.lock_id.in_(lock_ids)).order_by(desc(models.LockEvent.created_at)).limit(10).all() if lock_ids else []
    return {
        "total_locks": len(locks),
        "locked_count": sum(1 for l in locks if l.is_locked),
        "unlocked_count": sum(1 for l in locks if not l.is_locked),
        "online_count": sum(1 for l in locks if l.is_online),
        "low_battery": [{"id": l.id, "name": l.name, "battery": l.battery_level} for l in locks if l.battery_level < 20],
        "recent_events": [{"action": e.action, "lock_id": e.lock_id, "triggered_by": e.triggered_by, "created_at": e.created_at.isoformat() if e.created_at else None} for e in recent_events],
    }
