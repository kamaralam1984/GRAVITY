from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user

router = APIRouter()

class HealthRecordCreate(BaseModel):
    date: str
    steps: Optional[int] = None
    sleep_hours: Optional[float] = None
    heart_rate: Optional[int] = None
    calories: Optional[int] = None
    water_ml: Optional[int] = None
    active_minutes: Optional[int] = None

class MedReminderCreate(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    times: Optional[List[str]] = None

@router.post("/record")
def save_health_record(data: HealthRecordCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.HealthRecord).filter(models.HealthRecord.user_id == user.id, models.HealthRecord.date == data.date).first()
    if existing:
        for k, v in data.model_dump().items():
            if v is not None:
                setattr(existing, k, v)
        db.commit()
        return {"message": "Updated"}
    record = models.HealthRecord(user_id=user.id, **data.model_dump())
    db.add(record)
    db.commit()
    return {"message": "Saved"}

@router.get("/records/{user_id}")
def get_health_records(user_id: int, limit: int = 30, db: Session = Depends(get_db)):
    records = db.query(models.HealthRecord).filter(models.HealthRecord.user_id == user_id).order_by(desc(models.HealthRecord.date)).limit(limit).all()
    return [{"date": r.date, "steps": r.steps, "sleep_hours": r.sleep_hours, "heart_rate": r.heart_rate, "calories": r.calories, "water_ml": r.water_ml, "active_minutes": r.active_minutes} for r in records]

@router.post("/medication")
def add_medication(data: MedReminderCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = models.MedicationReminder(user_id=user.id, medication_name=data.medication_name, dosage=data.dosage, times=data.times)
    db.add(med)
    db.commit()
    return {"message": "Medication reminder added"}

@router.get("/medications/{user_id}")
def get_medications(user_id: int, db: Session = Depends(get_db)):
    meds = db.query(models.MedicationReminder).filter(models.MedicationReminder.user_id == user_id, models.MedicationReminder.is_active == True).all()
    return [{"id": m.id, "name": m.medication_name, "dosage": m.dosage, "times": m.times} for m in meds]

@router.get("/stats")
def health_stats(db: Session = Depends(get_db)):
    users_tracking = db.query(func.count(func.distinct(models.HealthRecord.user_id))).scalar()
    avg_steps = db.query(func.avg(models.HealthRecord.steps)).scalar()
    avg_sleep = db.query(func.avg(models.HealthRecord.sleep_hours)).scalar()
    return {"users_tracking": users_tracking, "avg_daily_steps": round(avg_steps or 0), "avg_sleep_hours": round(avg_sleep or 0, 1)}
