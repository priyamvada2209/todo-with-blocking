import re
from email_validator import EmailNotValidError, validate_email

from app.errors import ApiError


def _validate_email(email: str) -> str:
    """Validate email format."""
    try:
        valid = validate_email(email, check_deliverability=False)
        return valid.email
    except EmailNotValidError as e:
        raise ApiError(
            "Invalid email address",
            status_code=422,
            code="INVALID_EMAIL",
            details={"email": str(e)},
        )


def _validate_password_strength(password: str) -> dict:
    """Validate password strength and return failed rules."""
    failed_rules = []
    
    # Check minimum length (5 characters)
    if len(password) < 5:
        failed_rules.append("Password must be at least 5 characters long")
    
    # Check for uppercase letter
    if not re.search(r"[A-Z]", password):
        failed_rules.append("Password must contain at least one uppercase letter (A-Z)")
    
    # Check for lowercase letter
    if not re.search(r"[a-z]", password):
        failed_rules.append("Password must contain at least one lowercase letter (a-z)")
    
    # Check for digit
    if not re.search(r"[0-9]", password):
        failed_rules.append("Password must contain at least one digit (0-9)")
    
    # Check for special character
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};:'\",.<>?/\\|`~]", password):
        failed_rules.append("Password must contain at least one special character (!@#$%^&*...)")
    
    return {"is_valid": len(failed_rules) == 0, "failed_rules": failed_rules}


def parse_register_payload(data: dict) -> dict:
    """Parse and validate user registration payload."""
    if not isinstance(data, dict):
        raise ApiError(
            "Invalid request payload",
            status_code=400,
            code="INVALID_PAYLOAD",
        )
    
    # Validate name
    name = data.get("name", "").strip()
    if not name:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"name": "Name is required"},
        )
    if len(name) > 255:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"name": "Name must be 255 characters or less"},
        )
    
    # Validate email
    email = data.get("email", "").strip()
    if not email:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"email": "Email is required"},
        )
    email = _validate_email(email)
    
    # Validate password
    password = data.get("password", "")
    if not password:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"password": "Password is required"},
        )
    
    password_validation = _validate_password_strength(password)
    if not password_validation["is_valid"]:
        raise ApiError(
            "Password does not meet strength requirements",
            status_code=422,
            code="WEAK_PASSWORD",
            details={"password": password_validation["failed_rules"]},
        )
    
    return {"name": name, "email": email, "password": password}


def parse_login_payload(data: dict) -> dict:
    """Parse and validate user login payload."""
    if not isinstance(data, dict):
        raise ApiError(
            "Invalid request payload",
            status_code=400,
            code="INVALID_PAYLOAD",
        )
    
    # Validate email
    email = data.get("email", "").strip()
    if not email:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"email": "Email is required"},
        )
    email = _validate_email(email)
    
    # Validate password
    password = data.get("password", "")
    if not password:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"password": "Password is required"},
        )
    
    return {"email": email, "password": password}


def parse_refresh_payload(data: dict) -> dict:
    """Parse and validate refresh token payload."""
    if not isinstance(data, dict):
        raise ApiError(
            "Invalid request payload",
            status_code=400,
            code="INVALID_PAYLOAD",
        )
    
    refresh_token = data.get("refresh_token", "")
    if not refresh_token:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"refresh_token": "Refresh token is required"},
        )
    
    return {"refresh_token": refresh_token}


def serialize_auth_response(user, access_token: str, refresh_token: str, access_token_expiry_minutes: int) -> dict:
    """Serialize authentication response (no password hash)."""
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
        "token": access_token,
        "refresh_token": refresh_token,
        "token_expiry_minutes": access_token_expiry_minutes,
    }


def serialize_user(user) -> dict:
    """Serialize user response (no password hash)."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
