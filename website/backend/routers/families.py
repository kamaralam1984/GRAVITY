"""Family circle management."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models, secrets, json
from auth import get_current_user
from datetime import datetime, timezone, timedelta


def create_family_table(db: Session, family_id: int, family_name: str):
    """Create a per-family data table when a new family is registered."""
    table = f"family_{family_id}_data"
    db.execute(text(f"""
        CREATE TABLE IF NOT EXISTS {table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            user_id INTEGER,
            user_name TEXT,
            data_json TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    db.execute(text(f"""
        INSERT INTO {table} (event_type, user_name, data_json)
        VALUES ('family_created', :name, :data)
    """), {"name": family_name, "data": json.dumps({"family_name": family_name, "family_id": family_id})})
    db.commit()


def log_family_event(db: Session, family_id: int, event_type: str, user_id: int = None, user_name: str = None, data: dict = None):
    """Write an event to the family's dedicated table."""
    try:
        table = f"family_{family_id}_data"
        db.execute(text(f"""
            INSERT INTO {table} (event_type, user_id, user_name, data_json)
            VALUES (:etype, :uid, :uname, :data)
        """), {"etype": event_type, "uid": user_id, "uname": user_name, "data": json.dumps(data or {})})
        db.commit()
    except Exception:
        pass  # Don't break main flow if family table missing

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
    # Create per-family dedicated table
    create_family_table(db, family.id, family.name)
    log_family_event(db, family.id, "owner_joined", user.id, user.name, {"email": user.email, "role": "owner"})
    return {"id": family.id, "name": family.name, "invite_code": family.invite_code, "plan": family.plan}

class JoinRequest(BaseModel):
    role: Optional[str] = "child"

@router.post("/join/{invite_code}")
def join_family(invite_code: str, body: Optional[JoinRequest] = None, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.invite_code.ilike(invite_code)).first()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    existing = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family.id, models.FamilyMember.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")
    role = (body.role if body and body.role in ("child", "parent") else "child")
    member = models.FamilyMember(family_id=family.id, user_id=user.id, role=role)
    db.add(member)
    db.commit()
    log_family_event(db, family.id, "member_joined", user.id, user.name, {"email": user.email, "role": role, "family_name": family.name})
    return {"message": "Joined family", "family_name": family.name, "family_id": family.id, "role": role}

class RoleUpdateRequest(BaseModel):
    role: str

@router.patch("/{family_id}/members/{user_id}/role")
def update_member_role(family_id: int, user_id: int, data: RoleUpdateRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id, models.Family.owner_id == user.id).first()
    if not family:
        raise HTTPException(status_code=403, detail="Only the owner can change member roles")
    if data.role not in ("child", "parent", "owner"):
        raise HTTPException(status_code=400, detail="Role must be child, parent, or owner")
    member = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id, models.FamilyMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot change owner role")
    member.role = data.role
    db.commit()
    return {"user_id": user_id, "role": data.role}

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
            result.append({"user_id": user.id, "name": user.name, "phone": user.phone, "role": m.role, "last_location": loc.place_name if loc else None, "lat": loc.lat if loc else None, "lng": loc.lng if loc else None, "battery": battery, "is_online": is_online})
    return result


@router.get("/{family_id}/data-log")
def get_family_data_log(family_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """Return all events from this family's dedicated table."""
    table = f"family_{family_id}_data"
    try:
        rows = db.execute(text(f"SELECT * FROM {table} ORDER BY recorded_at DESC LIMIT :limit"), {"limit": limit}).fetchall()
        return [{"id": r[0], "event_type": r[1], "user_id": r[2], "user_name": r[3], "data": json.loads(r[4] or "{}"), "recorded_at": str(r[5])} for r in rows]
    except Exception:
        return []


@router.post("/{family_id}/init-table")
def init_family_table(family_id: int, db: Session = Depends(get_db)):
    """Create family table if it doesn't exist (for existing families)."""
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    create_family_table(db, family.id, family.name)
    # Log all existing members
    members = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id).all()
    for m in members:
        u = db.query(models.User).filter(models.User.id == m.user_id).first()
        if u:
            log_family_event(db, family_id, "member_retroactive", u.id, u.name, {"email": u.email, "role": m.role})
    return {"message": f"Table family_{family_id}_data ready", "members_logged": len(members)}
