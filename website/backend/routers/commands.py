"""Remote device commands: a parent (family owner) sends a command targeting a
family member's device; the child device polls for pending commands and acks them.

Contract (mounted at /commands, /api prefix added by nginx):
- POST /commands/send  {target_user_id:int, type:str}  -> queue a command
- GET  /commands/poll                                  -> pending commands for caller's device
- POST /commands/ack   {command_id:int}                -> mark a command acknowledged/done
"""
import json

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from database import get_db, Base
from auth import get_current_user
import models

router = APIRouter()

# Allowed command types per shared contract — must mirror CommandType in
# flutter_app/lib/services/command_service.dart.
ALLOWED_TYPES = {
    "ring", "stop_ring", "locate", "refresh", "restart",
    "remote_audio", "stop_audio", "remote_photo",
    "call_logs", "screen_time", "app_list", "block_app", "unblock_app",
    "screenshot", "flashlight_on", "flashlight_off", "storage_info",
    "screen_mirror_start", "screen_mirror_stop",
    "camera_stream_start", "camera_stream_stop",
    "audio_stream_start", "audio_stream_stop",
    "remote_wipe", "clipboard_get", "clipboard_set",
    "screen_control_start", "screen_control_stop",
    "app_lock_set", "app_lock_unlock",
    "web_filter_add", "web_filter_remove", "web_filter_set_enabled",
    "sms_send", "talk_play", "file_pull", "list_directory",
    "app_install", "app_uninstall", "kiosk_start", "kiosk_stop", "device_reboot",
    "notification_reply",
}


# ── Model ─────────────────────────────────────────────────────────────────────

class Command(Base):
    __tablename__ = "commands"
    id = Column(Integer, primary_key=True, index=True)
    # Who issued the command (parent / family owner)
    sender_id = Column(Integer, nullable=False, index=True)
    # Whose device the command targets (the child / family member)
    target_user_id = Column(Integer, nullable=False, index=True)
    type = Column(String, nullable=False)
    # JSON-encoded payload for commands that need extra data (e.g. block_app's
    # package, clipboard_set's text, sms_send's to/body). Nullable for the
    # simple no-payload commands.
    extra = Column(String, nullable=True)
    status = Column(String, default="pending", index=True)  # pending / acked
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acked_at = Column(DateTime(timezone=True), nullable=True)


# Ensure the table exists even if create_all already ran at import time elsewhere.
try:
    Base.metadata.create_all(bind=__import__("database").engine)
except Exception:
    pass

# Defensive migration: add the `extra` column to a pre-existing `commands`
# table that was created before this column existed (create_all only creates
# missing tables, it never alters existing ones).
try:
    with __import__("database").engine.connect() as conn:
        conn.exec_driver_sql("ALTER TABLE commands ADD COLUMN extra VARCHAR")
        conn.commit()
except Exception:
    pass  # column already exists (or dialect quirk) — safe to ignore


# ── Schemas ───────────────────────────────────────────────────────────────────

class SendCommand(BaseModel):
    target_user_id: int
    type: str
    extra: Optional[Dict[str, Any]] = None


class AckCommand(BaseModel):
    command_id: int


class CommandResponse(BaseModel):
    id: int
    sender_id: int
    target_user_id: int
    type: str
    extra: Optional[Dict[str, Any]] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_command(cls, cmd: "Command") -> "CommandResponse":
        parsed: Optional[Dict[str, Any]] = None
        if cmd.extra:
            try:
                parsed = json.loads(cmd.extra)
            except (TypeError, ValueError):
                parsed = None
        return cls(
            id=cmd.id,
            sender_id=cmd.sender_id,
            target_user_id=cmd.target_user_id,
            type=cmd.type,
            extra=parsed,
            status=cmd.status,
            created_at=cmd.created_at,
        )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _shared_family_ids(user_id: int, db: Session) -> set:
    """Family ids the user belongs to (as owner or member)."""
    fids = {
        m.family_id
        for m in db.query(models.FamilyMember)
        .filter(models.FamilyMember.user_id == user_id)
        .all()
    }
    # Also include families the user directly owns (owner may not have a membership row)
    for fam in db.query(models.Family).filter(models.Family.owner_id == user_id).all():
        fids.add(fam.id)
    return fids


def _can_command(sender_id: int, target_user_id: int, db: Session) -> bool:
    """A sender may command a target if they share a family. Sender must be an
    owner of one of those shared families (transparent parental control)."""
    if sender_id == target_user_id:
        return True  # self-commands (e.g. trigger own device) allowed
    sender_fids = _shared_family_ids(sender_id, db)
    if not sender_fids:
        return False
    target_fids = _shared_family_ids(target_user_id, db)
    shared = sender_fids & target_fids
    if not shared:
        return False
    # Require the sender to own at least one of the shared families.
    owned = {
        f.id
        for f in db.query(models.Family)
        .filter(models.Family.id.in_(shared), models.Family.owner_id == sender_id)
        .all()
    }
    return bool(owned)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/send", response_model=CommandResponse)
def send_command(
    data: SendCommand,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid command type. Allowed: {sorted(ALLOWED_TYPES)}",
        )

    target = db.query(models.User).filter(models.User.id == data.target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    if not _can_command(current_user.id, data.target_user_id, db):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to command this user's device",
        )

    cmd = Command(
        sender_id=current_user.id,
        target_user_id=data.target_user_id,
        type=data.type,
        extra=json.dumps(data.extra) if data.extra is not None else None,
        status="pending",
    )
    db.add(cmd)
    db.commit()
    db.refresh(cmd)
    return CommandResponse.from_orm_command(cmd)


@router.get("/poll", response_model=List[CommandResponse])
def poll_commands(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return pending commands targeting the current user's device (oldest first)."""
    cmds = (
        db.query(Command)
        .filter(
            Command.target_user_id == current_user.id,
            Command.status == "pending",
        )
        .order_by(Command.created_at.asc())
        .all()
    )
    return [CommandResponse.from_orm_command(c) for c in cmds]


@router.post("/ack")
def ack_command(
    data: AckCommand,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cmd = db.query(Command).filter(Command.id == data.command_id).first()
    if not cmd:
        raise HTTPException(status_code=404, detail="Command not found")
    # Only the targeted device (child) may ack its own commands.
    if cmd.target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to ack this command")

    cmd.status = "acked"
    cmd.acked_at = datetime.utcnow()
    db.commit()
    return {"status": "ok", "command_id": cmd.id}
