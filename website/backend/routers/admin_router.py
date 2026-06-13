"""Admin portal API endpoints — dashboard stats, admin login, admin-only data."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import verify_password, create_access_token, get_password_hash, get_current_admin
from functools import partial
from datetime import datetime, timedelta

router = APIRouter()

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    admin: dict

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    admin.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({"admin_id": admin.id, "role": admin.role})
    return {"access_token": token, "token_type": "bearer", "admin": {"id": admin.id, "name": admin.name, "email": admin.email, "role": admin.role}}

@router.get("/dashboard")
def dashboard_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    total_families = db.query(func.count(models.Family.id)).scalar()
    total_users = db.query(func.count(models.User.id)).scalar()
    total_devices = db.query(func.count(models.Device.id)).scalar()
    online_devices = db.query(func.count(models.Device.id)).filter(models.Device.is_online == True).scalar()
    active_sos = db.query(func.count(models.SOSAlert.id)).filter(models.SOSAlert.status == "active").scalar()
    total_sos_month = db.query(func.count(models.SOSAlert.id)).scalar()

    premium_subs = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "premium").scalar()
    family_subs = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "family").scalar()
    mrr = (premium_subs * 299) + (family_subs * 499)

    recent_sos = db.query(models.SOSAlert).order_by(desc(models.SOSAlert.triggered_at)).limit(5).all()
    recent_families = db.query(models.Family).order_by(desc(models.Family.created_at)).limit(5).all()

    low_battery = db.query(func.count(models.Device.id)).filter(models.Device.battery_level < 20).scalar()

    return {
        "total_families": total_families,
        "total_users": total_users,
        "total_devices": total_devices,
        "online_devices": online_devices,
        "offline_devices": total_devices - online_devices,
        "low_battery_devices": low_battery,
        "active_sos_alerts": active_sos,
        "total_sos_month": total_sos_month,
        "mrr_inr": mrr,
        "premium_families": premium_subs,
        "family_plan_families": family_subs,
        "free_families": total_families - premium_subs - family_subs,
        "recent_sos": [{"id": s.id, "place": s.place_name, "status": s.status, "triggered_at": s.triggered_at.isoformat() if s.triggered_at else None} for s in recent_sos],
        "recent_families": [{"id": f.id, "name": f.name, "plan": f.plan} for f in recent_families],
    }

@router.get("/families")
def list_families(skip: int = 0, limit: int = 20, plan: Optional[str] = None, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    q = db.query(models.Family)
    if plan:
        q = q.filter(models.Family.plan == plan)
    families = q.offset(skip).limit(limit).all()
    total = db.query(func.count(models.Family.id)).scalar()
    result = []
    for f in families:
        member_count = db.query(func.count(models.FamilyMember.id)).filter(models.FamilyMember.family_id == f.id).scalar()
        sub = db.query(models.Subscription).filter(models.Subscription.family_id == f.id).first()
        result.append({
            "id": f.id, "name": f.name, "plan": f.plan,
            "member_count": member_count,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "monthly_spend": sub.price_inr if sub else 0,
            "status": "active",
        })
    return {"total": total, "families": result}

@router.get("/devices")
def list_devices(skip: int = 0, limit: int = 20, status: Optional[str] = None, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    q = db.query(models.Device)
    if status == "online":
        q = q.filter(models.Device.is_online == True)
    elif status == "offline":
        q = q.filter(models.Device.is_online == False)
    elif status == "low_battery":
        q = q.filter(models.Device.battery_level < 20)
    devices = q.offset(skip).limit(limit).all()
    total = db.query(func.count(models.Device.id)).scalar()
    result = []
    for d in devices:
        user = db.query(models.User).filter(models.User.id == d.user_id).first()
        result.append({
            "id": d.id, "device_name": d.device_name, "os": d.os,
            "os_version": d.os_version, "app_version": d.app_version,
            "battery_level": d.battery_level, "is_online": d.is_online,
            "last_seen": d.last_seen.isoformat() if d.last_seen else None,
            "owner_name": user.name if user else "Unknown",
            "owner_id": d.user_id,
        })
    return {"total": total, "devices": result}

@router.get("/sos-alerts")
def list_sos_alerts(status: Optional[str] = None, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    q = db.query(models.SOSAlert)
    if status:
        q = q.filter(models.SOSAlert.status == status)
    alerts = q.order_by(desc(models.SOSAlert.triggered_at)).all()
    result = []
    for a in alerts:
        user = db.query(models.User).filter(models.User.id == a.user_id).first()
        family = db.query(models.Family).filter(models.Family.id == a.family_id).first()
        result.append({
            "id": a.id, "status": a.status, "place_name": a.place_name,
            "lat": a.lat, "lng": a.lng, "message": a.message,
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "user_name": user.name if user else "Unknown",
            "family_name": family.name if family else "Unknown",
        })
    return {"total": len(result), "alerts": result}

@router.patch("/sos-alerts/{alert_id}/resolve")
def resolve_sos(alert_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    alert = db.query(models.SOSAlert).filter(models.SOSAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = "Admin"
    db.commit()
    return {"message": "Alert resolved"}

@router.get("/notifications")
def list_notifications(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).order_by(desc(models.Notification.sent_at)).all()
    return {"total": len(notifs), "notifications": [{"id": n.id, "title": n.title, "body": n.body, "type": n.type, "target": n.target, "sent_count": n.sent_count, "delivered_count": n.delivered_count, "opened_count": n.opened_count, "sent_at": n.sent_at.isoformat() if n.sent_at else None} for n in notifs]}

@router.post("/notifications/send")
def send_notification(data: dict, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    notif = models.Notification(title=data.get("title", ""), body=data.get("body", ""), type=data.get("type", "info"), target=data.get("target", "all"), sent_count=0, delivered_count=0, opened_count=0)
    db.add(notif)
    db.commit()
    return {"message": "Notification queued", "id": notif.id}

@router.get("/analytics")
def analytics_data(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(models.User.id)).scalar()
    total_families = db.query(func.count(models.Family.id)).scalar()
    total_devices = db.query(func.count(models.Device.id)).scalar()
    total_sos = db.query(func.count(models.SOSAlert.id)).scalar()
    ios_devices = db.query(func.count(models.Device.id)).filter(models.Device.os == "ios").scalar()
    android_devices = db.query(func.count(models.Device.id)).filter(models.Device.os == "android").scalar()
    premium = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "premium").scalar()
    family_plan = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "family").scalar()
    free = total_families - premium - family_plan
    return {
        "total_users": total_users, "total_families": total_families,
        "total_devices": total_devices, "total_sos": total_sos,
        "ios_devices": ios_devices, "android_devices": android_devices,
        "plan_distribution": {"free": free, "premium": premium, "family": family_plan},
    }


# ── User Management ───────────────────────────────────────────────

VALID_ROLES = ["user", "moderator", "admin", "superadmin"]

class UserCreateRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "user"

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None

class UserStatusRequest(BaseModel):
    is_active: bool

class UserPasswordRequest(BaseModel):
    new_password: str

class UserRoleRequest(BaseModel):
    role: str

@router.get("/users")
def list_users(
    skip: int = 0, limit: int = 20,
    search: Optional[str] = None, status: Optional[str] = None,
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    q = db.query(models.User)
    if search:
        q = q.filter(
            (models.User.name.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%")) |
            (models.User.phone.ilike(f"%{search}%"))
        )
    if status == "active":
        q = q.filter(models.User.is_active == True)
    elif status == "inactive":
        q = q.filter(models.User.is_active == False)
    total = q.count()
    users = q.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        device_count = db.query(func.count(models.Device.id)).filter(models.Device.user_id == u.id).scalar()
        membership = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == u.id).first()
        family_name = ""
        if membership:
            family = db.query(models.Family).filter(models.Family.id == membership.family_id).first()
            family_name = family.name if family else ""
        result.append({
            "id": u.id, "name": u.name, "email": u.email,
            "phone": u.phone or "", "is_active": u.is_active,
            "status": "active" if u.is_active else "inactive",
            "role": u.role or "user",
            "devices": device_count, "family_name": family_name,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "avatar": (u.name[:2].upper() if u.name and len(u.name) >= 2 else (u.name[0].upper() if u.name else "?")),
        })
    return {"total": total, "users": result}

@router.post("/users")
def create_user(data: UserCreateRequest, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=data.name, email=data.email, phone=data.phone,
        password_hash=get_password_hash(data.password),
        role=data.role if data.role in VALID_ROLES else "user",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "id": user.id}

@router.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdateRequest, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        if db.query(models.User).filter(models.User.email == data.email, models.User.id != user_id).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    if data.phone is not None:
        user.phone = data.phone
    if data.role is not None:
        if data.role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
        user.role = data.role
    db.commit()
    return {"message": "User updated"}

@router.patch("/users/{user_id}/role")
def change_user_role(user_id: int, data: UserRoleRequest, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    db.commit()
    return {"message": "Role updated"}

@router.patch("/users/{user_id}/status")
def update_user_status(user_id: int, data: UserStatusRequest, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = data.is_active
    db.commit()
    return {"message": "Status updated"}

@router.post("/users/{user_id}/change-password")
def change_user_password(user_id: int, data: UserPasswordRequest, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ── Children ──────────────────────────────────────────────────────────────────

@router.get("/children")
def list_children(
    skip: int = 0, limit: int = 50, search: str = "",
    status: str = "All",
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    """All users who are FamilyMembers with role='child'."""
    q = (
        db.query(models.User, models.FamilyMember, models.Family)
        .join(models.FamilyMember, models.FamilyMember.user_id == models.User.id)
        .join(models.Family, models.Family.id == models.FamilyMember.family_id)
        .filter(models.FamilyMember.role == "child")
    )
    if search:
        q = q.filter(models.User.name.ilike(f"%{search}%"))
    total = q.count()
    rows = q.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    result = []
    for user, member, family in rows:
        # find parent (owner of family)
        owner_member = db.query(models.FamilyMember).filter(
            models.FamilyMember.family_id == family.id,
            models.FamilyMember.role == "owner"
        ).first()
        parent = db.query(models.User).filter(models.User.id == owner_member.user_id).first() if owner_member else None
        device_count = db.query(func.count(models.Device.id)).filter(models.Device.user_id == user.id).scalar() or 0
        has_device = device_count > 0
        result.append({
            "id": user.id,
            "name": user.name,
            "family_name": family.name,
            "parent_name": parent.name if parent else "—",
            "device_count": device_count,
            "device": "GravityWatch" if has_device else "No Device",
            "status": "Safe" if user.is_active else "Offline",
            "is_active": user.is_active,
            "joined_at": user.created_at.isoformat() if user.created_at else None,
        })
    # count by status
    total_safe = sum(1 for r in result if r["status"] == "Safe")
    total_offline = len(result) - total_safe
    if status != "All":
        result = [r for r in result if r["status"] == status]
    return {
        "total": total,
        "safe_count": total_safe,
        "offline_count": total_offline,
        "alert_count": 0,
        "children": result,
    }


# ── Elderly ───────────────────────────────────────────────────────────────────

@router.get("/elderly")
def list_elderly(
    skip: int = 0, limit: int = 50, search: str = "",
    health_filter: str = "All",
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    """Users who have health records (indicating health monitoring)."""
    q = (
        db.query(models.User, models.HealthRecord)
        .join(models.HealthRecord, models.HealthRecord.user_id == models.User.id)
    )
    if search:
        q = q.filter(models.User.name.ilike(f"%{search}%"))
    # deduplicate by user
    seen_ids: set = set()
    rows = q.order_by(desc(models.HealthRecord.recorded_at)).all()
    unique_rows = []
    for user, record in rows:
        if user.id not in seen_ids:
            seen_ids.add(user.id)
            unique_rows.append((user, record))
    total = len(unique_rows)
    result = []
    for user, record in unique_rows[skip: skip + limit]:
        # find caregiver (family owner)
        member = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user.id).first()
        caregiver_name = "—"
        if member:
            owner_m = db.query(models.FamilyMember).filter(
                models.FamilyMember.family_id == member.family_id,
                models.FamilyMember.role == "owner"
            ).first()
            if owner_m:
                owner = db.query(models.User).filter(models.User.id == owner_m.user_id).first()
                caregiver_name = owner.name if owner else "—"
        device_count = db.query(func.count(models.Device.id)).filter(models.Device.user_id == user.id).scalar() or 0
        # derive health status from heart rate
        hr = record.heart_rate or 0
        if hr == 0:
            health = "Stable"
        elif hr > 110 or hr < 50:
            health = "Critical"
        elif hr > 100 or hr < 55:
            health = "At Risk"
        else:
            health = "Stable"
        result.append({
            "id": user.id,
            "name": user.name,
            "caregiver": caregiver_name,
            "health": health,
            "heart_rate": hr,
            "steps": record.steps or 0,
            "last_checkin": record.created_at.isoformat() if record.created_at else None,
            "device": "GravityWatch" if device_count > 0 else "No Device",
            "is_active": user.is_active,
        })
    if health_filter != "All":
        result = [r for r in result if r["health"] == health_filter]
    return {
        "total": total,
        "stable_count": sum(1 for r in result if r["health"] == "Stable"),
        "at_risk_count": sum(1 for r in result if r["health"] == "At Risk"),
        "critical_count": sum(1 for r in result if r["health"] == "Critical"),
        "elderly": result,
    }


# ── Caregivers ────────────────────────────────────────────────────────────────

@router.get("/caregivers")
def list_caregivers(
    skip: int = 0, limit: int = 50, search: str = "",
    status_filter: str = "All",
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    """Family owners who have health-monitored members (acting as caregivers)."""
    owner_members = db.query(models.FamilyMember).filter(models.FamilyMember.role == "owner").all()
    result = []
    for om in owner_members:
        user = db.query(models.User).filter(models.User.id == om.user_id).first()
        if not user:
            continue
        if search and search.lower() not in user.name.lower():
            continue
        # count monitored members in their family that have health records
        family_members = db.query(models.FamilyMember).filter(
            models.FamilyMember.family_id == om.family_id,
            models.FamilyMember.user_id != om.user_id
        ).all()
        monitored_count = 0
        for fm in family_members:
            has_hr = db.query(models.HealthRecord).filter(models.HealthRecord.user_id == fm.user_id).first()
            if has_hr:
                monitored_count += 1
        status = "Active" if user.is_active else "Inactive"
        result.append({
            "id": user.id,
            "name": user.name,
            "phone": user.phone or "—",
            "email": user.email,
            "elders_monitored": monitored_count,
            "family_members": len(family_members),
            "status": status,
            "is_active": user.is_active,
            "joined_at": user.created_at.isoformat() if user.created_at else None,
        })
    total = len(result)
    if status_filter != "All":
        result = [r for r in result if r["status"] == status_filter]
    result = result[skip: skip + limit]
    return {
        "total": total,
        "active_count": sum(1 for r in result if r["status"] == "Active"),
        "inactive_count": sum(1 for r in result if r["status"] == "Inactive"),
        "caregivers": result,
    }


# ── KYC / User Verification ───────────────────────────────────────────────────

@router.get("/verification")
def list_verification(
    skip: int = 0, limit: int = 50, search: str = "",
    status_filter: str = "All", type_filter: str = "All",
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    """User verification status based on phone/email presence."""
    q = db.query(models.User)
    if search:
        q = q.filter(
            (models.User.name.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%"))
        )
    total = q.count()
    users = q.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        # derive verification type and status
        if u.phone:
            v_type = "Phone"
            v_status = "Verified"
        else:
            v_type = "Email"
            v_status = "Pending" if u.is_active else "Rejected"
        result.append({
            "id": u.id,
            "user": u.name,
            "email": u.email,
            "phone": u.phone or "—",
            "submitted": u.created_at.strftime("%d %b %Y") if u.created_at else "—",
            "type": v_type,
            "status": v_status,
            "is_active": u.is_active,
        })
    if status_filter != "All":
        result = [r for r in result if r["status"] == status_filter]
    if type_filter != "All":
        result = [r for r in result if r["type"] == type_filter]
    return {
        "total": total,
        "pending_count": sum(1 for r in result if r["status"] == "Pending"),
        "verified_count": sum(1 for r in result if r["status"] == "Verified"),
        "rejected_count": sum(1 for r in result if r["status"] == "Rejected"),
        "verifications": result,
    }
