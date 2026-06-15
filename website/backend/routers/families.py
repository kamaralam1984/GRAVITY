"""Family circle management."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models, secrets
from auth import get_current_user
from datetime import datetime, timezone, timedelta

router = APIRouter()

class FamilyCreate(BaseModel):
    name: str

class FamilyResponse(BaseModel):
    id: int
    name: str
    plan: str
    invite_code: str
    created_at: Optional[str]

@router.post("/create")
def create_family(data: FamilyCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = models.Family(name=data.name, owner_id=user.id, invite_code=secrets.token_urlsafe(6))
    db.add(family)
    db.commit()
    db.refresh(family)
    # Add owner as first member
    member = models.FamilyMember(family_id=family.id, user_id=user.id, role="owner")
    db.add(member)
    # Add free subscription
    sub = models.Subscription(family_id=family.id, plan="free", price_inr=0, status="active")
    db.add(sub)
    db.commit()
    return {"id": family.id, "name": family.name, "invite_code": family.invite_code, "plan": family.plan}

@router.post("/join/{invite_code}")
def join_family(invite_code: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.invite_code == invite_code).first()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    existing = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family.id, models.FamilyMember.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")
    member = models.FamilyMember(family_id=family.id, user_id=user.id, role="member")
    db.add(member)
    db.commit()
    return {"message": "Joined family", "family_name": family.name}

@router.get("/my")
def my_families(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user.id).all()
    result = []
    for m in memberships:
        family = db.query(models.Family).filter(models.Family.id == m.family_id).first()
        if family:
            members = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family.id).all()
            result.append({"id": family.id, "name": family.name, "plan": family.plan, "role": m.role, "member_count": len(members), "invite_code": family.invite_code})
    return result

@router.patch("/{family_id}/rename")
def rename_family(family_id: int, data: dict, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id, models.Family.owner_id == user.id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found or not owner")
    family.name = data.get("name", family.name)
    db.commit()
    return {"id": family.id, "name": family.name, "invite_code": family.invite_code}

@router.delete("/{family_id}/members/{user_id}")
def remove_member(family_id: int, user_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id, models.Family.owner_id == user.id).first()
    if not family:
        raise HTTPException(status_code=403, detail="Only the owner can remove members")
    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    member = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id, models.FamilyMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}

@router.post("/{family_id}/regenerate-code")
def regenerate_invite_code(family_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id, models.Family.owner_id == user.id).first()
    if not family:
        raise HTTPException(status_code=403, detail="Only the owner can regenerate the code")
    family.invite_code = secrets.token_urlsafe(6)
    db.commit()
    return {"invite_code": family.invite_code}

@router.get("/{family_id}/members")
def get_members(family_id: int, db: Session = Depends(get_db)):
    members = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id).all()
    result = []
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if user:
            loc = db.query(models.Location).filter(models.Location.user_id == user.id).order_by(models.Location.recorded_at.desc()).first()
            devices = db.query(models.Device).filter(models.Device.user_id == user.id).all()
            # Online if: location within 30 min OR any device heartbeat within 5 min
            is_online = False
            if loc and loc.recorded_at:
                try:
                    rec = loc.recorded_at if loc.recorded_at.tzinfo else loc.recorded_at.replace(tzinfo=timezone.utc)
                    is_online = (datetime.now(timezone.utc) - rec).total_seconds() < 1800
                except Exception:
                    pass
            if not is_online:
                for device in devices:
                    if device.last_seen:
                        try:
                            seen = device.last_seen if device.last_seen.tzinfo else device.last_seen.replace(tzinfo=timezone.utc)
                            if (datetime.now(timezone.utc) - seen).total_seconds() < 300:
                                is_online = True
                                break
                        except Exception:
                            pass
            battery = next((d.battery_level for d in devices if d.battery_level is not None), None)
            result.append({"user_id": user.id, "name": user.name, "role": m.role, "last_location": loc.place_name if loc else None, "lat": loc.lat if loc else None, "lng": loc.lng if loc else None, "battery": battery, "is_online": is_online})
    return result
