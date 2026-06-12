from app.auth import generate_tokens, verify_token
from app.db import get_session
from app.errors import ApiError
from app.models.user import User


def register_user(name: str, email: str, password: str, settings) -> tuple:
    """Register a new user and return user and tokens."""
    session = get_session()
    
    # Check if email already exists
    existing_user = session.query(User).filter(User.email == email).first()
    if existing_user:
        raise ApiError(
            "Email already registered",
            status_code=422,
            code="EMAIL_EXISTS",
            details={"email": "This email is already registered"},
        )
    
    # Create new user with hashed password
    user = User.from_password(name, email, password)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Generate tokens
    tokens = generate_tokens(
        user.id,
        settings.jwt_secret_key,
        settings.jwt_expiration_minutes,
        settings.jwt_refresh_expiration_days,
    )
    
    return user, tokens


def login_user(email: str, password: str, settings) -> tuple:
    """Authenticate user and return user and tokens."""
    session = get_session()
    
    # Find user by email
    user = session.query(User).filter(User.email == email).first()
    if not user or not user.verify_password(password):
        raise ApiError(
            "Invalid email or password",
            status_code=401,
            code="INVALID_CREDENTIALS",
            details={"credentials": "Email or password is incorrect"},
        )
    
    # Generate tokens
    tokens = generate_tokens(
        user.id,
        settings.jwt_secret_key,
        settings.jwt_expiration_minutes,
        settings.jwt_refresh_expiration_days,
    )
    
    return user, tokens


def refresh_access_token(refresh_token: str, settings) -> tuple:
    """Refresh access token using refresh token."""
    # Verify refresh token
    payload = verify_token(refresh_token, settings.jwt_secret_key, token_type="refresh")
    if not payload:
        raise ApiError(
            "Invalid or expired refresh token",
            status_code=401,
            code="INVALID_REFRESH_TOKEN",
            details={"refresh_token": "Refresh token is invalid or expired"},
        )
    
    user_id = payload.get("user_id")
    session = get_session()
    user = session.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise ApiError(
            "User not found",
            status_code=404,
            code="USER_NOT_FOUND",
            details={"user": "User associated with token not found"},
        )
    
    # Generate new tokens
    tokens = generate_tokens(
        user.id,
        settings.jwt_secret_key,
        settings.jwt_expiration_minutes,
        settings.jwt_refresh_expiration_days,
    )
    
    return user, tokens
