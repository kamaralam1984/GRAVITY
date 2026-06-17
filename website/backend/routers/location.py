"""Location tracking — REST + WebSocket real-time broadcasting."""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, json, math
from auth import get_current_user
from datetime import datetime
from ws_manager import manager
from jose import JWTError, jwt
import os
import cache

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
    """Validate a JWT token for WebSocket connections."""
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

    # ── Auto-detect location stops ────────────────────────────────────────────
    try:
        def _hav_m(lat1, lng1, lat2, lng2):
            R = 6371000
            p1, p2 = math.radians(lat1), math.radians(lat2)
            dp = math.radians(lat2 - lat1); dl = math.radians(lng2 - lng1)
            a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
            return 2 * R * math.asin(math.sqrt(a))

        def _transport(speed_ms):
            if speed_ms is None: return "unknown"
            kmh = speed_ms * 3.6
            if kmh < 5: return "walking"
            if kmh < 25: return "bike"
            return "car"

        open_stop = (db.query(models.LocationStop)
            .filter(models.LocationStop.user_id == user.id,
                    models.LocationStop.left_at == None)
            .order_by(models.LocationStop.arrived_at.desc())
            .first())

        if open_stop is None:
            db.add(models.LocationStop(
                user_id=user.id, lat=data.lat, lng=data.lng,
                place_name=data.place_name, transport_mode=_transport(data.speed)))
        else:
            dist = _hav_m(open_stop.lat, open_stop.lng, data.lat, data.lng)
            if dist <= 120:
                duration = (datetime.utcnow() - open_stop.arrived_at.replace(tzinfo=None)).total_seconds() / 60
                open_stop.duration_minutes = int(duration)
                if data.place_name and not open_stop.place_name:
                    open_stop.place_name = data.place_name
            else:
                open_stop.left_at = datetime.utcnow()
                open_stop.duration_minutes = int((open_stop.left_at - open_stop.arrived_at.replace(tzinfo=None)).total_seconds() / 60)
                db.add(models.LocationStop(
                    user_id=user.id, lat=data.lat, lng=data.lng,
                    place_name=data.place_name, transport_mode=_transport(data.speed),
                    distance_from_prev_km=round(dist / 1000, 2)))
        db.commit()
    except Exception:
        pass

    # Log location to family's dedicated table (every 5th update to avoid bloat)
    if family_id:
        try:
            from routers.families import log_family_event
            loc_count = db.query(models.Location).filter(models.Location.user_id == user.id).count()
            if loc_count % 5 == 0:
                log_family_event(db, family_id, "location_update", user.id, user.name,
                                 {"lat": data.lat, "lng": data.lng, "place": data.place_name})
        except Exception:
            pass

    # ── Geofence check ───────────────────────────────────────────────────────
    if family_id:
        geofences = db.query(models.Geofence).filter(
            models.Geofence.family_id == family_id,
            models.Geofence.is_active == True
        ).all()
        for fence in geofences:
            R = 6371000
            lat1, lng1 = math.radians(data.lat), math.radians(data.lng)
            lat2, lng2 = math.radians(fence.center_lat), math.radians(fence.center_lng)
            dlat = lat2 - lat1
            dlng = lng2 - lng1
            a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlng/2)**2
            distance_m = 2 * R * math.asin(math.sqrt(a))
            is_inside = distance_m <= fence.radius_meters

            last_event = db.query(models.GeofenceEvent).filter(
                models.GeofenceEvent.geofence_id == fence.id,
                models.GeofenceEvent.user_id == user.id
            ).order_by(desc(models.GeofenceEvent.occurred_at)).first()

            last_was_inside = last_event and last_event.event_type == "enter"

            if is_inside and not last_was_inside and fence.alert_on_enter:
                db.add(models.GeofenceEvent(
                    geofence_id=fence.id, user_id=user.id,
                    event_type="enter", lat=data.lat, lng=data.lng
                ))
                await manager.broadcast_to_room(str(family_id), {
                    "type": "geofence_enter",
                    "user_id": user.id, "user_name": user.name,
                    "geofence_name": fence.name, "geofence_id": fence.id,
                })
            elif not is_inside and last_was_inside and fence.alert_on_exit:
                db.add(models.GeofenceEvent(
                    geofence_id=fence.id, user_id=user.id,
                    event_type="exit", lat=data.lat, lng=data.lng
                ))
                await manager.broadcast_to_room(str(family_id), {
                    "type": "geofence_exit",
                    "user_id": user.id, "user_name": user.name,
                    "geofence_name": fence.name, "geofence_id": fence.id,
                })
        db.commit()

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

    # ── Cache invalidation on new location ───────────────────────────────────
    # Bust live map + member list for this family; bust this user's history
    if family_id:
        cache.cdel(
            cache.ck("family", family_id, "live"),
            cache.ck("family", family_id, "members"),
        )
    cache.cdel_pattern(f"location:{user.id}:history:*")

    return {"message": "Location updated", "lat": data.lat, "lng": data.lng}


# ── WebSocket ────────────────────────────────────────────────────────────────

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


# ── REST: history & live snapshot ────────────────────────────────────────────

@router.get("/history/{user_id}")
def get_location_history(
    user_id: int,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Access control
    if current_user.id != user_id:
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

    key = cache.ck("location", user_id, "history", limit)
    cached = cache.cget(key)
    if cached is not None:
        return cached

    locs = (
        db.query(models.Location)
        .filter(models.Location.user_id == user_id)
        .order_by(desc(models.Location.recorded_at))
        .limit(limit)
        .all()
    )
    result = [
        {
            "lat": l.lat,
            "lng": l.lng,
            "place_name": l.place_name,
            "speed": l.speed,
            "recorded_at": l.recorded_at.isoformat() if l.recorded_at else None,
        }
        for l in locs
    ]
    cache.cset(key, result, cache.TTL.LOC_HISTORY)
    return result


@router.get("/live/{family_id}")
def get_family_live_locations(
    family_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_id == family_id,
        models.FamilyMember.user_id == current_user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    key = cache.ck("family", family_id, "live")
    cached = cache.cget(key)
    if cached is not None:
        return cached

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

    cache.cset(key, result, cache.TTL.LIVE_LOCATION)
    return result


@router.post("/geofence")
async def create_geofence(req: GeofenceRequest, user: models.User = Depends(get_current_user)):
    return {"message": "Geofence created", "name": req.name, "radius": req.radius_meters}


@router.post("/sos")
async def trigger_sos(event: SOSEvent, user: models.User = Depends(get_current_user)):
    return {"message": "SOS triggered", "user_id": user.id, "status": "notified"}
