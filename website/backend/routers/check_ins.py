from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

class CheckInCreate(BaseModel):
    family_id: int
    scheduled_at: str
    notes: Optional[str] = None

class CheckInComplete(BaseModel):
    place_name: Optional[str] = None
    notes: Optional[str] = None

@router.post("/")
def create_check_in(data: CheckInCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime as dt
    ci = models.CheckInEvent(user_id=user.id, family_id=data.family_id, scheduled_at=dt.fromisoformat(data.scheduled_at), status="pending", notes=data.notes)
    db.add(ci)
    db.commit()
    db.refresh(ci)
    return {"id": ci.id, "status": "pending"}

@router.patch("/{check_in_id}/complete")
def complete_check_in(check_in_id: int, data: CheckInComplete, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    ci = db.query(models.CheckInEvent).filter(models.CheckInEvent.id == check_in_id).first()
    if not ci:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    ci.status = "completed"
    ci.completed_at = datetime.utcnow()
    ci.place_name = data.place_name
    ci.notes = data.notes
    db.commit()
    return {"message": "Check-in completed"}

@router.get("/family/{family_id}")
def get_family_check_ins(family_id: int, limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(models.CheckInEvent).filter(models.CheckInEvent.family_id == family_id).order_by(desc(models.CheckInEvent.scheduled_at)).limit(limit).all()
    result = []
    for e in events:
        user = db.query(models.User).filter(models.User.id == e.user_id).first()
        result.append({"id": e.id, "user_name": user.name if user else "Unknown", "scheduled_at": e.scheduled_at.isoformat() if e.scheduled_at else None, "completed_at": e.completed_at.isoformat() if e.completed_at else None, "status": e.status, "place_name": e.place_name})
    return result

@router.get("/stats")
def check_in_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.CheckInEvent.id)).scalar()
    completed = db.query(func.count(models.CheckInEvent.id)).filter(models.CheckInEvent.status == "completed").scalar()
    missed = db.query(func.count(models.CheckInEvent.id)).filter(models.CheckInEvent.status == "missed").scalar()
    return {"total": total, "completed": completed, "missed": missed, "completion_rate": round(completed / total * 100, 1) if total else 0}
