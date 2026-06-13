from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user

router = APIRouter()

class EmergencyProfileCreate(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    insurance_provider: Optional[str] = None
    insurance_policy_no: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    notes: Optional[str] = None

@router.post("/")
def save_emergency_profile(data: EmergencyProfileCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.EmergencyProfile).filter(models.EmergencyProfile.user_id == user.id).first()
    if existing:
        for k, v in data.model_dump().items():
            if v is not None:
                setattr(existing, k, v)
        db.commit()
        return {"message": "Profile updated"}
    profile = models.EmergencyProfile(user_id=user.id, **data.model_dump())
    db.add(profile)
    db.commit()
    return {"message": "Emergency profile created"}

@router.get("/me")
def get_my_profile(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.EmergencyProfile).filter(models.EmergencyProfile.user_id == user.id).first()
    if not profile:
        return {}
    return {"blood_group": profile.blood_group, "allergies": profile.allergies, "medications": profile.medications, "conditions": profile.conditions, "insurance_provider": profile.insurance_provider, "emergency_contact_name": profile.emergency_contact_name, "emergency_contact_phone": profile.emergency_contact_phone, "doctor_name": profile.doctor_name, "notes": profile.notes}

@router.get("/{user_id}")
def get_profile_by_id(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.EmergencyProfile).filter(models.EmergencyProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No emergency profile found")
    return {"blood_group": profile.blood_group, "allergies": profile.allergies, "conditions": profile.conditions, "emergency_contact_name": profile.emergency_contact_name, "emergency_contact_phone": profile.emergency_contact_phone}
