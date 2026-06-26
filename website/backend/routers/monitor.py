"""Transparent parental monitoring: a child device uploads its own SMS,
contacts and media metadata; a family OWNER retrieves it for that child.

This is intentionally transparent (the app stays visible). Uploads are
authenticated as the device's own user; reads require the caller to be the
owner of a family the target user belongs to (or the target user themselves).
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database import get_db, Base, engine
import models
from auth import get_current_user

router = APIRouter()

# ── Models (router-local) ────────────────────────────────────────────────────

class MonitorSms(Base):
    __tablename__ = "monitor_sms"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    address = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    ts = Column(String, nullable=True)          # original device timestamp (ms epoch str)
    kind = Column(String, nullable=True)        # inbox / sent / draft
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MonitorContact(Base):
    __tablename__ = "monitor_contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=True)
    number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MonitorMedia(Base):
    __tablename__ = "monitor_media"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    uri = Column(String, nullable=True)
    ts = Column(String, nullable=True)
    kind = Column(String, nullable=True)        # image / video / audio
    created_at = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)

# ── Schemas ──────────────────────────────────────────────────────────────────

class SmsItem(BaseModel):
    address: Optional[str] = None
    body: Optional[str] = None
    ts: Optional[str] = None
    kind: Optional[str] = None


class ContactItem(BaseModel):
    name: Optional[str] = None
    number: Optional[str] = None


class MediaItem(BaseModel):
    uri: Optional[str] = None
    ts: Optional[str] = None
    kind: Optional[str] = None


class SmsUpload(BaseModel):
    items: List[SmsItem]


class ContactsUpload(BaseModel):
    items: List[ContactItem]


class MediaUpload(BaseModel):
    items: List[MediaItem]


# ── Auth helper ──────────────────────────────────────────────────────────────

def _assert_can_read(caller: models.User, target_user_id: int, db: Session):
    """Caller may read target's monitored data if caller is the target, or is
    the owner of a family that the target user is a member of."""
    if caller.id == target_user_id:
        return
    # Families owned by the caller
    owned = db.query(models.Family).filter(models.Family.owner_id == caller.id).all()
    owned_ids = {f.id for f in owned}
    if not owned_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's data")
    member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.user_id == target_user_id,
            models.FamilyMember.family_id.in_(owned_ids),
        )
        .first()
    )
    # Also allow if the target is the owner of one of the caller's families
    if member or target_user_id in {f.owner_id for f in owned}:
        return
    raise HTTPException(status_code=403, detail="Not authorized to view this user's data")


# ── Upload endpoints (child device uploads its own data) ─────────────────────

@router.post("/sms")
def upload_sms(
    data: SmsUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = [
        MonitorSms(
            user_id=current_user.id,
            address=i.address,
            body=i.body,
            ts=i.ts,
            kind=i.kind,
        )
        for i in data.items
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


@router.post("/contacts")
def upload_contacts(
    data: ContactsUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = [
        MonitorContact(user_id=current_user.id, name=i.name, number=i.number)
        for i in data.items
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


@router.post("/media")
def upload_media(
    data: MediaUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = [
        MonitorMedia(user_id=current_user.id, uri=i.uri, ts=i.ts, kind=i.kind)
        for i in data.items
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


# ── Retrieve endpoints (family owner reads a child's data) ───────────────────

@router.get("/{user_id}/sms")
def get_sms(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorSms)
        .filter(MonitorSms.user_id == user_id)
        .order_by(MonitorSms.id.desc())
        .limit(500)
        .all()
    )
    return [
        {
            "id": r.id,
            "address": r.address,
            "body": r.body,
            "ts": r.ts,
            "kind": r.kind,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/{user_id}/contacts")
def get_contacts(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorContact)
        .filter(MonitorContact.user_id == user_id)
        .order_by(MonitorContact.id.desc())
        .limit(2000)
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.name,
            "number": r.number,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/{user_id}/media")
def get_media(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorMedia)
        .filter(MonitorMedia.user_id == user_id)
        .order_by(MonitorMedia.id.desc())
        .limit(2000)
        .all()
    )
    return [
        {
            "id": r.id,
            "uri": r.uri,
            "ts": r.ts,
            "kind": r.kind,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
