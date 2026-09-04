import random
import string
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models import User
from app.services.auth import AuthService
from app.services.email_service import send_otp_email, send_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ─── Helpers ────────────────────────────────────────────────────────────────

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP code."""
    return ''.join(random.choices(string.digits, k=length))


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and issue an email OTP for verification."""

    # ── Gmail-only validation ──────────────────────────────────────────────
    if not payload.email.lower().endswith("@gmail.com"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only Gmail addresses (@gmail.com) are accepted for registration."
        )

    # ── Password length check ──────────────────────────────────────────────
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters long."
        )

    # ── Strict duplicate prevention ────────────────────────────────────────
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        if existing.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please sign in instead."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "This email is already registered but not yet verified. "
                    "Please check your inbox for the OTP, or use 'Resend OTP' to get a new code."
                )
            )
    # ──────────────────────────────────────────────────────────────────────

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    new_user = User(
        email=payload.email,
        hashed_password=AuthService.hash_password(payload.password),
        is_verified=False,
        otp_code=otp,
        otp_expires_at=otp_expiry,
    )
    db.add(new_user)
    db.commit()

    # ── Send OTP via Gmail (falls back to console if not configured) ───────
    sent = await send_otp_email(payload.email, otp)
    if not sent:
        print(f"\n{'='*50}")
        print(f"  DocuMind OTP for {payload.email}")
        print(f"  Code: {otp}  (valid 10 minutes)")
        print(f"  [EMAIL NOT SENT - configure GMAIL_USER & GMAIL_APP_PASSWORD in .env]")
        print(f"{'='*50}\n")
        return {"message": "Account created! OTP printed to server console (email not configured)."}

    return {"message": f"Account created! A 6-digit verification code has been sent to {payload.email}."}


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify the OTP and mark the user account as active."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already verified.")

    if not user.otp_code or user.otp_code != payload.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")

    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one.")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully! You can now log in."}


@router.post("/resend-otp")
async def resend_otp(payload: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend a fresh OTP to the user's email."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already verified.")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # ── Send fresh OTP via Gmail ───────────────────────────────────────────
    sent = await send_otp_email(user.email, otp)
    if not sent:
        print(f"\n{'='*50}")
        print(f"  DocuMind RESENT OTP for {user.email}")
        print(f"  Code: {otp}  (valid 10 minutes)")
        print(f"  [EMAIL NOT SENT - configure GMAIL_USER & GMAIL_APP_PASSWORD in .env]")
        print(f"{'='*50}\n")
        return {"message": "New OTP generated. Check the server console (email not configured)."}

    return {"message": f"A new verification code has been sent to {user.email}."}


@router.post("/login")
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate credentials and return a signed JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not AuthService.verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your OTP."
        )

    token = AuthService.create_access_token(data={"sub": user.email, "user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "email": user.email,
    }


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a reset token and send a reset email."""
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        # Don't leak whether the email exists
        return {"message": "If that email is registered, a reset link has been sent."}

    # Generate a secure token
    token = secrets.token_urlsafe(32)
    user.otp_code = token
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    # Send reset email
    sent = await send_reset_email(user.email, token)
    if not sent:
        print(f"\n{'='*50}")
        print(f"  DocuMind PASSWORD RESET for {user.email}")
        print(f"  Link: http://localhost:5173/reset-password?token={token}")
        print(f"  [EMAIL NOT SENT - configure GMAIL_USER & GMAIL_APP_PASSWORD in .env]")
        print(f"{'='*50}\n")
    
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verify reset token and update password."""
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters long."
        )

    # Find user by token (stored in otp_code)
    user = db.query(User).filter(User.otp_code == payload.token).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired.")

    # Update password and clear token
    user.hashed_password = AuthService.hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password has been successfully reset. You can now log in."}


# ─── Admin: Reset all users (dev only) ──────────────────────────────────────

@router.delete("/admin/reset-users")
async def reset_users(db: Session = Depends(get_db)):
    """Delete ALL users from the database. For development use only."""
    count = db.query(User).delete()
    db.commit()
    return {"message": f"Deleted {count} user(s). Database is now empty."}
