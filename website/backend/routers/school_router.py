"""School schedule & info management."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

PERIOD_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#F97316']

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class SchoolInfoUpdate(BaseModel):
    school_name: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    bus_number: Optional[str] = None
    bus_driver: Optional[str] = None

class PeriodCreate(BaseModel):
    day_of_week: int          # 0=Mon … 6=Sun
    period_order: int = 1
    time: str                 # "8:00 AM"
    subject: str
    teacher: Optional[str] = "—"
    room: Optional[str] = "—"
    color: Optional[str] = None

class PeriodUpdate(BaseModel):
    time: Optional[str] = None
    subject: Optional[str] = None
    teacher: Optional[str] = None
    room: Optional[str] = None
    color: Optional[str] = None
    period_order: Optional[int] = None

# ── School Info ───────────────────────────────────────────────────────────────

@router.get("/info/{user_id}")
def get_school_info(user_id: int, db: Session = Depends(get_db)):
    info = db.query(models.SchoolInfo).filter(models.SchoolInfo.user_id == user_id).first()
    if not info:
        return {"user_id": user_id, "school_name": None, "class_name": None, "section": None, "bus_number": None, "bus_driver": None}
    return {"user_id": user_id, "school_name": info.school_name, "class_name": info.class_name, "section": info.section, "bus_number": info.bus_number, "bus_driver": info.bus_driver}

@router.post("/info")
def set_school_info(data: SchoolInfoUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    info = db.query(models.SchoolInfo).filter(models.SchoolInfo.user_id == user.id).first()
    if not info:
        info = models.SchoolInfo(user_id=user.id)
        db.add(info)
    if data.school_name is not None:
        info.school_name = data.school_name
    if data.class_name is not None:
        info.class_name = data.class_name
    if data.section is not None:
        info.section = data.section
    if data.bus_number is not None:
        info.bus_number = data.bus_number
    if data.bus_driver is not None:
        info.bus_driver = data.bus_driver
    db.commit()
    db.refresh(info)
    return {"school_name": info.school_name, "class_name": info.class_name, "section": info.section, "bus_number": info.bus_number, "bus_driver": info.bus_driver}

# ── Schedule ──────────────────────────────────────────────────────────────────

def _now_status(time_str: str, day_of_week: int) -> str:
    """Return 'done'/'now'/'upcoming' based on current time."""
    try:
        today = datetime.now().weekday()  # 0=Mon
        if day_of_week != today:
            return "upcoming"
        t = datetime.strptime(time_str, "%I:%M %p")
        now = datetime.now()
        period_mins = t.hour * 60 + t.minute
        now_mins = now.hour * 60 + now.minute
        if now_mins > period_mins + 55:
            return "done"
        if abs(now_mins - period_mins) <= 55:
            return "now"
        return "upcoming"
    except Exception:
        return "upcoming"

@router.get("/schedule/{user_id}")
def get_schedule(user_id: int, day: Optional[int] = None, db: Session = Depends(get_db)):
    """Get schedule. day=0-6 (Mon-Sun). If omitted, returns today's schedule."""
    if day is None:
        day = datetime.now().weekday()
    periods = db.query(models.SchoolPeriod).filter(
        models.SchoolPeriod.user_id == user_id,
        models.SchoolPeriod.day_of_week == day,
    ).order_by(models.SchoolPeriod.period_order).all()
    return [
        {
            "id": p.id, "day_of_week": p.day_of_week,
            "period_order": p.period_order, "time": p.time,
            "subject": p.subject, "teacher": p.teacher,
            "room": p.room, "color": p.color,
            "status": _now_status(p.time, p.day_of_week),
        }
        for p in periods
    ]

@router.get("/schedule/{user_id}/week")
def get_week_schedule(user_id: int, db: Session = Depends(get_db)):
    """Get full week schedule grouped by day."""
    periods = db.query(models.SchoolPeriod).filter(
        models.SchoolPeriod.user_id == user_id,
    ).order_by(models.SchoolPeriod.day_of_week, models.SchoolPeriod.period_order).all()
    week: dict = {i: [] for i in range(7)}
    for p in periods:
        week[p.day_of_week].append({
            "id": p.id, "period_order": p.period_order, "time": p.time,
            "subject": p.subject, "teacher": p.teacher, "room": p.room, "color": p.color,
        })
    return week

@router.post("/schedule")
def add_period(data: PeriodCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    color = data.color
    if not color:
        count = db.query(models.SchoolPeriod).filter(models.SchoolPeriod.user_id == user.id).count()
        color = PERIOD_COLORS[count % len(PERIOD_COLORS)]
    period = models.SchoolPeriod(
        user_id=user.id,
        day_of_week=data.day_of_week,
        period_order=data.period_order,
        time=data.time,
        subject=data.subject,
        teacher=data.teacher or "—",
        room=data.room or "—",
        color=color,
    )
    db.add(period)
    db.commit()
    db.refresh(period)
    return {"id": period.id, "subject": period.subject, "time": period.time, "teacher": period.teacher, "room": period.room, "color": period.color}

@router.put("/schedule/{period_id}")
def update_period(period_id: int, data: PeriodUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    period = db.query(models.SchoolPeriod).filter(models.SchoolPeriod.id == period_id, models.SchoolPeriod.user_id == user.id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Period not found")
    if data.time is not None:
        period.time = data.time
    if data.subject is not None:
        period.subject = data.subject
    if data.teacher is not None:
        period.teacher = data.teacher
    if data.room is not None:
        period.room = data.room
    if data.color is not None:
        period.color = data.color
    if data.period_order is not None:
        period.period_order = data.period_order
    db.commit()
    return {"id": period.id, "subject": period.subject, "time": period.time, "teacher": period.teacher, "room": period.room, "color": period.color}

@router.delete("/schedule/{period_id}")
def delete_period(period_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    period = db.query(models.SchoolPeriod).filter(models.SchoolPeriod.id == period_id, models.SchoolPeriod.user_id == user.id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Period not found")
    db.delete(period)
    db.commit()
    return {"message": "Deleted"}

@router.delete("/schedule/{user_id}/day/{day}")
def clear_day(user_id: int, day: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.query(models.SchoolPeriod).filter(
        models.SchoolPeriod.user_id == user_id,
        models.SchoolPeriod.day_of_week == day,
    ).delete()
    db.commit()
    return {"message": f"Day {day} schedule cleared"}
