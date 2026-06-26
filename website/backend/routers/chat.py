from fastapi import APIRouter, HTTPException, Depends, WebSocket, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user

router = APIRouter()

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
