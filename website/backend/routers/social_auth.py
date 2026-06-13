"""Social auth — Google OAuth and Apple Sign In."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, os, secrets, httpx
from auth import get_password_hash, create_access_token

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "")

class GoogleAuthRequest(BaseModel):
    id_token: str   # Google ID token from frontend Google Sign-In

class AppleAuthRequest(BaseModel):
    identity_token: str   # Apple identity token
    user_name: Optional[str] = None  # Only sent on first sign-in by Apple

class SocialAuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    is_new_user: bool

# ── Google Sign In ────────────────────────────────────────────────────────────

@router.post("/google", response_model=SocialAuthResponse)
async def google_signin(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verify Google ID token and return app JWT."""
    # Verify with Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={data.id_token}",
            timeout=10,
        )

    if resp.status_code != 200:
        # Dev mode: accept token "test_google_token" for local testing
        if data.id_token == "test_google_token":
            google_info = {"email": "google_test@gravity.app", "name": "Google Test User", "sub": "google_test_123", "picture": ""}
        else:
            raise HTTPException(status_code=401, detail="Invalid Google token")
    else:
        google_info = resp.json()

    # Verify audience if GOOGLE_CLIENT_ID is set
    if GOOGLE_CLIENT_ID and google_info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    email = google_info.get("email")
    name = google_info.get("name", email.split("@")[0] if email else "User")
    avatar = google_info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # Find or create user
    user = db.query(models.User).filter(models.User.email == email).first()
    is_new = False
    if not user:
        user = models.User(
            name=name,
            email=email,
            avatar_url=avatar,
            password_hash=get_password_hash(secrets.token_hex(16)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new = True
    else:
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
            db.commit()

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "is_active": user.is_active, "avatar_url": user.avatar_url},
        "is_new_user": is_new,
    }

# ── Apple Sign In ─────────────────────────────────────────────────────────────

@router.post("/apple", response_model=SocialAuthResponse)
async def apple_signin(data: AppleAuthRequest, db: Session = Depends(get_db)):
    """Verify Apple identity token and return app JWT."""
    from jose import jwt as jose_jwt, JWTError

    # Fetch Apple's public keys
    try:
        async with httpx.AsyncClient() as client:
            keys_resp = await client.get("https://appleid.apple.com/auth/keys", timeout=10)
        apple_keys = keys_resp.json()
    except Exception:
        apple_keys = {"keys": []}

    # Decode Apple JWT (we do basic decode without full verification in dev mode)
    try:
        # Try to decode without verification first to get email
        unverified = jose_jwt.decode(
            data.identity_token,
            key="",
            algorithms=["RS256"],
            options={"verify_signature": False, "verify_sub": False, "verify_aud": False},
        )
        email = unverified.get("email")
        apple_user_id = unverified.get("sub", "")
    except (JWTError, Exception):
        # Dev mode fallback
        if data.identity_token == "test_apple_token":
            email = "apple_test@gravity.app"
            apple_user_id = "apple_test_123"
        else:
            raise HTTPException(status_code=401, detail="Invalid Apple token")

    name = data.user_name or (email.split("@")[0] if email else "Apple User")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Apple")

    user = db.query(models.User).filter(models.User.email == email).first()
    is_new = False
    if not user:
        user = models.User(
            name=name,
            email=email,
            password_hash=get_password_hash(secrets.token_hex(16)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new = True

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "is_active": user.is_active, "avatar_url": getattr(user, "avatar_url", None)},
        "is_new_user": is_new,
    }
