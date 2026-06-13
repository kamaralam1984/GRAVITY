from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from database import get_db
import models
from auth import get_current_admin
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
def platform_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """Platform-wide stats for super admin Command Center."""
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_families = db.query(func.count(models.Family.id)).scalar() or 0
    total_devices = db.query(func.count(models.Device.id)).scalar() or 0
    online_devices = db.query(func.count(models.Device.id)).filter(models.Device.is_online == True).scalar() or 0
    active_sos = db.query(func.count(models.SOSAlert.id)).filter(models.SOSAlert.status == "active").scalar() or 0
    total_sos = db.query(func.count(models.SOSAlert.id)).scalar() or 0
    total_geofences = db.query(func.count(models.Geofence.id)).scalar() or 0
    premium_subs = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "premium").scalar() or 0
    family_subs = db.query(func.count(models.Subscription.id)).filter(models.Subscription.plan == "family").scalar() or 0
    total_payments = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(models.Payment.status == "success").scalar() or 0
    mrr = (premium_subs * 299) + (family_subs * 499)
    total_support = db.query(func.count(models.SupportTicket.id)).scalar() or 0
    open_tickets = db.query(func.count(models.SupportTicket.id)).filter(models.SupportTicket.status == "open").scalar() or 0
    return {
        "total_users": total_users, "total_families": total_families,
        "total_devices": total_devices, "online_devices": online_devices,
        "active_sos": active_sos, "total_sos": total_sos,
        "total_geofences": total_geofences,
        "premium_subscribers": premium_subs, "family_subscribers": family_subs,
        "mrr_inr": mrr, "total_revenue_inr": total_payments,
        "total_support_tickets": total_support, "open_tickets": open_tickets,
    }

@router.get("/users")
def all_users(skip: int = 0, limit: int = 50, search: str = "", admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """All users for super admin panel."""
    q = db.query(models.User)
    if search:
        q = q.filter((models.User.name.ilike(f"%{search}%")) | (models.User.email.ilike(f"%{search}%")))
    total = q.count()
    users = q.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        fam = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == u.id).first()
        family_name = None
        if fam:
            f = db.query(models.Family).filter(models.Family.id == fam.family_id).first()
            family_name = f.name if f else None
        dev_count = db.query(func.count(models.Device.id)).filter(models.Device.user_id == u.id).scalar()
        result.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
            "role": u.role, "is_active": u.is_active,
            "family_name": family_name, "device_count": dev_count,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return {"total": total, "users": result}

@router.get("/sos")
def sos_alerts(status: str = "all", limit: int = 50, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    q = db.query(models.SOSAlert)
    if status != "all": q = q.filter(models.SOSAlert.status == status)
    alerts = q.order_by(desc(models.SOSAlert.triggered_at)).limit(limit).all()
    result = []
    for a in alerts:
        user = db.query(models.User).filter(models.User.id == a.user_id).first()
        family = db.query(models.Family).filter(models.Family.id == a.family_id).first()
        result.append({
            "id": a.id, "status": a.status, "lat": a.lat, "lng": a.lng,
            "place_name": a.place_name, "message": a.message,
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else None,
            "family_name": family.name if family else "Unknown",
        })
    return {"total": len(result), "alerts": result}

@router.get("/revenue")
def revenue_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    payments = db.query(models.Payment).order_by(desc(models.Payment.created_at)).limit(100).all()
    total_success = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(models.Payment.status == "success").scalar() or 0
    total_count = db.query(func.count(models.Payment.id)).scalar() or 0
    success_count = db.query(func.count(models.Payment.id)).filter(models.Payment.status == "success").scalar() or 0
    result = []
    for p in payments:
        user = db.query(models.User).filter(models.User.id == p.user_id).first()
        result.append({
            "id": p.id, "amount": p.amount, "currency": p.currency,
            "gateway": p.gateway, "status": p.status,
            "billing_cycle": p.billing_cycle,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else None,
        })
    return {
        "total_revenue_inr": total_success, "total_transactions": total_count,
        "successful_transactions": success_count, "payments": result
    }

@router.get("/subscriptions")
def all_subscriptions(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    subs = db.query(models.Subscription).order_by(desc(models.Subscription.started_at)).all()
    result = []
    for s in subs:
        family = db.query(models.Family).filter(models.Family.id == s.family_id).first()
        result.append({
            "id": s.id, "plan": s.plan, "status": s.status,
            "price_inr": s.price_inr, "payment_method": s.payment_method,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            "family_name": family.name if family else "Unknown",
            "family_id": s.family_id,
        })
    return {"total": len(result), "subscriptions": result}

@router.get("/support")
def support_overview(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).order_by(desc(models.SupportTicket.created_at)).limit(100).all()
    open_count = db.query(func.count(models.SupportTicket.id)).filter(models.SupportTicket.status == "open").scalar() or 0
    resolved_today = db.query(func.count(models.SupportTicket.id)).filter(
        models.SupportTicket.status == "resolved",
        models.SupportTicket.resolved_at >= datetime.utcnow().date()
    ).scalar() or 0
    result = []
    for t in tickets:
        result.append({
            "id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
            "category": t.category, "priority": t.priority, "status": t.status,
            "user_email": t.user_email, "assigned_to": t.assigned_to,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return {
        "open_count": open_count, "resolved_today": resolved_today,
        "total": len(result), "tickets": result
    }

@router.patch("/users/{user_id}/suspend")
def suspend_user(user_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}
