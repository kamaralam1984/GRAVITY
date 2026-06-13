from fastapi import APIRouter, HTTPException, Depends
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

    msgs = db.query(models.Message).filter(models.Message.family_id == family_id).order_by(desc(models.Message.sent_at)).limit(limit).all()
    result = []
    for m in msgs:
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "content": m.content,
            "type": m.type,
            "sender_name": sender.name if sender else "Unknown",
            "sent_at": m.sent_at.isoformat() if m.sent_at else None,
            "is_reported": m.is_reported,
        })
    return result

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
