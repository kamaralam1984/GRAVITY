"""JWT + password utilities."""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models, os

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. Refusing to start with an "
        "insecure default signing key."
    )
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except (ValueError, TypeError):
        # Malformed/empty stored hash → treat as failed auth, not a 500.
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        # options={"verify_sub": False} — sub claim type validation off (we store int as str)
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
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account not verified. Please complete signup.")
    return user

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    # Path 1: dedicated admin token (has admin_id or is_admin flag) → AdminUser table
    admin_id = payload.get("admin_id")
    if admin_id is None and payload.get("is_admin"):
        admin_id = payload.get("sub")
    if admin_id is not None:
        try:
            admin = db.query(models.AdminUser).filter(models.AdminUser.id == int(admin_id)).first()
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid token")
        if not admin or not admin.is_active:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin

    # Path 2: regular user token (sub = user.id) where role is admin/super_admin
    raw_sub = payload.get("sub")
    if raw_sub is not None:
        try:
            user = db.query(models.User).filter(models.User.id == int(raw_sub)).first()
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid token")
        if user and user.is_active and user.role in ("admin", "super_admin"):
            return user

    raise HTTPException(status_code=401, detail="Not an admin token")
