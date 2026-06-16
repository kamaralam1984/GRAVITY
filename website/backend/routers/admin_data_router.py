"""Admin Data Router — real DB-backed endpoints for the super admin panel."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional, Dict, Any
from database import get_db
import models
from auth import get_current_admin

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. Location History
# ---------------------------------------------------------------------------
@router.get("/location-history")
def location_history(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    search: str = Query(""),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Location, models.User)
        .outerjoin(models.User, models.Location.user_id == models.User.id)
    )
    if search:
        q = q.filter(
            models.Location.place_name.ilike(f"%{search}%")
            | models.User.name.ilike(f"%{search}%")
        )
    rows = q.order_by(desc(models.Location.recorded_at)).offset(skip).limit(limit).all()
    result = []
    for loc, user in rows:
        result.append({
            "id": loc.id,
            "user_id": loc.user_id,
            "user_name": user.name if user else None,
            "user_email": user.email if user else None,
            "lat": loc.lat,
            "lng": loc.lng,
            "place_name": loc.place_name,
            "recorded_at": loc.recorded_at.isoformat() if loc.recorded_at else None,
        })
    return result


# ---------------------------------------------------------------------------
# 2. Login Activity
# ---------------------------------------------------------------------------
LOGIN_EVENTS = ("login", "login_failed", "logout", "2fa_verified", "password_reset")

@router.get("/login-activity")
def login_activity(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.SecurityLog)
        .filter(models.SecurityLog.event_type.in_(LOGIN_EVENTS))
        .order_by(desc(models.SecurityLog.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "event_type": r.event_type,
            "severity": r.severity,
            "user_id": r.user_id,
            "ip_address": r.ip_address,
            "description": r.description,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 3. Notifications List
# ---------------------------------------------------------------------------
@router.get("/notifications-list")
def notifications_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Notification)
        .order_by(desc(models.Notification.sent_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "family_id": r.family_id,
            "title": r.title,
            "body": r.body,
            "type": r.type,
            "target": r.target,
            "sent_count": r.sent_count,
            "delivered_count": r.delivered_count,
            "opened_count": r.opened_count,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            "read_at": r.read_at.isoformat() if r.read_at else None,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 4. Driving Events List
# ---------------------------------------------------------------------------
@router.get("/driving-events-list")
def driving_events_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    search: str = Query(""),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.DrivingEvent, models.User)
        .outerjoin(models.User, models.DrivingEvent.user_id == models.User.id)
    )
    if search:
        q = q.filter(
            models.User.name.ilike(f"%{search}%")
            | models.DrivingEvent.type.ilike(f"%{search}%")
        )
    rows = q.order_by(desc(models.DrivingEvent.occurred_at)).offset(skip).limit(limit).all()
    return [
        {
            "id": ev.id,
            "user_id": ev.user_id,
            "user_name": user.name if user else None,
            "type": ev.type,
            "speed": ev.speed,
            "severity": ev.severity,
            "lat": ev.lat,
            "lng": ev.lng,
            "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
            "resolved": ev.resolved,
        }
        for ev, user in rows
    ]


# ---------------------------------------------------------------------------
# 5. Health Records List
# ---------------------------------------------------------------------------
@router.get("/health-records-list")
def health_records_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.HealthRecord, models.User)
        .outerjoin(models.User, models.HealthRecord.user_id == models.User.id)
        .order_by(desc(models.HealthRecord.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": hr.id,
            "user_id": hr.user_id,
            "user_name": user.name if user else None,
            "date": hr.date,
            "steps": hr.steps,
            "heart_rate": hr.heart_rate,
            "calories": hr.calories,
            "sleep_hours": hr.sleep_hours,
            "water_ml": hr.water_ml,
            "active_minutes": hr.active_minutes,
            "created_at": hr.created_at.isoformat() if hr.created_at else None,
        }
        for hr, user in rows
    ]


# ---------------------------------------------------------------------------
# 6. Medications List
# ---------------------------------------------------------------------------
@router.get("/medications-list")
def medications_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.MedicationReminder, models.User)
        .outerjoin(models.User, models.MedicationReminder.user_id == models.User.id)
        .order_by(desc(models.MedicationReminder.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": med.id,
            "user_id": med.user_id,
            "user_name": user.name if user else None,
            "medication_name": med.medication_name,
            "dosage": med.dosage,
            "times": med.times,
            "start_date": med.start_date,
            "is_active": med.is_active,
            "last_taken": med.last_taken.isoformat() if med.last_taken else None,
            "created_at": med.created_at.isoformat() if med.created_at else None,
        }
        for med, user in rows
    ]


# ---------------------------------------------------------------------------
# 7. Messages Summary
# ---------------------------------------------------------------------------
@router.get("/messages-summary")
def messages_summary(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    agg = (
        db.query(
            models.Message.family_id,
            func.count(models.Message.id).label("message_count"),
            func.count(models.Message.media_url).label("media_count"),
            func.max(models.Message.sent_at).label("last_sent"),
        )
        .group_by(models.Message.family_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Build a lookup of family names
    family_ids = [row.family_id for row in agg]
    families_map: dict = {}
    if family_ids:
        families = db.query(models.Family).filter(models.Family.id.in_(family_ids)).all()
        families_map = {f.id: f.name for f in families}

    # Count reported messages per family separately (avoids cast issues)
    reported_map: dict = {}
    if family_ids:
        reported_rows = (
            db.query(models.Message.family_id, func.count(models.Message.id))
            .filter(models.Message.family_id.in_(family_ids), models.Message.is_reported == True)
            .group_by(models.Message.family_id)
            .all()
        )
        reported_map = {fid: cnt for fid, cnt in reported_rows}

    return [
        {
            "family_id": row.family_id,
            "family_name": families_map.get(row.family_id),
            "message_count": row.message_count,
            "media_count": row.media_count or 0,
            "reported_count": reported_map.get(row.family_id, 0),
            "last_sent": row.last_sent.isoformat() if row.last_sent else None,
        }
        for row in agg
    ]


# ---------------------------------------------------------------------------
# 8. Payments List
# ---------------------------------------------------------------------------
@router.get("/payments-list")
def payments_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Payment, models.User)
        .outerjoin(models.User, models.Payment.user_id == models.User.id)
        .order_by(desc(models.Payment.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": pay.id,
            "user_id": pay.user_id,
            "user_name": user.name if user else None,
            "user_email": user.email if user else None,
            "amount": pay.amount,
            "currency": pay.currency,
            "gateway": pay.gateway,
            "status": pay.status,
            "txn_id": pay.txn_id,
            "billing_cycle": pay.billing_cycle,
            "created_at": pay.created_at.isoformat() if pay.created_at else None,
        }
        for pay, user in rows
    ]


# ---------------------------------------------------------------------------
# 9. Security Logs List
# ---------------------------------------------------------------------------
@router.get("/security-logs-list")
def security_logs_list(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    severity: str = Query(""),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(models.SecurityLog, models.User).outerjoin(
        models.User, models.SecurityLog.user_id == models.User.id
    )
    if severity:
        q = q.filter(models.SecurityLog.severity == severity)
    rows = q.order_by(desc(models.SecurityLog.created_at)).offset(skip).limit(limit).all()
    return [
        {
            "id": sl.id,
            "event_type": sl.event_type,
            "severity": sl.severity,
            "user_id": sl.user_id,
            "user_name": user.name if user else None,
            "ip_address": sl.ip_address,
            "description": sl.description,
            "metadata_json": sl.metadata_json,
            "resolved": sl.resolved,
            "created_at": sl.created_at.isoformat() if sl.created_at else None,
        }
        for sl, user in rows
    ]


# ---------------------------------------------------------------------------
# 10. Audit Logs List
# ---------------------------------------------------------------------------
@router.get("/audit-logs-list")
def audit_logs_list(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.AuditLog)
        .order_by(desc(models.AuditLog.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": al.id,
            "event_type": al.event_type,
            "actor": al.actor,
            "action": al.action,
            "resource": al.resource,
            "ip_address": al.ip_address,
            "status": al.status,
            "details": al.details,
            "created_at": al.created_at.isoformat() if al.created_at else None,
        }
        for al in rows
    ]


# ---------------------------------------------------------------------------
# 11. Schools List
# ---------------------------------------------------------------------------
@router.get("/schools-list")
def schools_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.SchoolInfo, models.User)
        .outerjoin(models.User, models.SchoolInfo.user_id == models.User.id)
        .order_by(desc(models.SchoolInfo.updated_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": si.id,
            "user_id": si.user_id,
            "user_name": user.name if user else None,
            "school_name": si.school_name,
            "class_name": si.class_name,
            "section": si.section,
            "bus_number": si.bus_number,
            "bus_driver": si.bus_driver,
            "updated_at": si.updated_at.isoformat() if si.updated_at else None,
        }
        for si, user in rows
    ]


# ---------------------------------------------------------------------------
# 12. Analytics Summary
# ---------------------------------------------------------------------------
@router.get("/analytics-summary")
def analytics_summary(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    active_users = db.query(func.count(models.User.id)).filter(models.User.is_active == True).scalar() or 0
    total_families = db.query(func.count(models.Family.id)).scalar() or 0
    total_sos = db.query(func.count(models.SOSAlert.id)).scalar() or 0
    total_locations = db.query(func.count(models.Location.id)).scalar() or 0
    total_devices = db.query(func.count(models.Device.id)).scalar() or 0
    total_revenue_inr = db.query(func.coalesce(func.sum(models.Subscription.price_inr), 0)).scalar() or 0

    plans_rows = (
        db.query(models.Subscription.plan, func.count(models.Subscription.id))
        .group_by(models.Subscription.plan)
        .all()
    )
    plans_breakdown = {plan: cnt for plan, cnt in plans_rows}

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_families": total_families,
        "total_sos": total_sos,
        "total_locations": total_locations,
        "total_devices": total_devices,
        "total_revenue_inr": total_revenue_inr,
        "plans_breakdown": plans_breakdown,
    }


# ---------------------------------------------------------------------------
# 13. Feedback List
# ---------------------------------------------------------------------------
@router.get("/feedback-list")
def feedback_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Feedback, models.User)
        .outerjoin(models.User, models.Feedback.user_id == models.User.id)
        .order_by(desc(models.Feedback.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": fb.id,
            "user_id": fb.user_id,
            "user_name": user.name if user else fb.name,
            "user_email": user.email if user else fb.email,
            "name": fb.name,
            "email": fb.email,
            "rating": fb.rating,
            "category": fb.category,
            "message": fb.message,
            "status": fb.status,
            "created_at": fb.created_at.isoformat() if fb.created_at else None,
        }
        for fb, user in rows
    ]


# ---------------------------------------------------------------------------
# 14. Create Feedback (admin testing)
# ---------------------------------------------------------------------------
class FeedbackCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    rating: Optional[int] = None
    category: str = "general"
    message: str


@router.post("/feedback-list", status_code=201)
def create_feedback(
    data: FeedbackCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    fb = models.Feedback(
        name=data.name,
        email=data.email,
        rating=data.rating,
        category=data.category,
        message=data.message,
        status="new",
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {
        "id": fb.id,
        "name": fb.name,
        "email": fb.email,
        "rating": fb.rating,
        "category": fb.category,
        "message": fb.message,
        "status": fb.status,
        "created_at": fb.created_at.isoformat() if fb.created_at else None,
    }


# ---------------------------------------------------------------------------
# 15. Contact Requests List
# ---------------------------------------------------------------------------
@router.get("/contact-requests-list")
def contact_requests_list(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.ContactRequest)
        .order_by(desc(models.ContactRequest.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": cr.id,
            "name": cr.name,
            "email": cr.email,
            "phone": cr.phone,
            "subject": cr.subject,
            "message": cr.message,
            "status": cr.status,
            "created_at": cr.created_at.isoformat() if cr.created_at else None,
        }
        for cr in rows
    ]


# ---------------------------------------------------------------------------
# 16. Settings Config — GET
# ---------------------------------------------------------------------------
@router.get("/settings-config")
def get_settings_config(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = db.query(models.AppSetting).all()
    return {row.key: row.value for row in rows}


# ---------------------------------------------------------------------------
# 17. Settings Config — POST (upsert)
# ---------------------------------------------------------------------------
@router.post("/settings-config")
def upsert_settings_config(
    data: Dict[str, Any],
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    updated = []
    for key, value in data.items():
        existing = db.query(models.AppSetting).filter(models.AppSetting.key == key).first()
        if existing:
            existing.value = str(value) if value is not None else None
        else:
            db.add(models.AppSetting(key=key, value=str(value) if value is not None else None))
        updated.append(key)
    db.commit()
    return {"updated": updated, "count": len(updated)}
