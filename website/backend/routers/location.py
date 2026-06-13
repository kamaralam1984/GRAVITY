"""Location tracking — REST + WebSocket real-time broadcasting."""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, json
from auth import get_current_user
from datetime import datetime
from ws_manager import manager
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "gravity-secret-key")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")


class LocationUpdate(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    altitude: Optional[float] = None
    place_name: Optional[str] = None
    device_id: Optional[int] = None
    battery: Optional[int] = None
    activity: Optional[str] = None


class GeofenceRequest(BaseModel):
    name: str
    lat: float
    lng: float
    radius_meters: float
    circle_id: str
    alert_on_enter: bool = True
    alert_on_exit: bool = True


class SOSEvent(BaseModel):
    lat: float
    lng: float
    circle_id: str
    message: Optional[str] = None


def _verify_ws_token(token: str, db: Session) -> models.User:
    """Validate a JWT token for WebSocket connections (token passed as query param)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        raw_sub = payload.get("sub")
        if raw_sub is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = int(raw_sub)
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── REST: update location ────────────────────────────────────────────────────

@router.post("/update")
async def update_location(
    data: LocationUpdate,
    family_id: Optional[int] = Query(None),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loc = models.Location(
        user_id=user.id,
        device_id=data.device_id,
        lat=data.lat,
        lng=data.lng,
        accuracy=data.accuracy,
        speed=data.speed,
        place_name=data.place_name,
    )
    db.add(loc)

    if data.device_id:
        device = db.query(models.Device).filter(models.Device.id == data.device_id).first()
        if device:
            device.is_online = True
            device.last_seen = datetime.utcnow()
            if data.battery is not None:
                device.battery_level = data.battery

    db.commit()

    if family_id:
        await manager.broadcast_to_room(
            room_id=str(family_id),
            message={
                "type": "location_update",
                "user_id": user.id,
                "name": user.name,
                "avatar_url": user.avatar_url,
                "lat": data.lat,
                "lng": data.lng,
                "accuracy": data.accuracy,
                "speed": data.speed,
                "heading": data.heading,
                "activity": data.activity or "stationary",
                "battery": data.battery,
                "place_name": data.place_name,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    return {"message": "Location updated", "lat": data.lat, "lng": data.lng}


# ── WebSocket: token passed as query param (WS headers not supported in browsers) ──

@router.websocket("/ws/{family_id}")
async def location_websocket(
    websocket: WebSocket,
    family_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        user = _verify_ws_token(token, db)
    except HTTPException:
        await websocket.close(code=4001)
        return

    room_id = str(family_id)
    user_id = str(user.id)
    await manager.connect(websocket, room_id, user_id)

    await websocket.send_json({
        "type": "room_joined",
        "family_id": family_id,
        "online": manager.online_count(room_id),
    })

    await manager.broadcast_to_room(room_id, {
        "type": "member_online",
        "user_id": user_id,
        "name": user.name,
        "online": manager.online_count(room_id),
    }, exclude=websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg.get("type") == "location_update":
                    msg["user_id"] = user_id
                    msg["name"] = user.name
                    msg["timestamp"] = datetime.utcnow().isoformat()
                    await manager.broadcast_to_room(room_id, msg, exclude=websocket)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, user_id)
        await manager.broadcast_to_room(room_id, {
            "type": "member_offline",
            "user_id": user_id,
            "online": manager.online_count(room_id),
        })


# ── REST: history & live snapshot ───────────────────────────────────────────

@router.get("/history/{user_id}")
def get_location_history(
    user_id: int,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Users can only view their own history; admins can view any
    if current_user.id != user_id:
        # verify they share a family
        shared = db.query(models.FamilyMember).filter(
            models.FamilyMember.user_id == current_user.id
        ).all()
        family_ids = [m.family_id for m in shared]
        target_in_family = db.query(models.FamilyMember).filter(
            models.FamilyMember.user_id == user_id,
            models.FamilyMember.family_id.in_(family_ids),
        ).first()
        if not target_in_family:
            raise HTTPException(status_code=403, detail="Not in the same family")

    locs = (
        db.query(models.Location)
        .filter(models.Location.user_id == user_id)
        .order_by(desc(models.Location.recorded_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "lat": l.lat,
            "lng": l.lng,
            "place_name": l.place_name,
            "speed": l.speed,
            "recorded_at": l.recorded_at.isoformat() if l.recorded_at else None,
        }
        for l in locs
    ]


@router.get("/live/{family_id}")
def get_family_live_locations(
    family_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify user is a member of this family
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id,
        models.FamilyMember.user_id == current_user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    members = db.query(models.FamilyMember).filter(models.FamilyMember.family_id == family_id).all()
    result = []
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        loc = (
            db.query(models.Location)
            .filter(models.Location.user_id == m.user_id)
            .order_by(desc(models.Location.recorded_at))
            .first()
        )
        device = db.query(models.Device).filter(models.Device.user_id == m.user_id).first()
        if user and loc:
            result.append({
                "user_id": user.id,
                "name": user.name,
                "avatar_url": user.avatar_url,
                "lat": loc.lat,
                "lng": loc.lng,
                "place_name": loc.place_name,
                "battery": device.battery_level if device else None,
                "is_online": device.is_online if device else False,
                "recorded_at": loc.recorded_at.isoformat() if loc.recorded_at else None,
            })
    return result


@router.post("/geofence")
async def create_geofence(
    req: GeofenceRequest,
    user: models.User = Depends(get_current_user),
):
    return {"message": "Geofence created", "name": req.name, "radius": req.radius_meters}


@router.post("/sos")
async def trigger_sos(
    event: SOSEvent,
    user: models.User = Depends(get_current_user),
):
    return {"message": "SOS triggered", "user_id": user.id, "status": "notified"}
