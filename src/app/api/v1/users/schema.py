import re

from app.errors import ApiError


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


def parse_update_profile_payload(data: dict) -> dict:
    """Parse and validate profile update payload."""
    if not isinstance(data, dict):
        raise ApiError(
            "Invalid request payload",
            status_code=400,
            code="INVALID_PAYLOAD",
        )
    
    # Check if email is being modified (not allowed)
    if "email" in data:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"email": "Email cannot be modified"},
        )
    
    # Validate name
    name = data.get("name", "").strip()
    if not name:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"name": "Name is required and cannot be empty"},
        )
    if len(name) > 255:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"name": "Name must be 255 characters or less"},
        )
    
    return {"name": name}


def parse_password_change_payload(data: dict) -> dict:
    """Parse and validate password change payload."""
    if not isinstance(data, dict):
        raise ApiError(
            "Invalid request payload",
            status_code=400,
            code="INVALID_PAYLOAD",
        )
    
    # Validate current password
    current_password = data.get("current_password", "")
    if not current_password:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"current_password": "Current password is required"},
        )
    
    # Validate new password
    new_password = data.get("new_password", "")
    if not new_password:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"new_password": "New password is required"},
        )
    
    # Check if new password is same as current password
    if current_password == new_password:
        raise ApiError(
            "Validation failed",
            status_code=422,
            code="VALIDATION_ERROR",
            details={"new_password": "New password must be different from current password"},
        )
    
    # Validate new password strength
    password_validation = _validate_password_strength(new_password)
    if not password_validation["is_valid"]:
        raise ApiError(
            "Password does not meet strength requirements",
            status_code=422,
            code="WEAK_PASSWORD",
            details={"new_password": password_validation["failed_rules"]},
        )
    
    return {"current_password": current_password, "new_password": new_password}


def serialize_user(user) -> dict:
    """Serialize user response (no password hash)."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
