"""Generic file transfer between parent and child.

  POST /files/upload          — child or parent uploads a file
  GET  /files/list            — list files in a folder
  GET  /files/download/{id}   — download a file by ID
  DELETE /files/{id}          — delete a file
"""

import os, shutil, uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models
from auth import get_current_user

router = APIRouter()

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/data/uploads")
try:
    os.makedirs(os.path.join(UPLOAD_DIR, "files"), exist_ok=True)
except OSError:
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "uploads")
    os.makedirs(os.path.join(UPLOAD_DIR, "files"), exist_ok=True)


# ── Model ─────────────────────────────────────────────────────────────────────

class TransferFile(Base):
    __tablename__ = "transfer_files"
    id          = Column(Integer, primary_key=True, index=True)
    owner_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    folder      = Column(String, default="files")
    filename    = Column(String, nullable=True)
    orig_name   = Column(String, nullable=True)
    file_path   = Column(String, nullable=True)
    file_size   = Column(Integer, nullable=True)
    mime_type   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query(default="files"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dest_dir = os.path.join(UPLOAD_DIR, "files", str(current_user.id), folder)
    os.makedirs(dest_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    size = os.path.getsize(dest_path)
    row = TransferFile(
        owner_id=current_user.id,
        folder=folder,
        filename=filename,
        orig_name=file.filename,
        file_path=dest_path,
        file_size=size,
        mime_type=file.content_type,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "name": filename, "orig_name": file.filename, "size": size, "mime_type": file.content_type, "uploaded_at": row.created_at.isoformat() if row.created_at else None}


@router.get("/list")
def list_files(
    folder: str = Query(default="files"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(TransferFile)
        .filter(TransferFile.owner_id == current_user.id, TransferFile.folder == folder)
        .order_by(TransferFile.id.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.orig_name or r.filename,
            "size": r.file_size,
            "mime_type": r.mime_type,
            "uploaded_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(TransferFile).filter(TransferFile.id == file_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    if row.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not os.path.exists(row.file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(row.file_path, filename=row.orig_name or row.filename, media_type=row.mime_type or "application/octet-stream")


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(TransferFile).filter(TransferFile.id == file_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    if row.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        if row.file_path and os.path.exists(row.file_path):
            os.remove(row.file_path)
    except OSError:
        pass
    db.delete(row)
    db.commit()
    return {"deleted": True}
