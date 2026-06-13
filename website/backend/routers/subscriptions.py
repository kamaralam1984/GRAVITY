from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
import models
from auth import get_current_user

router = APIRouter()


class SubscriptionCreate(BaseModel):
    plan_id: int
    payment_id: int
    billing_cycle: str = "monthly"


class SubscriptionCancel(BaseModel):
    reason: str
    feedback: Optional[str] = None


@router.post("/create")
def create_subscription(data: SubscriptionCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(models.Plan).filter(models.Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    payment = db.query(models.Payment).filter(models.Payment.id == data.payment_id, models.Payment.status == "success").first()
    if not payment:
        raise HTTPException(status_code=400, detail="Valid payment required")
    months = 12 if data.billing_cycle == "yearly" else 1
    end_date = datetime.utcnow() + timedelta(days=30 * months)
    sub = models.UserSubscription(
        user_id=user.id,
        plan_id=data.plan_id,
        payment_id=data.payment_id,
        billing_cycle=data.billing_cycle,
        status="active",
        amount=payment.amount,
        start_date=datetime.utcnow(),
        end_date=end_date,
        auto_renew=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"subscription_id": sub.id, "status": "active", "end_date": sub.end_date.isoformat()}


@router.get("/my")
def my_subscription(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(models.UserSubscription).filter(
        models.UserSubscription.user_id == user.id,
        models.UserSubscription.status.in_(["active", "trial"]),
    ).order_by(desc(models.UserSubscription.created_at)).first()
    if not sub:
        return {"subscription": None}
    plan = db.query(models.Plan).filter(models.Plan.id == sub.plan_id).first()
    return {
        "subscription": {
            "id": sub.id,
            "plan": plan.name if plan else "Unknown",
            "status": sub.status,
            "billing_cycle": sub.billing_cycle,
            "amount": sub.amount,
            "start_date": sub.start_date.isoformat() if sub.start_date else None,
            "end_date": sub.end_date.isoformat() if sub.end_date else None,
            "auto_renew": sub.auto_renew,
        }
    }


@router.get("/all")
def all_subscriptions(limit: int = 50, offset: int = 0, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.UserSubscription)
    if status:
        q = q.filter(models.UserSubscription.status == status)
    subs = q.order_by(desc(models.UserSubscription.created_at)).offset(offset).limit(limit).all()
    total = db.query(func.count(models.UserSubscription.id)).scalar()
    result = []
    for s in subs:
        user = db.query(models.User).filter(models.User.id == s.user_id).first()
        plan = db.query(models.Plan).filter(models.Plan.id == s.plan_id).first()
        result.append({
            "id": s.id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "plan": plan.name if plan else "Unknown",
            "status": s.status,
            "billing_cycle": s.billing_cycle,
            "amount": s.amount,
            "start_date": s.start_date.isoformat() if s.start_date else None,
            "end_date": s.end_date.isoformat() if s.end_date else None,
            "auto_renew": s.auto_renew,
        })
    return {"total": total, "subscriptions": result}


@router.get("/stats")
def subscription_stats(db: Session = Depends(get_db)):
    active = db.query(func.count(models.UserSubscription.id)).filter(models.UserSubscription.status == "active").scalar()
    trials = db.query(func.count(models.UserSubscription.id)).filter(models.UserSubscription.status == "trial").scalar()
    cancelled = db.query(func.count(models.UserSubscription.id)).filter(models.UserSubscription.status == "cancelled").scalar()
    mrr = db.query(func.sum(models.UserSubscription.amount)).filter(
        models.UserSubscription.status == "active",
        models.UserSubscription.billing_cycle == "monthly",
    ).scalar() or 0
    yearly_mrr = (db.query(func.sum(models.UserSubscription.amount)).filter(
        models.UserSubscription.status == "active",
        models.UserSubscription.billing_cycle == "yearly",
    ).scalar() or 0) / 12
    return {
        "active_subscriptions": active,
        "trial_subscriptions": trials,
        "cancelled_subscriptions": cancelled,
        "mrr_inr": round(float(mrr) + float(yearly_mrr), 2),
    }


@router.post("/cancel/{sub_id}")
def cancel_subscription(sub_id: int, data: SubscriptionCancel, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(models.UserSubscription).filter(
        models.UserSubscription.id == sub_id,
        models.UserSubscription.user_id == user.id,
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "cancelled"
    sub.cancelled_at = datetime.utcnow()
    sub.cancel_reason = data.reason
    sub.auto_renew = False
    db.commit()
    return {"message": "Subscription cancelled"}


@router.post("/pause/{sub_id}")
def pause_subscription(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(models.UserSubscription).filter(models.UserSubscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "paused"
    db.commit()
    return {"message": "Subscription paused"}


@router.post("/upgrade")
def upgrade_subscription(plan_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(models.UserSubscription).filter(
        models.UserSubscription.user_id == user.id,
        models.UserSubscription.status == "active",
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    sub.plan_id = plan_id
    db.commit()
    return {"message": "Plan upgraded", "new_plan": plan.name}


@router.get("/renewals")
def upcoming_renewals(db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() + timedelta(days=7)
    subs = db.query(models.UserSubscription).filter(
        models.UserSubscription.status == "active",
        models.UserSubscription.end_date <= cutoff,
        models.UserSubscription.auto_renew == True,
    ).all()
    result = []
    for s in subs:
        user = db.query(models.User).filter(models.User.id == s.user_id).first()
        plan = db.query(models.Plan).filter(models.Plan.id == s.plan_id).first()
        result.append({
            "id": s.id,
            "user_name": user.name if user else "Unknown",
            "plan": plan.name if plan else "Unknown",
            "end_date": s.end_date.isoformat() if s.end_date else None,
            "amount": s.amount,
        })
    return result
