"""Stripe payment integration — Cards, Apple Pay, Google Pay."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, os, httpx, hmac, hashlib
from auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_BASE = "https://api.stripe.com/v1"


class StripePaymentIntentCreate(BaseModel):
    plan_id: int
    billing_cycle: str = "monthly"
    currency: str = "usd"
    payment_method_types: list = ["card"]  # card, apple_pay, google_pay → all via card


class StripeConfirm(BaseModel):
    payment_intent_id: str
    plan_id: int
    billing_cycle: str = "monthly"


@router.post("/create-payment-intent")
async def create_payment_intent(
    data: StripePaymentIntentCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(models.Plan).filter(models.Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Determine base price in INR based on billing cycle
    price_inr = plan.price_yearly if data.billing_cycle == "yearly" else plan.price_monthly

    # Convert to target currency amount in cents
    if data.currency == "usd":
        # Approximate INR → USD conversion (divide by 83), then × 100 for cents
        amount_cents = int(round((price_inr / 83) * 100))
    else:
        # Assume currency is inr — paise (× 100)
        amount_cents = int(round(price_inr * 100))

    # Ensure minimum Stripe charge amount
    if amount_cents < 50:
        amount_cents = 50

    if not STRIPE_SECRET_KEY:
        # Mock response for development / testing
        payment = models.Payment(
            user_id=user.id,
            plan_id=data.plan_id,
            amount=price_inr,
            currency=data.currency.upper(),
            gateway="stripe",
            billing_cycle=data.billing_cycle,
            status="pending",
            order_id=f"pi_test_{user.id}",
            txn_id=None,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return {
            "client_secret": "pi_test_secret",
            "payment_intent_id": f"pi_test_{user.id}",
            "amount": amount_cents,
            "currency": data.currency,
            "publishable_key": "pk_test_placeholder",
        }

    # Call Stripe API
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{STRIPE_BASE}/payment_intents",
            auth=(STRIPE_SECRET_KEY, ""),
            data={
                "amount": amount_cents,
                "currency": data.currency,
                "automatic_payment_methods[enabled]": "true",
                "metadata[user_id]": str(user.id),
                "metadata[plan_id]": str(data.plan_id),
            },
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Stripe error: {resp.text}")

    pi = resp.json()

    # Save pending Payment record
    payment = models.Payment(
        user_id=user.id,
        plan_id=data.plan_id,
        amount=price_inr,
        currency=data.currency.upper(),
        gateway="stripe",
        billing_cycle=data.billing_cycle,
        status="pending",
        order_id=pi.get("id"),
        txn_id=None,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "client_secret": pi.get("client_secret"),
        "payment_intent_id": pi.get("id"),
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", ""),
        "amount": amount_cents,
        "currency": data.currency,
    }


@router.post("/confirm")
async def confirm_payment(
    data: StripeConfirm,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the pending payment by order_id (which stores the payment_intent_id)
    payment = db.query(models.Payment).filter(
        models.Payment.order_id == data.payment_intent_id,
        models.Payment.user_id == user.id,
        models.Payment.gateway == "stripe",
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Update payment to success
    payment.status = "success"
    payment.txn_id = data.payment_intent_id
    db.commit()

    # Determine subscription duration
    if data.billing_cycle == "yearly":
        end_date = datetime.utcnow() + timedelta(days=365)
    else:
        end_date = datetime.utcnow() + timedelta(days=30)

    # Create UserSubscription
    sub = models.UserSubscription(
        user_id=user.id,
        plan_id=data.plan_id,
        payment_id=payment.id,
        status="active",
        billing_cycle=data.billing_cycle,
        amount=payment.amount,
        start_date=datetime.utcnow(),
        end_date=end_date,
        auto_renew=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {"message": "Payment confirmed", "subscription_id": sub.id}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()

    # Verify Stripe signature when webhook secret is configured
    if STRIPE_WEBHOOK_SECRET:
        sig_header = request.headers.get("stripe-signature", "")
        # Parse timestamp and signatures from header
        parts = {k: v for k, v in (item.split("=", 1) for item in sig_header.split(",") if "=" in item)}
        timestamp = parts.get("t", "")
        signatures = [v for k, v in parts.items() if k == "v1"]

        if not timestamp or not signatures:
            raise HTTPException(status_code=400, detail="Invalid Stripe signature header")

        # Compute expected signature
        signed_payload = f"{timestamp}.{body.decode('utf-8')}"
        expected_sig = hmac.new(
            STRIPE_WEBHOOK_SECRET.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if expected_sig not in signatures:
            raise HTTPException(status_code=400, detail="Stripe signature verification failed")

    # Parse event
    import json
    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type", "")
    event_data = event.get("data", {}).get("object", {})

    if event_type == "payment_intent.succeeded":
        payment_intent_id = event_data.get("id")
        user_id = event_data.get("metadata", {}).get("user_id")
        plan_id = event_data.get("metadata", {}).get("plan_id")

        if payment_intent_id and user_id:
            payment = db.query(models.Payment).filter(
                models.Payment.order_id == payment_intent_id,
                models.Payment.user_id == int(user_id),
            ).first()

            if payment and payment.status != "success":
                payment.status = "success"
                payment.txn_id = payment_intent_id
                db.commit()

                # Create or refresh subscription
                existing_sub = db.query(models.UserSubscription).filter(
                    models.UserSubscription.user_id == int(user_id),
                    models.UserSubscription.status == "active",
                ).first()

                if not existing_sub:
                    billing_cycle = payment.billing_cycle or "monthly"
                    days = 365 if billing_cycle == "yearly" else 30
                    sub = models.UserSubscription(
                        user_id=int(user_id),
                        plan_id=int(plan_id) if plan_id else payment.plan_id,
                        payment_id=payment.id,
                        status="active",
                        billing_cycle=billing_cycle,
                        amount=payment.amount,
                        start_date=datetime.utcnow(),
                        end_date=datetime.utcnow() + timedelta(days=days),
                        auto_renew=True,
                    )
                    db.add(sub)
                    db.commit()

    elif event_type == "invoice.payment_succeeded":
        customer_id = event_data.get("customer")
        # Extend the active subscription by the billing period
        # In a full implementation, map customer_id → user_id via a stored mapping.
        # Here we log the event and extend if we can find by subscription metadata.
        subscription_id = event_data.get("subscription")
        if subscription_id:
            # Try to find matching subscription by txn_id stored in payment
            payment = db.query(models.Payment).filter(
                models.Payment.txn_id == subscription_id,
                models.Payment.gateway == "stripe",
            ).first()
            if payment:
                sub = db.query(models.UserSubscription).filter(
                    models.UserSubscription.payment_id == payment.id,
                    models.UserSubscription.status == "active",
                ).first()
                if sub and sub.end_date:
                    days = 365 if sub.billing_cycle == "yearly" else 30
                    sub.end_date = sub.end_date + timedelta(days=days)
                    db.commit()

    elif event_type == "customer.subscription.deleted":
        subscription_id = event_data.get("id")
        if subscription_id:
            payment = db.query(models.Payment).filter(
                models.Payment.txn_id == subscription_id,
                models.Payment.gateway == "stripe",
            ).first()
            if payment:
                sub = db.query(models.UserSubscription).filter(
                    models.UserSubscription.payment_id == payment.id,
                    models.UserSubscription.status == "active",
                ).first()
                if sub:
                    sub.status = "cancelled"
                    sub.cancelled_at = datetime.utcnow()
                    sub.cancel_reason = "stripe_subscription_deleted"
                    db.commit()

    return {"status": "ok"}


@router.get("/config")
async def stripe_config():
    """Return publishable key for frontend Stripe.js initialisation."""
    return {
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", ""),
        "enabled": bool(STRIPE_SECRET_KEY),
    }
