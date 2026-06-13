from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from datetime import datetime

router = APIRouter()

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    applicable_plan: Optional[str] = None
    max_uses: Optional[int] = None
    expires_at: Optional[str] = None

@router.post("/")
def create_coupon(data: CouponCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Coupon).filter(models.Coupon.code == data.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon = models.Coupon(code=data.code.upper(), discount_type=data.discount_type, discount_value=data.discount_value, applicable_plan=data.applicable_plan, max_uses=data.max_uses)
    db.add(coupon)
    db.commit()
    return {"message": "Coupon created", "code": coupon.code}

@router.post("/validate/{code}")
def validate_coupon(code: str, plan: Optional[str] = None, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.code == code.upper(), models.Coupon.is_active == True).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if coupon.max_uses and coupon.current_uses >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    if coupon.applicable_plan and plan and coupon.applicable_plan != plan:
        raise HTTPException(status_code=400, detail="Coupon not valid for this plan")
    return {"valid": True, "discount_type": coupon.discount_type, "discount_value": coupon.discount_value, "code": coupon.code}

@router.get("/")
def list_coupons(db: Session = Depends(get_db)):
    coupons = db.query(models.Coupon).order_by(desc(models.Coupon.created_at)).all()
    return [{"id": c.id, "code": c.code, "discount_type": c.discount_type, "discount_value": c.discount_value, "applicable_plan": c.applicable_plan, "max_uses": c.max_uses, "current_uses": c.current_uses, "is_active": c.is_active} for c in coupons]
