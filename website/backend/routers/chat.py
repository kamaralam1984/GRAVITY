import os, shutil, uuid

from fastapi import APIRouter, HTTPException, Depends, WebSocket, Query, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, desc, func
from pydantic import BaseModel
from typing import Optional
from database import Base, engine, get_db
import models
from auth import get_current_user

router = APIRouter()

# ── Upload base directory (persists via Docker volume /app/data on Docker
# deployments; falls back to a local dir next to this file for bare-metal
# deployments where /app doesn't exist or isn't writable) ─────────────────────
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/data/uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)


class ChatAttachment(Base):
    """A file (image, etc.) attached to a chat message or Moments post.

    Stored per-family — any member of the family it was uploaded to can read
    it back. Deliberately NOT the single-owner `/files/*` model, which only
    lets the original uploader download a file again.
    """
    __tablename__ = "chat_attachments"
    id          = Column(Integer, primary_key=True, index=True)
    family_id   = Column(Integer, ForeignKey("families.id"), nullable=False, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename    = Column(String, nullable=True)
    orig_name   = Column(String, nullable=True)
    file_path   = Column(String, nullable=True)
    file_size   = Column(Integer, nullable=True)
    mime_type   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)


def _assert_family_member(user: models.User, family_id: int, db: Session):
    """Same-family check (not same-user-id): any member (or owner) of the
    family may read attachments shared within it."""
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if membership:
        return
    owns = db.query(models.Family).filter(
        models.Family.id == family_id, models.Family.owner_id == user.id,
    ).first()
    if owns:
        return
    raise HTTPException(status_code=403, detail="Not a member of this family")


class MessageCreate(BaseModel):
    family_id: int
    content: Optional[str] = None
    media_url: Optional[str] = None
    type: str = "text"

@router.post("/send")
def send_message(data: MessageCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = models.Message(family_id=data.family_id, sender_id=user.id, content=data.content, media_url=data.media_url, type=data.type)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "message": "Sent"}

@router.post("/upload")
async def upload_chat_attachment(
    family_id: int,
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload an image (or other file) to attach to a chat message.

    Stored per-family under UPLOAD_DIR/chat/{family_id}/ and readable by any
    member of that family via GET /chat/upload/{id}/download — the returned
    `url` should be used as `media_url` in POST /chat/send.
    """
    _assert_family_member(user, family_id, db)

    dest_dir = os.path.join(UPLOAD_DIR, "chat", str(family_id))
    os.makedirs(dest_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    size = os.path.getsize(dest_path)

    row = ChatAttachment(
        family_id=family_id,
        uploader_id=user.id,
        filename=filename,
        orig_name=file.filename,
        file_path=dest_path,
        file_size=size,
        mime_type=file.content_type,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "url": f"/chat/upload/{row.id}/download",
        "size": size,
        "mime_type": row.mime_type,
    }


@router.get("/upload/{attachment_id}/download")
def download_chat_attachment(
    attachment_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(ChatAttachment).filter(ChatAttachment.id == attachment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    _assert_family_member(user, row.family_id, db)
    if not row.file_path or not os.path.exists(row.file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(row.file_path, filename=row.orig_name or row.filename, media_type=row.mime_type or "application/octet-stream")


@router.get("/family/{family_id}")
def get_messages(
    family_id: int,
    limit: int = 50,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify user is a member of this family
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id,
        models.FamilyMember.user_id == user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    # Single JOIN query: messages + sender name in one round-trip
    rows = (
        db.query(models.Message, models.User)
        .join(models.User, models.User.id == models.Message.sender_id)
        .filter(models.Message.family_id == family_id)
        .order_by(desc(models.Message.sent_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": m.id,
            "content": m.content,
            "type": m.type,
            "sender_id": m.sender_id,
            "sender_name": sender.name if sender else "Unknown",
            "sent_at": m.sent_at.isoformat() if m.sent_at else None,
            "is_reported": m.is_reported,
        }
        for m, sender in rows
    ]

@router.post("/{message_id}/report")
def report_message(message_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    msg.is_reported = True
    db.commit()
    return {"message": "Reported for review"}

@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    # Only sender can delete their own message
    if msg.sender_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's message")
    db.delete(msg)
    db.commit()
    return {"message": "Deleted"}

@router.get("/stats")
def chat_stats(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(func.count(models.Message.id)).scalar()
    reported = db.query(func.count(models.Message.id)).filter(models.Message.is_reported == True).scalar()
    return {"total_messages": total, "reported": reported}


@router.websocket("/ws/{family_id}")
async def chat_websocket(
    websocket: WebSocket,
    family_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Real-time WebSocket endpoint for family chat."""
    from jose import JWTError, jwt
    import os
    import json
    from ws_manager import manager

    from auth import SECRET_KEY, ALGORITHM

    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        user_id = int(payload.get("sub"))
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    room_id = f"chat_{family_id}"
    await manager.connect(websocket, room_id, str(user.id))
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                continue
            if msg.get("type") == "message":
                # Save to DB
                db_msg = models.Message(
                    family_id=family_id,
                    sender_id=user.id,
                    content=msg.get("content"),
                    type="text",
                )
                db.add(db_msg)
                db.commit()
                db.refresh(db_msg)
                # Broadcast to room
                await manager.broadcast_to_room(room_id, {
                    "type": "message",
                    "id": db_msg.id,
                    "content": db_msg.content,
                    "sender_name": user.name,
                    "sender_id": user.id,
                    "sent_at": db_msg.sent_at.isoformat() if db_msg.sent_at else None,
                })
    except Exception:
        manager.disconnect(websocket, room_id, str(user.id))
