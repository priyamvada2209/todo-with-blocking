import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional

import jwt
from flask import current_app, request
from werkzeug.exceptions import Unauthorized

from app.db import get_session
from app.models.user import User


def get_settings():
    """Get settings from Flask app context."""
    return current_app.config.get("SETTINGS")


def generate_tokens(user_id: int, secret_key: str, expiration_minutes: int, refresh_expiration_days: int) -> dict:
    """Generate JWT access token and refresh token."""
    now = datetime.now(timezone.utc)
    
    # Access token
    access_payload = {
        "user_id": user_id,
        "type": "access",
        "exp": now + timedelta(minutes=expiration_minutes),
        "iat": now,
    }
    access_token = jwt.encode(access_payload, secret_key, algorithm="HS256")
    
    # Refresh token
    refresh_payload = {
        "user_id": user_id,
        "type": "refresh",
        "exp": now + timedelta(days=refresh_expiration_days),
        "iat": now,
    }
    refresh_token = jwt.encode(refresh_payload, secret_key, algorithm="HS256")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "access_token_expiry_minutes": expiration_minutes,
    }


def verify_token(token: str, secret_key: str, token_type: str = "access") -> Optional[dict]:
    """Verify JWT token and return payload if valid."""
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        if payload.get("type") != token_type:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_current_user(secret_key: str) -> Optional[User]:
    """Extract and verify current user from request cookies or Authorization header."""
    token = None
    
    # Try to get token from Authorization header first
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    # Fall back to httpOnly cookie
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    payload = verify_token(token, secret_key, token_type="access")
    if not payload:
        return None
    
    user_id = payload.get("user_id")
    if not user_id:
        return None
    
    session = get_session()
    user = session.query(User).filter(User.id == user_id).first()
    return user


def require_auth(f):
    """Decorator to require authentication for an endpoint."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        settings = get_settings()
        if not settings:
            raise RuntimeError("Settings not configured")
        
        user = get_current_user(settings.jwt_secret_key)
        if not user:
            raise Unauthorized("Authentication required")
        
        # Pass user to the wrapped function
        return f(*args, current_user=user, **kwargs)
    
    return decorated_function


def get_token_expiry_time(token: str, secret_key: str) -> Optional[datetime]:
    """Get expiration time of a token."""
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    except jwt.InvalidTokenError:
        pass
    return None
