"""Main FastAPI application - updated with DB and all routers."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Import database and create tables
from database import engine
import models
models.Base.metadata.create_all(bind=engine)

# Import routers
from routers import ai, location
from routers import auth, admin_router, families, devices, geofences, sos_router
from routers import check_ins, journeys, chat, driving, health, notifications, plans
from routers import emergency, support_tickets, audit, coupons
from routers import payments, subscriptions, security_logs, stripe_router, social_auth, titan_router, venus_router, cosmo_router
from routers import kids_elder
from routers.ai_guardian import router as ai_guardian_router
from routers.super_admin_stats import router as super_admin_stats_router

app = FastAPI(
    title="Trackalways Gravity API",
    description="Family safety platform - full backend",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3020").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Original routers
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(location.router, prefix="/location", tags=["Location"])

# New routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router.router, prefix="/admin-api", tags=["Admin"])
app.include_router(families.router, prefix="/families", tags=["Families"])
app.include_router(devices.router, prefix="/devices", tags=["Devices"])
app.include_router(geofences.router, prefix="/geofences", tags=["Geofences"])
app.include_router(sos_router.router, prefix="/sos", tags=["SOS"])
app.include_router(check_ins.router, prefix="/check-ins", tags=["Check-Ins"])
app.include_router(journeys.router, prefix="/journeys", tags=["Journeys"])
app.include_router(chat.router, prefix="/chat", tags=["Family Chat"])
app.include_router(driving.router, prefix="/driving", tags=["Driving Safety"])
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(plans.router, prefix="/plans", tags=["Plans"])
app.include_router(emergency.router, prefix="/emergency-profile", tags=["Emergency Profile"])
app.include_router(support_tickets.router, prefix="/support", tags=["Support"])
app.include_router(audit.router, prefix="/audit", tags=["Audit"])
app.include_router(coupons.router, prefix="/coupons", tags=["Coupons"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(stripe_router.router, prefix="/stripe", tags=["Stripe"])
app.include_router(social_auth.router, prefix="/auth/social", tags=["Social Auth"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
app.include_router(security_logs.router, prefix="/security", tags=["Security"])
app.include_router(titan_router.router, prefix="/titan", tags=["Titan - Smart Locks"])
app.include_router(venus_router.router, prefix="/venus", tags=["Venus - Vehicle Tracking"])
app.include_router(cosmo_router.router, prefix="/cosmo", tags=["Cosmo AI - Dashcam"])
app.include_router(ai_guardian_router, prefix="/api", tags=["AI Guardian"])
app.include_router(kids_elder.router, prefix="/gravity", tags=["Kids & Elder"])
app.include_router(super_admin_stats_router, prefix="/super-admin-api", tags=["Super Admin Stats"])

@app.get("/")
async def root():
    return {"service": "Trackalways Gravity API", "version": "2.0.0", "status": "running"}

@app.get("/health-check")
async def health_check():
    return {"status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "ok"}
