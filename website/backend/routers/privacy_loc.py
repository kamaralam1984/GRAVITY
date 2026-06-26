"""Privacy & location-sharing — ghost mode + temporary share links + public tracking."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import secrets

from database import get_db, Base
import models
from auth import get_current_user

router = APIRouter()

PUBLIC_BASE_URL = "https://kvltrack.com"


# ── Models (defined here to avoid editing models.py) ──────────────────────────

class GhostStatus(Base):
    """When a user enables ghost mode, /location/live consumers should hide
    their latest location until `expires_at`. One row per user (upserted)."""
    __tablename__ = "ghost_status"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class LocationShare(Base):
    """A temporary public token that exposes a single user's latest location."""
    __tablename__ = "location_shares"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


Base.metadata.create_all(bind=__import__("database").engine)


# ── Schemas ───────────────────────────────────────────────────────────────────

class GhostRequest(BaseModel):
    minutes: int


class ShareRequest(BaseModel):
    minutes: int


# ── Helper for the location router ────────────────────────────────────────────

def is_ghosted(db: Session, user_id: int) -> bool:
    """Return True if the user currently has an active (non-expired) ghost row.
    The location router's /live-style endpoints should call this and skip the
    user when it returns True."""
    row = (db.query(GhostStatus)
           .filter(GhostStatus.user_id == user_id)
           .first())
    return bool(row and row.expires_at > datetime.utcnow())


# ── Ghost mode ────────────────────────────────────────────────────────────────

@router.post("/location/ghost")
def set_ghost(
    data: GhostRequest,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.minutes <= 0:
        raise HTTPException(status_code=400, detail="minutes must be positive")
    expires_at = datetime.utcnow() + timedelta(minutes=data.minutes)
    row = db.query(GhostStatus).filter(GhostStatus.user_id == user.id).first()
    if row:
        row.expires_at = expires_at
    else:
        row = GhostStatus(user_id=user.id, expires_at=expires_at)
        db.add(row)
    db.commit()
    return {"ghost": True, "expires_at": expires_at.isoformat()}


@router.delete("/location/ghost")
def clear_ghost(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(GhostStatus).filter(GhostStatus.user_id == user.id).delete()
    db.commit()
    return {"ghost": False}


# ── Temporary share link ──────────────────────────────────────────────────────

@router.post("/location/share")
def create_share(
    data: ShareRequest,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.minutes <= 0:
        raise HTTPException(status_code=400, detail="minutes must be positive")
    token = secrets.token_urlsafe(16)
    share = LocationShare(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=data.minutes),
    )
    db.add(share)
    db.commit()
    return {
        "token": token,
        "url": f"{PUBLIC_BASE_URL}/track/{token}",
        "expires_at": share.expires_at.isoformat(),
    }


# ── Public tracking (NO auth) ─────────────────────────────────────────────────

@router.get("/track/{token}")
def public_track(token: str, db: Session = Depends(get_db)):
    share = (db.query(LocationShare)
             .filter(LocationShare.token == token)
             .first())
    if not share:
        raise HTTPException(status_code=404, detail="Invalid share link")
    if share.expires_at <= datetime.utcnow():
        raise HTTPException(status_code=410, detail="Share link expired")

    loc = (db.query(models.Location)
           .filter(models.Location.user_id == share.user_id)
           .order_by(desc(models.Location.recorded_at))
           .first())
    if not loc:
        raise HTTPException(status_code=404, detail="No location available")

    return {
        "lat": loc.lat,
        "lng": loc.lng,
        "accuracy": loc.accuracy,
        "place_name": loc.place_name,
        "recorded_at": loc.recorded_at.isoformat() if loc.recorded_at else None,
        "expires_at": share.expires_at.isoformat(),
    }
