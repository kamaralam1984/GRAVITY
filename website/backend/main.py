"""Main FastAPI application - updated with DB and all routers."""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os, logging

load_dotenv()
logging.basicConfig(level=logging.INFO)

# Import database (table creation happens after all models/routers are imported)
from database import engine
import models

# Import routers
from routers import ai, location
from routers import auth, admin_router, families, devices, geofences, sos_router
from routers import check_ins, journeys, chat, driving, health, notifications, plans
from routers import emergency, support_tickets, audit, coupons
from routers import payments, subscriptions, security_logs, stripe_router, social_auth, titan_router, venus_router, cosmo_router
from routers import kids_elder
from routers import monitoring
from routers import school_router
from routers import social, monitor
from routers.ai_guardian import router as ai_guardian_router
from routers.super_admin_stats import router as super_admin_stats_router
from routers import admin_data_router
from routers import privacy_loc
from routers import commands
from auth import get_current_admin
import cache

# Create tables AFTER every router module (commands, privacy_loc, social, monitor,
# etc.) has been imported, so their SQLAlchemy models are registered on the shared
# Base.metadata and their SQLite tables get created here in one place.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KVL Track API",
    description="Family safety platform - full backend",
    version="2.0.0",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3020").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(location.router, prefix="/location", tags=["Location"])
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
app.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring"])
app.include_router(school_router.router, prefix="/school", tags=["School Schedule"])
app.include_router(social.router, prefix="", tags=["Social"])
app.include_router(monitor.router, prefix="/monitor", tags=["Monitoring (Transparent)"])
app.include_router(super_admin_stats_router, prefix="/super-admin-api", tags=["Super Admin Stats"])
app.include_router(admin_data_router.router, prefix="/admin-api", tags=["Admin Data"])
app.include_router(privacy_loc.router, tags=["Privacy & Location Sharing"])
app.include_router(commands.router, prefix="/commands", tags=["Remote Commands"])


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    ok = cache.reconnect()
    logging.getLogger(__name__).info(f"Redis cache: {'CONNECTED' if ok else 'UNAVAILABLE (degraded mode)'}")


# ── Core endpoints ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"service": "KVL Track API", "version": "2.0.0", "status": "running"}

@app.get("/health-check")
async def health_check():
    return {"status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "ok"}


# ── Cache management endpoints ────────────────────────────────────────────────

@app.get("/cache/stats", tags=["Cache"])
def cache_stats(admin=Depends(get_current_admin)):
    """Redis cache performance metrics — admin only."""
    return cache.stats()


@app.post("/cache/flush", tags=["Cache"])
def cache_flush(admin=Depends(get_current_admin)):
    """Flush all gravity:* cache keys — admin only."""
    deleted = cache.flush()
    return {"message": f"Cache flushed", "keys_deleted": deleted}


@app.delete("/cache/key/{namespace}", tags=["Cache"])
def cache_bust_namespace(namespace: str, admin=Depends(get_current_admin)):
    """Bust a specific cache namespace (e.g. 'admin', 'family', 'user')."""
    deleted = cache.cdel_pattern(f"{namespace}:*")
    return {"namespace": namespace, "keys_deleted": deleted}
