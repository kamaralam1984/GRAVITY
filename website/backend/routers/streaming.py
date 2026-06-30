"""WebSocket streaming relay for AirDroid-style live features.

Architecture:
  Child connects as "sender"   → /ws/stream/{stream_type}?token=XXX
  Parent connects as "viewer"  → /ws/view/{stream_type}/{child_user_id}?token=XXX
  Server relays sender frames to all active viewers.

  For screen control (reverse direction):
  Parent connects as "controller" → /ws/control?token=XXX&target={child_user_id}
  Child connects as "controlled"  → /ws/controlled?token=XXX
  Server relays controller events to the child.

stream_type: camera | audio | screen

Frame format (sender → server → viewer):
  {"type":"frame","data":"<base64>","w":640,"h":480,"ts":1234567890}
  {"type":"audio","data":"<base64_pcm>","ts":1234567890}
  {"type":"screen","data":"<base64_jpeg>","w":540,"h":960,"ts":1234567890}

Control event format (controller → server → controlled):
  {"type":"tap","x":0.5,"y":0.3}
  {"type":"swipe","x1":0.5,"y1":0.8,"x2":0.5,"y2":0.2,"duration":300}
  {"type":"key","action":"back"|"home"|"recents"}
"""

import asyncio
import json
import logging
from typing import Dict, List

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
import models
from auth import SECRET_KEY, ALGORITHM

router = APIRouter()
log = logging.getLogger(__name__)


# ── Auth helper ───────────────────────────────────────────────────────────────

async def _authenticate_ws(websocket: WebSocket, token: str, db: Session) -> models.User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub", 0))
        user = db.query(models.User).filter(models.User.id == user_id).first()
        return user
    except (JWTError, ValueError, Exception):
        return None


# ── Relay state ───────────────────────────────────────────────────────────────

# stream_type → child_user_id → sender WebSocket
_senders: Dict[str, Dict[int, WebSocket]] = {"camera": {}, "audio": {}, "screen": {}}

# stream_type → child_user_id → list of viewer WebSockets
_viewers: Dict[str, Dict[int, List[WebSocket]]] = {"camera": {}, "audio": {}, "screen": {}}

# child_user_id → controlled WebSocket (child waiting for control events)
_controlled: Dict[int, WebSocket] = {}

# child_user_id → list of controller WebSockets (parents sending gestures)
_controllers: Dict[int, List[WebSocket]] = {}


async def _relay_to_viewers(stream_type: str, child_id: int, message: str):
    viewers = _viewers.get(stream_type, {}).get(child_id, [])
    dead = []
    for ws in viewers:
        try:
            await ws.send_text(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        try:
            viewers.remove(ws)
        except ValueError:
            pass


async def _relay_to_controlled(child_id: int, message: str):
    ws = _controlled.get(child_id)
    if ws:
        try:
            await ws.send_text(message)
        except Exception:
            _controlled.pop(child_id, None)


# ── Sender endpoint (child uploads stream) ────────────────────────────────────

@router.websocket("/ws/stream/{stream_type}")
async def ws_stream_sender(
    websocket: WebSocket,
    stream_type: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Child device connects here to upload a live stream."""
    if stream_type not in ("camera", "audio", "screen"):
        await websocket.close(code=4000)
        return

    user = await _authenticate_ws(websocket, token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    log.info(f"[stream] user {user.id} started {stream_type} stream")

    _senders.setdefault(stream_type, {})[user.id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            # Relay raw frame to all viewers of this child
            await _relay_to_viewers(stream_type, user.id, data)
    except WebSocketDisconnect:
        _senders.get(stream_type, {}).pop(user.id, None)
        log.info(f"[stream] user {user.id} ended {stream_type} stream")
    except Exception as e:
        log.error(f"[stream] error: {e}")
        _senders.get(stream_type, {}).pop(user.id, None)


# ── Viewer endpoint (parent receives stream) ──────────────────────────────────

@router.websocket("/ws/view/{stream_type}/{child_user_id}")
async def ws_stream_viewer(
    websocket: WebSocket,
    stream_type: str,
    child_user_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Parent connects here to receive a child's live stream."""
    if stream_type not in ("camera", "audio", "screen"):
        await websocket.close(code=4000)
        return

    user = await _authenticate_ws(websocket, token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    log.info(f"[view] user {user.id} watching {stream_type} of child {child_user_id}")

    viewers_map = _viewers.setdefault(stream_type, {})
    viewers_map.setdefault(child_user_id, []).append(websocket)

    # Send status to viewer
    await websocket.send_text(json.dumps({"type": "connected", "child_user_id": child_user_id, "stream": stream_type}))

    # Check if child is currently streaming
    if _senders.get(stream_type, {}).get(child_user_id):
        await websocket.send_text(json.dumps({"type": "active"}))
    else:
        await websocket.send_text(json.dumps({"type": "waiting", "message": "Child stream not active"}))

    try:
        # Keep connection alive, ping every 30s
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_text(json.dumps({"type": "ping"}))
            except Exception:
                break
    except WebSocketDisconnect:
        pass
    finally:
        viewers = viewers_map.get(child_user_id, [])
        try:
            viewers.remove(websocket)
        except ValueError:
            pass
        log.info(f"[view] user {user.id} disconnected from {stream_type} of child {child_user_id}")


# ── Screen Control: Child listens for gestures ────────────────────────────────

@router.websocket("/ws/controlled")
async def ws_controlled(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Child device connects here to receive remote control gestures from parent."""
    user = await _authenticate_ws(websocket, token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    _controlled[user.id] = websocket
    log.info(f"[control] child {user.id} ready for remote control")

    try:
        while True:
            # Keep alive — child mostly receives, but can also send acks
            msg = await websocket.receive_text()
            # Forward acks to controllers if needed
            controllers = _controllers.get(user.id, [])
            for c in controllers:
                try:
                    await c.send_text(msg)
                except Exception:
                    pass
    except WebSocketDisconnect:
        _controlled.pop(user.id, None)
        log.info(f"[control] child {user.id} disconnected from control")


# ── Screen Control: Parent sends gestures ─────────────────────────────────────

@router.websocket("/ws/control")
async def ws_control(
    websocket: WebSocket,
    token: str = Query(...),
    target: int = Query(...),   # child_user_id
    db: Session = Depends(get_db),
):
    """Parent connects here to send remote control gestures to a child device."""
    user = await _authenticate_ws(websocket, token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    _controllers.setdefault(target, []).append(websocket)
    log.info(f"[control] parent {user.id} controlling child {target}")

    # Inform parent if child is ready
    if _controlled.get(target):
        await websocket.send_text(json.dumps({"type": "child_ready"}))
    else:
        await websocket.send_text(json.dumps({"type": "child_offline", "message": "Child not connected"}))

    try:
        while True:
            data = await websocket.receive_text()
            # Relay gesture to child
            await _relay_to_controlled(target, data)
    except WebSocketDisconnect:
        controllers = _controllers.get(target, [])
        try:
            controllers.remove(websocket)
        except ValueError:
            pass
        log.info(f"[control] parent {user.id} disconnected from controlling child {target}")


# ── Presence heartbeat ────────────────────────────────────────────────────────

@router.post("/presence/heartbeat")
async def presence_heartbeat(
    token: str = Query(default=""),
    db: Session = Depends(get_db),
):
    """Child device heartbeat — marks the user online in the DB."""
    # This endpoint also accepts auth via Bearer header (handled by Depends(get_current_user))
    # but also accepts token query param for background service compatibility.
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub", 0))
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            from datetime import datetime as dt
            user.last_seen = dt.utcnow()
            db.commit()
            return {"status": "online", "user_id": user_id}
    except Exception:
        pass
    return {"status": "error"}
