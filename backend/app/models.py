from sqlalchemy import Boolean, Column, Integer, String, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    
    # OTP specific fields
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
