from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter()

PLAN_DETAILS = {
    "free": {"name": "Free", "price_inr": 0, "max_members": 5, "features": ["5 members", "Basic tracking", "7-day history"]},
    "premium": {"name": "Premium", "price_inr": 299, "max_members": 10, "features": ["10 members", "All features", "30-day history", "Priority support"]},
    "family": {"name": "Family Plus", "price_inr": 499, "max_members": 25, "features": ["25 members", "All features", "90-day history", "Elderly care", "Priority support", "API access"]},
}

class SubscriptionUpgrade(BaseModel):
    family_id: int
    plan: str
    payment_method: Optional[str] = None

@router.get("/")
def get_plans():
    return PLAN_DETAILS

@router.post("/subscribe")
def subscribe(data: SubscriptionUpgrade, db: Session = Depends(get_db)):
    if data.plan not in PLAN_DETAILS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    sub = db.query(models.Subscription).filter(models.Subscription.family_id == data.family_id).first()
    if not sub:
        sub = models.Subscription(family_id=data.family_id)
        db.add(sub)
    sub.plan = data.plan
    sub.price_inr = PLAN_DETAILS[data.plan]["price_inr"]
    sub.payment_method = data.payment_method
    family = db.query(models.Family).filter(models.Family.id == data.family_id).first()
    if family:
        family.plan = data.plan
    db.commit()
    return {"message": "Subscription updated", "plan": data.plan}

@router.get("/stats")
def plan_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Family.id)).scalar()
    free = db.query(func.count(models.Family.id)).filter(models.Family.plan == "free").scalar()
    premium = db.query(func.count(models.Family.id)).filter(models.Family.plan == "premium").scalar()
    family_plan = db.query(func.count(models.Family.id)).filter(models.Family.plan == "family").scalar()
    mrr = (premium * 299) + (family_plan * 499)
    return {"total_families": total, "free": free, "premium": premium, "family_plus": family_plan, "mrr_inr": mrr, "arr_inr": mrr * 12}
