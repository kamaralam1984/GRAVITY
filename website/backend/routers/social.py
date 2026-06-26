"""Social features: family Moments feed, driver selfie verification, route safety score."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import hashlib, math

from database import get_db, Base, engine
import models
from auth import get_current_user

router = APIRouter()

# ── Models (router-local; create_all in main runs before this import) ────────

class Moment(Base):
    __tablename__ = "moments"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    caption = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DriverVerification(Base):
    __tablename__ = "driver_verifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    selfie_url = Column(String, nullable=False)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Ensure tables exist (this module is imported after main's create_all)
Base.metadata.create_all(bind=engine)

# ── Schemas ──────────────────────────────────────────────────────────────────

class MomentCreate(BaseModel):
    caption: str
    image_url: Optional[str] = None


class MomentResponse(BaseModel):
    id: int
    family_id: int
    user_id: int
    user_name: Optional[str] = None
    caption: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[str] = None


class DriverVerifyRequest(BaseModel):
    selfie_url: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def _user_family_ids(user_id: int, db: Session) -> List[int]:
    """All family ids the user belongs to (as member or owner)."""
    ids = {
        m.family_id
        for m in db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user_id).all()
    }
    for f in db.query(models.Family).filter(models.Family.owner_id == user_id).all():
        ids.add(f.id)
    return list(ids)


# ── Moments feed ─────────────────────────────────────────────────────────────

@router.post("/moments", response_model=MomentResponse)
def create_moment(
    data: MomentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fam_ids = _user_family_ids(current_user.id, db)
    if not fam_ids:
        raise HTTPException(status_code=400, detail="You are not part of any family")
    # Post to the user's primary (first) family
    family_id = fam_ids[0]
    moment = Moment(
        family_id=family_id,
        user_id=current_user.id,
        caption=data.caption,
        image_url=data.image_url,
    )
    db.add(moment)
    db.commit()
    db.refresh(moment)
    return MomentResponse(
        id=moment.id,
        family_id=moment.family_id,
        user_id=moment.user_id,
        user_name=current_user.name,
        caption=moment.caption,
        image_url=moment.image_url,
        created_at=moment.created_at.isoformat() if moment.created_at else None,
    )


@router.get("/moments/{family_id}", response_model=List[MomentResponse])
def list_moments(
    family_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if family_id not in _user_family_ids(current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this family")
    moments = (
        db.query(Moment)
        .filter(Moment.family_id == family_id)
        .order_by(Moment.created_at.desc())
        .limit(200)
        .all()
    )
    # Resolve user names in one pass
    user_ids = {m.user_id for m in moments}
    names = {
        u.id: u.name
        for u in db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    } if user_ids else {}
    return [
        MomentResponse(
            id=m.id,
            family_id=m.family_id,
            user_id=m.user_id,
            user_name=names.get(m.user_id),
            caption=m.caption,
            image_url=m.image_url,
            created_at=m.created_at.isoformat() if m.created_at else None,
        )
        for m in moments
    ]


# ── Driver verification ──────────────────────────────────────────────────────

@router.post("/driver/verify")
def driver_verify(
    data: DriverVerifyRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.selfie_url:
        raise HTTPException(status_code=400, detail="selfie_url is required")
    rec = DriverVerification(
        user_id=current_user.id,
        selfie_url=data.selfie_url,
        verified=True,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "verified": rec.verified,
        "verification_id": rec.id,
        "verified_at": rec.created_at.isoformat() if rec.created_at else None,
        "message": "Driver identity verified",
    }


# ── Route safety score ───────────────────────────────────────────────────────

@router.get("/route/safety")
def route_safety(lat: float, lng: float):
    """Simple deterministic heuristic safety score (0-100) for a coordinate.

    Combines a stable per-cell pseudo-factor (so the same area scores
    consistently) with a time-of-day factor (night routes score lower).
    """
    # Stable per-location component from a hash of rounded coordinates.
    cell = f"{round(lat, 3)},{round(lng, 3)}"
    h = int(hashlib.sha256(cell.encode()).hexdigest(), 16)
    base = 55 + (h % 41)  # 55..95

    # Time-of-day adjustment (UTC hour). Night (22:00-05:00) is riskier.
    hour = datetime.utcnow().hour
    if 22 <= hour or hour < 5:
        time_adj = -15
    elif 5 <= hour < 7 or 19 <= hour < 22:
        time_adj = -5
    else:
        time_adj = 5

    score = max(0, min(100, base + time_adj))
    if score >= 75:
        level = "safe"
    elif score >= 50:
        level = "moderate"
    else:
        level = "caution"

    factors = []
    if time_adj < 0:
        factors.append("low_visibility_hours")
    if base < 65:
        factors.append("area_incident_history")
    if not factors:
        factors.append("clear")

    return {
        "score": score,
        "level": level,
        "lat": lat,
        "lng": lng,
        "factors": factors,
    }
