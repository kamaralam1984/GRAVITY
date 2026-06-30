"""AirDroid-style remote monitoring endpoints.

All uploads are made by the authenticated child device. All reads require the
caller to be the family owner of a family the target user belongs to.

Endpoints:
  POST /monitor/call-logs          — upload call log entries
  POST /monitor/screen-time        — upload per-app screen-time stats
  POST /monitor/app-list           — upload installed apps list
  POST /monitor/notifications      — upload intercepted notifications
  POST /monitor/clipboard          — upload clipboard content
  POST /monitor/device-info        — upload storage/RAM/battery snapshot
  POST /monitor/wrong-password-alert — wrong unlock attempt alert
  POST /monitor/sim-alert          — SIM card change alert
  POST /monitor/battery-alert      — low-battery alert
  POST /monitor/screenshot/upload  — screenshot file upload
  POST /monitor/audio/upload       — audio clip file upload
  POST /monitor/camera/upload      — remote-camera photo upload

  GET  /monitor/{user_id}/call-logs
  GET  /monitor/{user_id}/screen-time
  GET  /monitor/{user_id}/app-list
  GET  /monitor/{user_id}/notifications
  GET  /monitor/{user_id}/clipboard
  GET  /monitor/{user_id}/device-info
  GET  /monitor/{user_id}/security-alerts
  GET  /monitor/{user_id}/screenshots
  GET  /monitor/{user_id}/audio-clips
  GET  /monitor/{user_id}/camera-photos
"""

import os, shutil, uuid
from datetime import datetime
from typing import Optional, List, Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models
from auth import get_current_user

router = APIRouter()

# ── Upload base directory (persists via Docker volume /app/data) ──────────────
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/data/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ══════════════════════════════════════════════════════════════════════════════
# SQLAlchemy models
# ══════════════════════════════════════════════════════════════════════════════

class MonitorCallLog(Base):
    __tablename__ = "monitor_call_logs"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    number     = Column(String, nullable=True)
    name       = Column(String, nullable=True)
    type       = Column(String, nullable=True)   # incoming / outgoing / missed
    duration   = Column(Integer, nullable=True)   # seconds
    timestamp  = Column(String, nullable=True)    # ms epoch
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MonitorAppUsage(Base):
    __tablename__ = "monitor_app_usage"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    package_name   = Column(String, nullable=True)
    app_name       = Column(String, nullable=True)
    total_time_ms  = Column(Integer, nullable=True)
    last_used      = Column(String, nullable=True)
    recorded_date  = Column(String, nullable=True)   # YYYY-MM-DD
    created_at     = Column(DateTime(timezone=True), server_default=func.now())


class MonitorInstalledApp(Base):
    __tablename__ = "monitor_installed_apps"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    package_name = Column(String, nullable=True)
    app_name     = Column(String, nullable=True)
    version      = Column(String, nullable=True)
    is_system    = Column(Integer, nullable=True)   # 0 / 1
    is_blocked   = Column(Integer, nullable=True)   # 0 / 1
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class MonitorNotification(Base):
    __tablename__ = "monitor_notifications"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    package_name = Column(String, nullable=True)
    app_name     = Column(String, nullable=True)
    title        = Column(String, nullable=True)
    text         = Column(Text, nullable=True)
    timestamp    = Column(String, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class MonitorClipboard(Base):
    __tablename__ = "monitor_clipboard"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content    = Column(Text, nullable=True)
    timestamp  = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MonitorDeviceInfo(Base):
    __tablename__ = "monitor_device_info"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    internal_total   = Column(Integer, nullable=True)
    internal_free    = Column(Integer, nullable=True)
    internal_used    = Column(Integer, nullable=True)
    external_total   = Column(Integer, nullable=True)
    external_free    = Column(Integer, nullable=True)
    ram_total        = Column(Integer, nullable=True)
    ram_available    = Column(Integer, nullable=True)
    battery_level    = Column(Integer, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())


class MonitorSecurityAlert(Base):
    __tablename__ = "monitor_security_alerts"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    alert_type    = Column(String, nullable=True)   # wrong_password / sim_change / low_battery
    detail        = Column(Text, nullable=True)     # JSON string with extra info
    timestamp     = Column(String, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class MonitorFile(Base):
    __tablename__ = "monitor_files"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_type   = Column(String, nullable=True)   # screenshot / audio / camera_photo
    filename    = Column(String, nullable=True)
    file_path   = Column(String, nullable=True)
    file_size   = Column(Integer, nullable=True)
    timestamp   = Column(String, nullable=True)
    source      = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)


# ══════════════════════════════════════════════════════════════════════════════
# Pydantic schemas
# ══════════════════════════════════════════════════════════════════════════════

class CallLogEntry(BaseModel):
    number:    Optional[str] = None
    name:      Optional[str] = None
    type:      Optional[str] = None
    duration:  Optional[int] = None
    timestamp: Optional[int] = None


class CallLogsUpload(BaseModel):
    logs: List[CallLogEntry]


class AppUsageStat(BaseModel):
    package_name:  Optional[str] = None
    app_name:      Optional[str] = None
    total_time_ms: Optional[int] = None
    last_used:     Optional[int] = None


class ScreenTimeUpload(BaseModel):
    stats:        List[AppUsageStat]
    recorded_date: Optional[str] = None   # YYYY-MM-DD


class AppInfo(BaseModel):
    package_name: Optional[str] = None
    app_name:     Optional[str] = None
    version:      Optional[str] = None
    is_system:    Optional[bool] = False
    is_blocked:   Optional[bool] = False


class AppListUpload(BaseModel):
    apps: List[AppInfo]


class NotificationItem(BaseModel):
    package_name: Optional[str] = None
    app_name:     Optional[str] = None
    title:        Optional[str] = None
    text:         Optional[str] = None
    timestamp:    Optional[int] = None


class NotificationsUpload(BaseModel):
    notifications: List[NotificationItem]


class ClipboardUpload(BaseModel):
    content:   str
    timestamp: Optional[str] = None


class DeviceInfoUpload(BaseModel):
    internal_total:  Optional[int] = None
    internal_free:   Optional[int] = None
    internal_used:   Optional[int] = None
    external_total:  Optional[int] = None
    external_free:   Optional[int] = None
    ram_total:       Optional[int] = None
    ram_available:   Optional[int] = None
    battery_level:   Optional[int] = None


class SecurityAlertUpload(BaseModel):
    alert_type: str                        # wrong_password / sim_change / low_battery
    detail:     Optional[Any] = None
    timestamp:  Optional[str] = None


# ══════════════════════════════════════════════════════════════════════════════
# Auth helper
# ══════════════════════════════════════════════════════════════════════════════

def _assert_can_read(caller: models.User, target_user_id: int, db: Session):
    if caller.id == target_user_id:
        return
    owned = db.query(models.Family).filter(models.Family.owner_id == caller.id).all()
    owned_ids = {f.id for f in owned}
    if not owned_ids:
        raise HTTPException(status_code=403, detail="Not authorized")
    member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.user_id == target_user_id,
            models.FamilyMember.family_id.in_(owned_ids),
        )
        .first()
    )
    if member or target_user_id in {f.owner_id for f in owned}:
        return
    raise HTTPException(status_code=403, detail="Not authorized")


def _save_upload(file: UploadFile, subfolder: str, user_id: int) -> tuple[str, str, int]:
    """Save an uploaded file under UPLOAD_DIR/{subfolder}/{user_id}/. Returns (filename, path, size)."""
    dest_dir = os.path.join(UPLOAD_DIR, subfolder, str(user_id))
    os.makedirs(dest_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    size = os.path.getsize(dest_path)
    return filename, dest_path, size


# ══════════════════════════════════════════════════════════════════════════════
# Upload endpoints (child → server)
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/call-logs")
def upload_call_logs(
    data: CallLogsUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = [
        MonitorCallLog(
            user_id=current_user.id,
            number=e.number,
            name=e.name,
            type=e.type,
            duration=e.duration,
            timestamp=str(e.timestamp) if e.timestamp else None,
        )
        for e in data.logs
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


@router.post("/screen-time")
def upload_screen_time(
    data: ScreenTimeUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = data.recorded_date or datetime.utcnow().strftime("%Y-%m-%d")
    rows = [
        MonitorAppUsage(
            user_id=current_user.id,
            package_name=s.package_name,
            app_name=s.app_name,
            total_time_ms=s.total_time_ms,
            last_used=str(s.last_used) if s.last_used else None,
            recorded_date=today,
        )
        for s in data.stats
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


@router.post("/app-list")
def upload_app_list(
    data: AppListUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Replace existing list for this user
    db.query(MonitorInstalledApp).filter(MonitorInstalledApp.user_id == current_user.id).delete()
    rows = [
        MonitorInstalledApp(
            user_id=current_user.id,
            package_name=a.package_name,
            app_name=a.app_name,
            version=a.version,
            is_system=1 if a.is_system else 0,
            is_blocked=1 if a.is_blocked else 0,
        )
        for a in data.apps
    ]
    if rows:
        db.add_all(rows)
    db.commit()
    return {"stored": len(rows)}


@router.post("/notifications")
def upload_notifications(
    data: NotificationsUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = [
        MonitorNotification(
            user_id=current_user.id,
            package_name=n.package_name,
            app_name=n.app_name,
            title=n.title,
            text=n.text,
            timestamp=str(n.timestamp) if n.timestamp else None,
        )
        for n in data.notifications
    ]
    if rows:
        db.add_all(rows)
        db.commit()
    return {"stored": len(rows)}


@router.post("/clipboard")
def upload_clipboard(
    data: ClipboardUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = MonitorClipboard(
        user_id=current_user.id,
        content=data.content,
        timestamp=data.timestamp or datetime.utcnow().isoformat(),
    )
    db.add(row)
    db.commit()
    return {"stored": 1}


@router.post("/device-info")
def upload_device_info(
    data: DeviceInfoUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = MonitorDeviceInfo(
        user_id=current_user.id,
        internal_total=data.internal_total,
        internal_free=data.internal_free,
        internal_used=data.internal_used,
        external_total=data.external_total,
        external_free=data.external_free,
        ram_total=data.ram_total,
        ram_available=data.ram_available,
        battery_level=data.battery_level,
    )
    db.add(row)
    db.commit()
    return {"stored": 1}


@router.post("/wrong-password-alert")
def upload_wrong_password_alert(
    data: SecurityAlertUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    row = MonitorSecurityAlert(
        user_id=current_user.id,
        alert_type="wrong_password",
        detail=json.dumps(data.detail) if data.detail else None,
        timestamp=data.timestamp or datetime.utcnow().isoformat(),
    )
    db.add(row)
    db.commit()
    return {"stored": 1}


@router.post("/sim-alert")
def upload_sim_alert(
    data: SecurityAlertUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    row = MonitorSecurityAlert(
        user_id=current_user.id,
        alert_type="sim_change",
        detail=json.dumps(data.detail) if data.detail else None,
        timestamp=data.timestamp or datetime.utcnow().isoformat(),
    )
    db.add(row)
    db.commit()
    return {"stored": 1}


@router.post("/battery-alert")
def upload_battery_alert(
    data: SecurityAlertUpload,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    row = MonitorSecurityAlert(
        user_id=current_user.id,
        alert_type="low_battery",
        detail=json.dumps(data.detail) if data.detail else None,
        timestamp=data.timestamp or datetime.utcnow().isoformat(),
    )
    db.add(row)
    db.commit()
    return {"stored": 1}


@router.post("/screenshot/upload")
async def upload_screenshot(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename, path, size = _save_upload(image, "screenshots", current_user.id)
    row = MonitorFile(
        user_id=current_user.id,
        file_type="screenshot",
        filename=filename,
        file_path=path,
        file_size=size,
        timestamp=datetime.utcnow().isoformat(),
        source="remote_capture",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "filename": filename, "size": size}


@router.post("/audio/upload")
async def upload_audio(
    audio: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename, path, size = _save_upload(audio, "audio", current_user.id)
    row = MonitorFile(
        user_id=current_user.id,
        file_type="audio",
        filename=filename,
        file_path=path,
        file_size=size,
        timestamp=datetime.utcnow().isoformat(),
        source="remote_audio",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "filename": filename, "size": size}


@router.post("/camera/upload")
async def upload_camera_photo(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename, path, size = _save_upload(image, "camera", current_user.id)
    row = MonitorFile(
        user_id=current_user.id,
        file_type="camera_photo",
        filename=filename,
        file_path=path,
        file_size=size,
        timestamp=datetime.utcnow().isoformat(),
        source="remote_camera",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "filename": filename, "size": size}


# ══════════════════════════════════════════════════════════════════════════════
# Read endpoints (parent reads child's data)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/{user_id}/call-logs")
def get_call_logs(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorCallLog)
        .filter(MonitorCallLog.user_id == user_id)
        .order_by(MonitorCallLog.id.desc())
        .limit(500)
        .all()
    )
    return [{"id": r.id, "number": r.number, "name": r.name, "type": r.type, "duration": r.duration, "timestamp": r.timestamp, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/screen-time")
def get_screen_time(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorAppUsage)
        .filter(MonitorAppUsage.user_id == user_id)
        .order_by(MonitorAppUsage.id.desc())
        .limit(1000)
        .all()
    )
    return [{"id": r.id, "package_name": r.package_name, "app_name": r.app_name, "total_time_ms": r.total_time_ms, "last_used": r.last_used, "recorded_date": r.recorded_date, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/app-list")
def get_app_list(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorInstalledApp)
        .filter(MonitorInstalledApp.user_id == user_id)
        .order_by(MonitorInstalledApp.app_name)
        .all()
    )
    return [{"id": r.id, "package_name": r.package_name, "app_name": r.app_name, "version": r.version, "is_system": bool(r.is_system), "is_blocked": bool(r.is_blocked)} for r in rows]


@router.get("/{user_id}/notifications")
def get_notifications(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorNotification)
        .filter(MonitorNotification.user_id == user_id)
        .order_by(MonitorNotification.id.desc())
        .limit(500)
        .all()
    )
    return [{"id": r.id, "package_name": r.package_name, "app_name": r.app_name, "title": r.title, "text": r.text, "timestamp": r.timestamp, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/clipboard")
def get_clipboard(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorClipboard)
        .filter(MonitorClipboard.user_id == user_id)
        .order_by(MonitorClipboard.id.desc())
        .limit(100)
        .all()
    )
    return [{"id": r.id, "content": r.content, "timestamp": r.timestamp, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/device-info")
def get_device_info(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    row = (
        db.query(MonitorDeviceInfo)
        .filter(MonitorDeviceInfo.user_id == user_id)
        .order_by(MonitorDeviceInfo.id.desc())
        .first()
    )
    if not row:
        return {}
    return {"internal_total": row.internal_total, "internal_free": row.internal_free, "internal_used": row.internal_used, "external_total": row.external_total, "external_free": row.external_free, "ram_total": row.ram_total, "ram_available": row.ram_available, "battery_level": row.battery_level, "created_at": row.created_at.isoformat() if row.created_at else None}


@router.get("/{user_id}/security-alerts")
def get_security_alerts(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorSecurityAlert)
        .filter(MonitorSecurityAlert.user_id == user_id)
        .order_by(MonitorSecurityAlert.id.desc())
        .limit(200)
        .all()
    )
    return [{"id": r.id, "alert_type": r.alert_type, "detail": r.detail, "timestamp": r.timestamp, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


def _file_url(row: MonitorFile, request_base: str = "") -> str:
    return f"/monitor/files/{row.id}/download"


@router.get("/{user_id}/screenshots")
def get_screenshots(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorFile)
        .filter(MonitorFile.user_id == user_id, MonitorFile.file_type == "screenshot")
        .order_by(MonitorFile.id.desc())
        .limit(100)
        .all()
    )
    return [{"id": r.id, "filename": r.filename, "size": r.file_size, "timestamp": r.timestamp, "url": _file_url(r), "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/audio-clips")
def get_audio_clips(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorFile)
        .filter(MonitorFile.user_id == user_id, MonitorFile.file_type == "audio")
        .order_by(MonitorFile.id.desc())
        .limit(100)
        .all()
    )
    return [{"id": r.id, "filename": r.filename, "size": r.file_size, "timestamp": r.timestamp, "url": _file_url(r), "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/{user_id}/camera-photos")
def get_camera_photos(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_can_read(current_user, user_id, db)
    rows = (
        db.query(MonitorFile)
        .filter(MonitorFile.user_id == user_id, MonitorFile.file_type == "camera_photo")
        .order_by(MonitorFile.id.desc())
        .limit(100)
        .all()
    )
    return [{"id": r.id, "filename": r.filename, "size": r.file_size, "timestamp": r.timestamp, "url": _file_url(r), "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


@router.get("/files/{file_id}/download")
def download_monitor_file(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(MonitorFile).filter(MonitorFile.id == file_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    _assert_can_read(current_user, row.user_id, db)
    if not os.path.exists(row.file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(row.file_path, filename=row.filename)
