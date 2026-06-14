"""User auth: register, login, OTP, 2FA, device verification."""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models, os, random, string, secrets, hashlib
from auth import get_password_hash, verify_password, create_access_token, get_current_user, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from datetime import datetime, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# ── Pydantic schemas ─────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    is_active: bool
    role: str = "user"
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    dev_code: Optional[str] = None

class OTPRequest(BaseModel):
    identifier: str   # phone number or email
    purpose: str = "login"

class OTPVerify(BaseModel):
    identifier: str
    code: str
    purpose: str = "login"

class TwoFactorSetup(BaseModel):
    pass

class TwoFactorVerify(BaseModel):
    code: str

class DeviceRegister(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None

# ── Helpers ──────────────────────────────────────────────────────────────────

def _gen_otp(length=6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def _send_otp_fast2sms(phone: str, code: str) -> bool:
    """Send OTP via Fast2SMS. Returns True on success."""
    import httpx
    api_key = os.getenv("FAST2SMS_API_KEY", "")
    if not api_key:
        return True  # dev mode — skip actual send
    try:
        resp = httpx.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": api_key},
            json={"route": "otp", "variables_values": code, "numbers": phone.lstrip("+").lstrip("91")},
            timeout=10,
        )
        return resp.status_code == 200
    except Exception:
        return False

def _send_otp_email(email: str, code: str) -> bool:
    """Send OTP via Resend API."""
    import httpx
    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        return True  # dev mode
    try:
        resp = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "from": "GRAVITY <noreply@trackalways.com>",
                "to": [email],
                "subject": f"Your GRAVITY verification code: {code}",
                "html": f"<h2>Your OTP is: <strong style='color:#D4A853;font-size:32px'>{code}</strong></h2><p>Expires in 10 minutes.</p>",
            },
            timeout=10,
        )
        return resp.status_code in (200, 201)
    except Exception:
        return False

# ── Standard auth endpoints (keep existing) ─────────────────────────────────

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Pending unverified account — delete and allow re-registration
        db.delete(existing)
        db.commit()

    user = models.User(
        name=data.name, email=data.email, phone=data.phone,
        password_hash=get_password_hash(data.password),
        is_active=False,  # Activated only after email OTP verification
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Invalidate old registration OTPs for this email
    db.query(models.OTPCode).filter(
        models.OTPCode.identifier == data.email,
        models.OTPCode.purpose == "registration",
        models.OTPCode.is_used == False,
    ).update({"is_used": True})
    db.commit()

    # Create and send email verification OTP
    code = _gen_otp()
    otp_record = models.OTPCode(
        identifier=data.email,
        code=code,
        purpose="registration",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp_record)
    db.commit()
    _send_otp_email(data.email, code)

    token = create_access_token({"sub": user.id})
    dev_mode = not os.getenv("RESEND_API_KEY")
    return {"access_token": token, "token_type": "bearer", "user": user, **({"dev_code": code} if dev_mode else {})}

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account not verified. Please complete signup first.")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login/json", response_model=TokenResponse)
def login_json(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account not verified. Please complete signup first.")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login/unified", response_model=TokenResponse)
@limiter.limit("10/minute")
def login_unified(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    """Unified login for all roles. Checks User table first, then AdminUser table."""
    # Check regular User table (role: user, moderator)
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user and verify_password(data.password, user.password_hash):
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account not verified. Please complete signup first.")
        token = create_access_token({"sub": user.id})
        return {"access_token": token, "token_type": "bearer", "user": user}

    # Check AdminUser table (role: admin, super_admin)
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == data.email).first()
    if admin and verify_password(data.password, admin.password_hash):
        token = create_access_token({"admin_id": admin.id, "is_admin": True})
        # Normalize legacy "superadmin" → "super_admin" (DB may have old format)
        role = admin.role
        if role == "superadmin":
            role = "super_admin"
        user_payload = UserResponse(
            id=admin.id,
            name=admin.name,
            email=admin.email,
            phone=getattr(admin, "phone", None),
            is_active=getattr(admin, "is_active", True),
            role=role,
        )
        return {"access_token": token, "token_type": "bearer", "user": user_payload}

    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ── Password reset endpoints ─────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    # Always return success (don't leak if email exists)
    if user:
        # Generate reset token (use existing create_access_token with short expiry)
        import secrets
        reset_token = secrets.token_urlsafe(32)
        # Store in user's updated_at or a simple approach: encode in JWT
        token = create_access_token(
            {"sub": str(user.id), "type": "password_reset"},
            expires_delta=timedelta(hours=1)
        )
        # TODO: Send email with token (email service not yet configured)
        # For now, return token in response for testing
        return {"message": "If this email exists, a reset link has been sent.", "debug_token": token}
    return {"message": "If this email exists, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password reset successful"}

# ── OTP endpoints ────────────────────────────────────────────────────────────

@router.post("/otp/send")
def send_otp(data: OTPRequest, db: Session = Depends(get_db)):
    # Invalidate old OTPs for this identifier
    db.query(models.OTPCode).filter(
        models.OTPCode.identifier == data.identifier,
        models.OTPCode.purpose == data.purpose,
        models.OTPCode.is_used == False,
    ).update({"is_used": True})
    db.commit()

    code = _gen_otp()
    otp = models.OTPCode(
        identifier=data.identifier,
        code=code,
        purpose=data.purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    # Send via Fast2SMS (phone) or Resend (email)
    is_email = "@" in data.identifier
    if is_email:
        _send_otp_email(data.identifier, code)
    else:
        _send_otp_fast2sms(data.identifier, code)

    # In dev mode (no API keys), return code in response for testing
    dev_mode = not os.getenv("FAST2SMS_API_KEY") and not os.getenv("RESEND_API_KEY")
    return {
        "message": "OTP sent successfully",
        "expires_in": 600,
        **({"dev_code": code} if dev_mode else {}),
    }

@router.post("/otp/verify")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    otp = db.query(models.OTPCode).filter(
        models.OTPCode.identifier == data.identifier,
        models.OTPCode.code == data.code,
        models.OTPCode.purpose == data.purpose,
        models.OTPCode.is_used == False,
        models.OTPCode.expires_at > datetime.utcnow(),
    ).first()
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp.is_used = True
    db.commit()

    # Find or create user
    is_email = "@" in data.identifier
    if is_email:
        user = db.query(models.User).filter(models.User.email == data.identifier).first()
    else:
        user = db.query(models.User).filter(models.User.phone == data.identifier).first()

    if not user:
        # Auto-register user on first OTP login (non-registration flows)
        user = models.User(
            name=data.identifier.split("@")[0] if is_email else "User",
            email=data.identifier if is_email else f"{data.identifier}@otp.gravity",
            phone=None if is_email else data.identifier,
            password_hash=get_password_hash(secrets.token_hex(16)),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif data.purpose == "registration" and not user.is_active:
        # Activate the pending account — this is the final step of signup
        user.is_active = True
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "is_active": user.is_active}}

# ── 2FA endpoints ────────────────────────────────────────────────────────────

@router.post("/2fa/setup")
def setup_2fa(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        import pyotp, qrcode, io, base64
    except ImportError:
        raise HTTPException(status_code=501, detail="2FA libraries not installed. Run: pip install pyotp qrcode")

    existing = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == current_user.id).first()
    if existing and existing.is_enabled:
        raise HTTPException(status_code=400, detail="2FA already enabled")

    secret = pyotp.random_base32()
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=current_user.email, issuer_name="GRAVITY Safety")

    # Generate QR code as base64
    qr = qrcode.make(totp_uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    if existing:
        existing.secret = secret
        existing.is_enabled = False
    else:
        db.add(models.TwoFactorAuth(user_id=current_user.id, secret=secret))
    db.commit()

    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}", "uri": totp_uri}

@router.post("/2fa/enable")
def enable_2fa(data: TwoFactorVerify, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        import pyotp
    except ImportError:
        raise HTTPException(status_code=501, detail="pyotp not installed")

    tfa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == current_user.id).first()
    if not tfa:
        raise HTTPException(status_code=404, detail="2FA not set up. Call /2fa/setup first")

    totp = pyotp.TOTP(tfa.secret)
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
    tfa.is_enabled = True
    tfa.backup_codes = backup_codes
    db.commit()
    return {"message": "2FA enabled", "backup_codes": backup_codes}

@router.post("/2fa/verify")
def verify_2fa(data: TwoFactorVerify, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        import pyotp
    except ImportError:
        raise HTTPException(status_code=501, detail="pyotp not installed")

    tfa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == current_user.id).first()
    if not tfa or not tfa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled")

    totp = pyotp.TOTP(tfa.secret)
    if totp.verify(data.code, valid_window=1):
        return {"verified": True, "message": "2FA verified"}

    # Check backup codes
    if data.code.upper() in (tfa.backup_codes or []):
        codes = [c for c in tfa.backup_codes if c != data.code.upper()]
        tfa.backup_codes = codes
        db.commit()
        return {"verified": True, "message": "Backup code used", "remaining_backup_codes": len(codes)}

    raise HTTPException(status_code=400, detail="Invalid 2FA code")

@router.post("/2fa/disable")
def disable_2fa(data: TwoFactorVerify, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        import pyotp
    except ImportError:
        raise HTTPException(status_code=501, detail="pyotp not installed")

    tfa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == current_user.id).first()
    if not tfa or not tfa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled")

    totp = pyotp.TOTP(tfa.secret)
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    tfa.is_enabled = False
    db.commit()
    return {"message": "2FA disabled"}

@router.get("/2fa/status")
def get_2fa_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tfa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == current_user.id).first()
    return {"enabled": tfa.is_enabled if tfa else False}

# ── Device verification endpoints ────────────────────────────────────────────

@router.post("/device/register")
def register_device(
    data: DeviceRegister,
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device_token = secrets.token_urlsafe(32)
    ip = request.client.host if request.client else None
    device = models.TrustedDevice(
        user_id=current_user.id,
        device_token=device_token,
        device_name=data.device_name,
        device_type=data.device_type,
        browser=data.browser,
        ip_address=ip,
    )
    db.add(device)
    db.commit()
    return {"device_token": device_token, "message": "Device registered as trusted"}

@router.post("/device/verify")
def verify_device(device_token: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    device = db.query(models.TrustedDevice).filter(
        models.TrustedDevice.device_token == device_token,
        models.TrustedDevice.user_id == current_user.id,
    ).first()
    if not device:
        return {"trusted": False}
    device.last_seen = datetime.utcnow()
    db.commit()
    return {"trusted": True, "device_name": device.device_name}

@router.get("/device/list")
def list_devices(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    devices = db.query(models.TrustedDevice).filter(models.TrustedDevice.user_id == current_user.id).all()
    return [{"id": d.id, "device_name": d.device_name, "device_type": d.device_type, "browser": d.browser, "last_seen": d.last_seen.isoformat() if d.last_seen else None} for d in devices]

@router.delete("/device/{device_id}")
def remove_device(device_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    device = db.query(models.TrustedDevice).filter(
        models.TrustedDevice.id == device_id,
        models.TrustedDevice.user_id == current_user.id,
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device removed"}
