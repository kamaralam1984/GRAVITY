from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, text
from database import get_db, DATABASE_URL
import models, os, shutil, json
from auth import get_current_admin
from datetime import datetime, timedelta
import cache

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _invalidate_admin():
    """Bust all admin-scoped cache keys."""
    cache.cdel_pattern("admin:*")


# ── Platform Stats ────────────────────────────────────────────────────────────

@router.get("/stats")
def platform_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """Platform-wide stats for super admin Command Center."""
    key = cache.ck("admin", "stats")
    cached = cache.cget(key)
    if cached is not None:
        return cached

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
    mrr = db.query(func.coalesce(func.sum(models.Subscription.price_inr), 0)).filter(
        models.Subscription.status == "active"
    ).scalar() or 0
    total_support = db.query(func.count(models.SupportTicket.id)).scalar() or 0
    open_tickets = db.query(func.count(models.SupportTicket.id)).filter(models.SupportTicket.status == "open").scalar() or 0

    result = {
        "total_users": total_users, "total_families": total_families,
        "total_devices": total_devices, "online_devices": online_devices,
        "active_sos": active_sos, "total_sos": total_sos,
        "total_geofences": total_geofences,
        "premium_subscribers": premium_subs, "family_subscribers": family_subs,
        "mrr_inr": mrr, "total_revenue_inr": total_payments,
        "total_support_tickets": total_support, "open_tickets": open_tickets,
    }
    cache.cset(key, result, cache.TTL.ADMIN_STATS)
    return result


@router.get("/users")
def all_users(
    skip: int = 0, limit: int = 50, search: str = "",
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    """All users for super admin panel."""
    key = cache.ck("admin", "users", skip, limit, search)
    cached = cache.cget(key)
    if cached is not None:
        return cached

    q = db.query(models.User)
    if search:
        q = q.filter((models.User.name.ilike(f"%{search}%")) | (models.User.email.ilike(f"%{search}%")))
    total = q.count()
    users = q.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    user_ids = [u.id for u in users]

    device_counts = dict(
        db.query(models.Device.user_id, func.count(models.Device.id))
        .filter(models.Device.user_id.in_(user_ids))
        .group_by(models.Device.user_id)
        .all()
    )
    family_rows = (
        db.query(models.FamilyMember.user_id, models.Family.name)
        .join(models.Family, models.Family.id == models.FamilyMember.family_id)
        .filter(models.FamilyMember.user_id.in_(user_ids))
        .all()
    )
    family_names = {row.user_id: row.name for row in family_rows}

    result = []
    for u in users:
        result.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
            "role": u.role, "is_active": u.is_active,
            "family_name": family_names.get(u.id),
            "device_count": device_counts.get(u.id, 0),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    payload = {"total": total, "users": result}
    cache.cset(key, payload, cache.TTL.ADMIN_USERS)
    return payload


@router.get("/sos")
def sos_alerts(
    status: str = "all", limit: int = 50,
    admin=Depends(get_current_admin), db: Session = Depends(get_db)
):
    key = cache.ck("admin", "sos", status, limit)
    cached = cache.cget(key)
    if cached is not None:
        return cached

    q = (
        db.query(models.SOSAlert, models.User, models.Family)
        .join(models.User, models.User.id == models.SOSAlert.user_id)
        .join(models.Family, models.Family.id == models.SOSAlert.family_id)
    )
    if status != "all":
        q = q.filter(models.SOSAlert.status == status)
    rows = q.order_by(desc(models.SOSAlert.triggered_at)).limit(limit).all()

    result = []
    for a, user, family in rows:
        result.append({
            "id": a.id, "status": a.status, "lat": a.lat, "lng": a.lng,
            "place_name": a.place_name, "message": a.message,
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else None,
            "family_name": family.name if family else "Unknown",
        })

    payload = {"total": len(result), "alerts": result}
    cache.cset(key, payload, cache.TTL.ADMIN_SOS)
    return payload


@router.get("/revenue")
def revenue_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    key = cache.ck("admin", "revenue")
    cached = cache.cget(key)
    if cached is not None:
        return cached

    total_success = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(models.Payment.status == "success").scalar() or 0
    total_count = db.query(func.count(models.Payment.id)).scalar() or 0
    success_count = db.query(func.count(models.Payment.id)).filter(models.Payment.status == "success").scalar() or 0
    rows = (
        db.query(models.Payment, models.User)
        .join(models.User, models.User.id == models.Payment.user_id)
        .order_by(desc(models.Payment.created_at))
        .limit(100)
        .all()
    )
    result = []
    for p, user in rows:
        result.append({
            "id": p.id, "amount": p.amount, "currency": p.currency,
            "gateway": p.gateway, "status": p.status,
            "billing_cycle": p.billing_cycle,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else None,
        })

    payload = {
        "total_revenue_inr": total_success, "total_transactions": total_count,
        "successful_transactions": success_count, "payments": result
    }
    cache.cset(key, payload, cache.TTL.ADMIN_REVENUE)
    return payload


@router.get("/subscriptions")
def all_subscriptions(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    key = cache.ck("admin", "subscriptions")
    cached = cache.cget(key)
    if cached is not None:
        return cached

    rows = (
        db.query(models.Subscription, models.Family)
        .join(models.Family, models.Family.id == models.Subscription.family_id)
        .order_by(desc(models.Subscription.started_at))
        .all()
    )
    result = []
    for s, family in rows:
        result.append({
            "id": s.id, "plan": s.plan, "status": s.status,
            "price_inr": s.price_inr, "payment_method": s.payment_method,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            "family_name": family.name if family else "Unknown",
            "family_id": s.family_id,
        })

    payload = {"total": len(result), "subscriptions": result}
    cache.cset(key, payload, cache.TTL.ADMIN_SUBS)
    return payload


@router.get("/support")
def support_overview(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    key = cache.ck("admin", "support")
    cached = cache.cget(key)
    if cached is not None:
        return cached

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

    payload = {
        "open_count": open_count, "resolved_today": resolved_today,
        "total": len(result), "tickets": result
    }
    cache.cset(key, payload, cache.TTL.ADMIN_SUPPORT)
    return payload


@router.patch("/users/{user_id}/suspend")
def suspend_user(user_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    # Invalidate all admin caches — user counts + lists changed
    _invalidate_admin()
    return {"message": "User status updated", "is_active": user.is_active}


# ── Backup & Restore ──────────────────────────────────────────────────────────

def _get_db_path() -> str:
    url = DATABASE_URL
    if url.startswith("sqlite:///./"):
        return url.replace("sqlite:///./", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise HTTPException(status_code=400, detail="Backup only supported for SQLite databases")

@router.get("/backup/download")
def download_backup(admin=Depends(get_current_admin)):
    """Download full SQLite database as backup file."""
    db_path = _get_db_path()
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail="Database file not found")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"gravity_backup_{timestamp}.db"
    backup_path = f"/tmp/{backup_name}"
    shutil.copy2(db_path, backup_path)
    return FileResponse(backup_path, filename=backup_name, media_type="application/octet-stream")

@router.post("/backup/restore")
async def restore_backup(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    """Restore database from uploaded backup file."""
    if not file.filename.endswith(".db"):
        raise HTTPException(status_code=400, detail="Only .db files allowed")
    db_path = _get_db_path()
    safety_backup = db_path + ".before_restore"
    shutil.copy2(db_path, safety_backup)
    try:
        contents = await file.read()
        tmp_path = "/tmp/gravity_restore_upload.db"
        with open(tmp_path, "wb") as f:
            f.write(contents)
        shutil.copy2(tmp_path, db_path)
        cache.flush()  # full flush after restore
        return {"message": "Database restored successfully. Restart the server to apply changes."}
    except Exception as e:
        shutil.copy2(safety_backup, db_path)
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.get("/backup/family-tables")
def list_family_tables(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all per-family tables that exist in the database."""
    rows = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'family_%_data' ORDER BY name")).fetchall()
    result = []
    for row in rows:
        table_name = row[0]
        count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
        family_id = int(table_name.split("_")[1])
        family = db.query(models.Family).filter(models.Family.id == family_id).first()
        result.append({"table": table_name, "family_id": family_id, "family_name": family.name if family else "Unknown", "event_count": count})
    return {"tables": result}

@router.get("/backup/family/{family_id}/export")
def export_family_data(family_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """Export all data from a family's dedicated table as JSON."""
    table = f"family_{family_id}_data"
    try:
        rows = db.execute(text(f"SELECT * FROM {table} ORDER BY recorded_at DESC")).fetchall()
        family = db.query(models.Family).filter(models.Family.id == family_id).first()
        events = [{"id": r[0], "event_type": r[1], "user_id": r[2], "user_name": r[3], "data": json.loads(r[4] or "{}"), "recorded_at": str(r[5])} for r in rows]
        return {"family_id": family_id, "family_name": family.name if family else "Unknown", "exported_at": datetime.utcnow().isoformat(), "total_events": len(events), "events": events}
    except Exception:
        raise HTTPException(status_code=404, detail=f"No data table found for family {family_id}. Family may predate this feature.")
