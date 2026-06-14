from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, os, hmac, hashlib, httpx
from auth import get_current_user, get_current_admin
from datetime import datetime, timedelta

router = APIRouter()

# ── Razorpay config ───────────────────────────────────────────────────────────

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
RAZORPAY_BASE = "https://api.razorpay.com/v1"


# ── Pydantic models ───────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    plan_id: int
    amount: float
    currency: str = "INR"
    gateway: str
    billing_cycle: str = "monthly"


class PaymentVerify(BaseModel):
    payment_id: str
    order_id: str
    signature: str
    gateway: str


class RazorpayOrderCreate(BaseModel):
    plan_id: int
    billing_cycle: str = "monthly"  # monthly | annual
    currency: str = "INR"


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: int
    billing_cycle: str = "monthly"


# ── Razorpay endpoints ────────────────────────────────────────────────────────

@router.post("/razorpay/create-order")
async def razorpay_create_order(
    data: RazorpayOrderCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(models.Plan).filter(models.Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Calculate amount in paise (1 INR = 100 paise)
    if data.billing_cycle == "annual":
        amount_paise = int(plan.price_yearly * 100) if plan.price_yearly else int(plan.price_monthly * 12 * 100)
    else:
        amount_paise = int(plan.price_monthly * 100) if plan.price_monthly else 0

    # Dev mode: no Razorpay keys configured
    if not RAZORPAY_KEY_ID:
        mock_order_id = f"order_test_{user.id}_{data.plan_id}"
        payment = models.Payment(
            user_id=user.id,
            plan_id=data.plan_id,
            amount=amount_paise / 100,
            currency=data.currency,
            gateway="razorpay",
            billing_cycle=data.billing_cycle,
            status="pending",
            order_id=mock_order_id,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return {
            "order_id": mock_order_id,
            "amount": amount_paise,
            "currency": data.currency,
            "key_id": "rzp_test_key",
            "plan_name": plan.name,
        }

    # Live mode: call Razorpay API
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{RAZORPAY_BASE}/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount": amount_paise,
                "currency": data.currency,
                "receipt": f"rcpt_{user.id}_{data.plan_id}",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Payment gateway error")

    order = resp.json()

    payment = models.Payment(
        user_id=user.id,
        plan_id=data.plan_id,
        amount=amount_paise / 100,
        currency=data.currency,
        gateway="razorpay",
        billing_cycle=data.billing_cycle,
        status="pending",
        order_id=order["id"],
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "order_id": order["id"],
        "amount": amount_paise,
        "currency": data.currency,
        "key_id": RAZORPAY_KEY_ID,
        "plan_name": plan.name,
    }


@router.post("/razorpay/verify")
def razorpay_verify(
    data: RazorpayVerify,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify HMAC-SHA256 signature
    secret = RAZORPAY_KEY_SECRET.encode() if RAZORPAY_KEY_SECRET else b"test"
    expected = hmac.new(
        secret,
        f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if RAZORPAY_KEY_SECRET and expected != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Find the pending payment record
    payment = db.query(models.Payment).filter(
        models.Payment.order_id == data.razorpay_order_id,
        models.Payment.user_id == user.id,
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    plan = db.query(models.Plan).filter(models.Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Mark payment as successful
    payment.status = "success"
    payment.txn_id = data.razorpay_payment_id
    db.commit()

    # Create UserSubscription
    start = datetime.utcnow()
    end = start + timedelta(days=365 if data.billing_cycle == "annual" else 30)

    sub = models.UserSubscription(
        user_id=user.id,
        plan_id=data.plan_id,
        payment_id=payment.id,
        status="active",
        billing_cycle=data.billing_cycle,
        amount=payment.amount,
        start_date=start,
        end_date=end,
        auto_renew=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {
        "message": "Payment successful",
        "subscription_id": sub.id,
        "plan": plan.name,
        "valid_until": end.isoformat(),
    }


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    sig = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature if secret is configured
    if RAZORPAY_WEBHOOK_SECRET:
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if expected != sig:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")

    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        if order_id:
            payment = db.query(models.Payment).filter(
                models.Payment.order_id == order_id
            ).first()
            if payment and payment.status == "pending":
                payment.status = "success"
                payment.txn_id = payment_id
                db.commit()

    elif event == "subscription.charged":
        sub_entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})
        sub_id = sub_entity.get("id")
        if sub_id:
            sub = db.query(models.UserSubscription).filter(
                models.UserSubscription.id == sub_id
            ).first()
            if sub:
                extension_days = 365 if sub.billing_cycle == "annual" else 30
                if sub.end_date and sub.end_date > datetime.utcnow():
                    sub.end_date = sub.end_date + timedelta(days=extension_days)
                else:
                    sub.end_date = datetime.utcnow() + timedelta(days=extension_days)
                sub.status = "active"
                db.commit()

    return {"status": "ok"}


# ── Direct order endpoints (signup flow — no Plan DB record needed) ───────────

class DirectOrderCreate(BaseModel):
    plan_name: str       # 'family' | 'family_plus' | 'ultimate'
    amount_inr: int      # actual INR amount
    currency: str = "INR"

class DirectVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_name: str
    amount_inr: int

PLAN_NAME_MAP = {
    "family": "family",
    "family_plus": "family",
    "ultimate": "premium",
}

@router.post("/razorpay/order-direct")
async def razorpay_order_direct(
    data: DirectOrderCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    amount_paise = data.amount_inr * 100
    if not RAZORPAY_KEY_ID:
        order_id = f"order_direct_{user.id}_{data.plan_name}"
        payment = models.Payment(
            user_id=user.id,
            amount=data.amount_inr,
            currency=data.currency,
            gateway="razorpay",
            billing_cycle="monthly",
            status="pending",
            order_id=order_id,
        )
        db.add(payment)
        db.commit()
        return {
            "order_id": order_id,
            "amount": amount_paise,
            "currency": data.currency,
            "key_id": "rzp_test_demo",
            "demo_mode": True,  # No real Razorpay keys configured
        }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{RAZORPAY_BASE}/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={"amount": amount_paise, "currency": data.currency, "receipt": f"rcpt_{user.id}_{data.plan_name}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Payment gateway error")
    order = resp.json()

    payment = models.Payment(
        user_id=user.id,
        amount=data.amount_inr,
        currency=data.currency,
        gateway="razorpay",
        billing_cycle="monthly",
        status="pending",
        order_id=order["id"],
    )
    db.add(payment)
    db.commit()
    return {"order_id": order["id"], "amount": amount_paise, "currency": data.currency, "key_id": RAZORPAY_KEY_ID}


@router.post("/razorpay/verify-direct")
def razorpay_verify_direct(
    data: DirectVerify,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    secret = RAZORPAY_KEY_SECRET.encode() if RAZORPAY_KEY_SECRET else b"test"
    expected = hmac.new(
        secret,
        f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if RAZORPAY_KEY_SECRET and expected != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment = db.query(models.Payment).filter(
        models.Payment.order_id == data.razorpay_order_id,
        models.Payment.user_id == user.id,
    ).first()
    if payment:
        payment.status = "success"
        payment.txn_id = data.razorpay_payment_id
        db.commit()

    family_member = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == user.id,
        models.FamilyMember.role == "owner",
    ).first()
    if family_member:
        family = db.query(models.Family).filter(models.Family.id == family_member.family_id).first()
        if family:
            family.plan = PLAN_NAME_MAP.get(data.plan_name, "premium")
            db.commit()

    return {"message": "Payment successful", "plan": data.plan_name}


# ── Legacy endpoints (kept for backwards compatibility) ───────────────────────

@router.post("/create")
def create_payment(
    data: PaymentCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(models.Plan).filter(models.Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    payment = models.Payment(
        user_id=user.id,
        plan_id=data.plan_id,
        amount=data.amount,
        currency=data.currency,
        gateway=data.gateway,
        billing_cycle=data.billing_cycle,
        status="pending",
        order_id=f"ORD-{user.id}-{data.plan_id}-{int(data.amount)}",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {
        "payment_id": payment.id,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "gateway": payment.gateway,
    }


@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(
        models.Payment.order_id == data.order_id,
        models.Payment.user_id == user.id,
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "success"
    payment.txn_id = data.payment_id
    db.commit()
    return {"message": "Payment verified", "status": "success"}


# ── User endpoints ────────────────────────────────────────────────────────────

@router.get("/history")
def payment_history(
    limit: int = 20,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payments = db.query(models.Payment).filter(
        models.Payment.user_id == user.id
    ).order_by(desc(models.Payment.created_at)).limit(limit).all()
    return [
        {
            "id": p.id,
            "amount": p.amount,
            "currency": p.currency,
            "gateway": p.gateway,
            "status": p.status,
            "billing_cycle": p.billing_cycle,
            "txn_id": p.txn_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in payments
    ]


# ── Admin-only endpoints ──────────────────────────────────────────────────────

@router.get("/all")
def all_payments(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(models.Payment)
    if status:
        q = q.filter(models.Payment.status == status)
    payments = q.order_by(desc(models.Payment.created_at)).offset(offset).limit(limit).all()
    total = db.query(func.count(models.Payment.id)).scalar()
    result = []
    for p in payments:
        u = db.query(models.User).filter(models.User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_name": u.name if u else "Unknown",
            "user_email": u.email if u else "",
            "amount": p.amount,
            "currency": p.currency,
            "gateway": p.gateway,
            "status": p.status,
            "billing_cycle": p.billing_cycle,
            "txn_id": p.txn_id,
            "order_id": p.order_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return {"total": total, "payments": result}


@router.get("/stats")
def payment_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_revenue = (
        db.query(func.sum(models.Payment.amount))
        .filter(models.Payment.status == "success")
        .scalar() or 0
    )
    successful = (
        db.query(func.count(models.Payment.id))
        .filter(models.Payment.status == "success")
        .scalar()
    )
    failed = (
        db.query(func.count(models.Payment.id))
        .filter(models.Payment.status == "failed")
        .scalar()
    )
    refunded = (
        db.query(func.count(models.Payment.id))
        .filter(models.Payment.status == "refunded")
        .scalar()
    )
    return {
        "total_revenue_inr": round(total_revenue, 2),
        "successful_payments": successful,
        "failed_payments": failed,
        "refunded_payments": refunded,
    }


@router.post("/refund/{payment_id}")
async def refund_payment(
    payment_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status != "success":
        raise HTTPException(status_code=400, detail="Only successful payments can be refunded")

    # If Razorpay keys are configured and we have a txn_id, call Razorpay refund API
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and payment.txn_id:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{RAZORPAY_BASE}/payments/{payment.txn_id}/refund",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={"amount": int(payment.amount * 100)},
            )
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"Razorpay refund failed: {resp.text}",
            )

    payment.status = "refunded"
    db.commit()
    return {"message": "Refund initiated", "payment_id": payment_id}


@router.get("/export")
def export_payments(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    payments = db.query(models.Payment).order_by(desc(models.Payment.created_at)).all()
    result = []
    for p in payments:
        u = db.query(models.User).filter(models.User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_name": u.name if u else "",
            "user_email": u.email if u else "",
            "amount": p.amount,
            "currency": p.currency,
            "gateway": p.gateway,
            "status": p.status,
            "billing_cycle": p.billing_cycle,
            "txn_id": p.txn_id,
            "order_id": p.order_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return result
