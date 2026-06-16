"""Monitoring router — WebRTC signaling + activity log for parental monitoring."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import json
from datetime import datetime

from database import get_db
from auth import get_current_user
import models

router = APIRouter()

# ── In-memory signaling rooms: room_key -> {user_id: WebSocket} ──────────────
signaling_rooms: dict[str, dict[str, WebSocket]] = {}

def _room_key(family_id: int) -> str:
    return f"monitor_{family_id}"


# ── WebSocket signaling endpoint ─────────────────────────────────────────────
@router.websocket("/ws/{family_id}/{user_id}")
async def monitoring_ws(websocket: WebSocket, family_id: int, user_id: str):
    """WebRTC signaling channel for monitoring. Both parent and child connect here."""
    await websocket.accept()
    key = _room_key(family_id)
    if key not in signaling_rooms:
        signaling_rooms[key] = {}
    signaling_rooms[key][user_id] = websocket
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            target = msg.get("target")
            if target and key in signaling_rooms and target in signaling_rooms[key]:
                try:
                    await signaling_rooms[key][target].send_text(raw)
                except Exception:
                    signaling_rooms[key].pop(target, None)
            else:
                # broadcast to all others in room
                for uid, ws in list(signaling_rooms.get(key, {}).items()):
                    if uid != user_id:
                        try:
                            await ws.send_text(raw)
                        except Exception:
                            signaling_rooms[key].pop(uid, None)
    except WebSocketDisconnect:
        signaling_rooms.get(key, {}).pop(user_id, None)
    except Exception:
        signaling_rooms.get(key, {}).pop(user_id, None)


# ── Activity log models ───────────────────────────────────────────────────────
class ActivityLogIn(BaseModel):
    section: str          # e.g. "home", "health", "map", "chat"
    duration_seconds: int
    family_id: int

class ActivityLogOut(BaseModel):
    section: str
    duration_seconds: int
    logged_at: str
    user_name: str

# In-memory activity store (keyed by user_id)
_activity_store: dict[int, list[dict]] = {}

@router.post("/activity")
async def log_activity(
    payload: ActivityLogIn,
    current_user: models.User = Depends(get_current_user),
):
    """Child logs in-app activity (section + time spent)."""
    entry = {
        "section": payload.section,
        "duration_seconds": payload.duration_seconds,
        "logged_at": datetime.utcnow().isoformat(),
        "user_name": current_user.name,
    }
    uid = current_user.id
    if uid not in _activity_store:
        _activity_store[uid] = []
    _activity_store[uid].insert(0, entry)
    # keep last 200 entries per user
    _activity_store[uid] = _activity_store[uid][:200]
    return {"ok": True}


@router.get("/activity/{child_user_id}")
async def get_activity(
    child_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Parent fetches child's activity log."""
    logs = _activity_store.get(child_user_id, [])
    return {"logs": logs}
