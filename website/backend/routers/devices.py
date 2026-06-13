"""Device management endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth import get_current_user
from datetime import datetime

router = APIRouter()

class DeviceRegister(BaseModel):
    device_name: str
    os: str
    os_version: Optional[str] = None
    app_version: Optional[str] = None
    push_token: Optional[str] = None

class BatteryUpdate(BaseModel):
    battery_level: int
    is_online: bool = True

@router.post("/register")
def register_device(data: DeviceRegister, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    device = models.Device(user_id=user.id, device_name=data.device_name, os=data.os, os_version=data.os_version, app_version=data.app_version, push_token=data.push_token, is_online=True, last_seen=datetime.utcnow())
    db.add(device)
    db.commit()
    db.refresh(device)
    return {"id": device.id, "device_name": device.device_name, "message": "Device registered"}

@router.patch("/{device_id}/battery")
def update_battery(device_id: int, data: BatteryUpdate, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.battery_level = data.battery_level
    device.is_online = data.is_online
    device.last_seen = datetime.utcnow()
    db.commit()
    return {"message": "Updated", "battery": data.battery_level}

@router.get("/my")
def my_devices(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    devices = db.query(models.Device).filter(models.Device.user_id == user.id).all()
    return [{"id": d.id, "name": d.device_name, "os": d.os, "battery": d.battery_level, "is_online": d.is_online, "last_seen": d.last_seen.isoformat() if d.last_seen else None} for d in devices]

@router.delete("/{device_id}")
def revoke_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device removed"}
