"""Transparent parental monitoring: a child device uploads its own SMS,
contacts and media metadata; a family OWNER retrieves it for that child.

This is intentionally transparent (the app stays visible). Uploads are
authenticated as the device's own user; reads require the caller to be the
owner of a family the target user belongs to (or the target user themselves).
"""
import csv
import io

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from pydantic import BaseModel, conlist
from typing import Optional, List
from datetime import datetime
from jose import JWTError, jwt

from database import get_db, Base, engine
import models
from auth import get_current_user, oauth2_scheme, SECRET_KEY, ALGORITHM

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


# Cap batch sizes to prevent storage-exhaustion / DoS from an authed device.
MAX_BATCH = 1000


class SmsUpload(BaseModel):
    items: conlist(SmsItem, max_length=MAX_BATCH)


class ContactsUpload(BaseModel):
    items: conlist(ContactItem, max_length=MAX_BATCH)


class MediaUpload(BaseModel):
    items: conlist(MediaItem, max_length=MAX_BATCH)


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


def _get_user_from_token(token: str, db: Session) -> Optional[models.User]:
    """Decode a raw JWT and return the matching user, or None on any failure.
    Mirrors streaming.py's `_authenticate_ws` token-decoding pattern."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        user_id = int(payload.get("sub", 0))
    except (JWTError, ValueError, TypeError):
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()


def _get_current_user_header_or_query(
    token_header: Optional[str],
    token_query: Optional[str],
    db: Session,
) -> models.User:
    """Auth fallback for endpoints that must be openable directly in a browser
    (e.g. a CSV export download link), where the browser cannot attach a
    `Authorization: Bearer` header. Accepts the normal header first, falling
    back to a `?token=` query param — mirrors the pattern used by
    streaming.py's websocket auth (`token: str = Query(...)`)."""
    raw = token_header or token_query
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = _get_user_from_token(raw, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account not verified. Please complete signup.")
    return user


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


@router.get("/{user_id}/sms/export")
def export_sms(
    user_id: int,
    token: Optional[str] = Query(default=None),
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Download the FULL (uncapped) SMS history for [user_id] as a CSV file.

    Unlike GET /{user_id}/sms (capped at 500, JSON), this returns every row
    with a `Content-Disposition: attachment` header so it can be opened
    directly by a browser / downloaded via `url_launcher` on the client.

    Auth: accepts the normal `Authorization: Bearer` header OR a `?token=`
    query param (browser download links can't attach custom headers), mirroring
    streaming.py's websocket token-query-param auth pattern.
    """
    user = _get_current_user_header_or_query(token_header, token, db)
    _assert_can_read(user, user_id, db)

    rows = (
        db.query(MonitorSms)
        .filter(MonitorSms.user_id == user_id)
        .order_by(MonitorSms.id.asc())
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["address", "body", "timestamp", "kind"])
    for r in rows:
        writer.writerow([r.address or "", r.body or "", r.ts or "", r.kind or ""])
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sms_export.csv"},
    )


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
