from app.db import get_session
from app.errors import ApiError
from app.models.user import User


def update_profile(user_id: int, name: str) -> User:
    """Update user profile name."""
    session = get_session()
    
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ApiError(
            "User not found",
            status_code=404,
            code="USER_NOT_FOUND",
        )
    
    user.name = name
    session.commit()
    session.refresh(user)
    
    return user


def change_password(user_id: int, current_password: str, new_password: str) -> User:
    """Change user password."""
    session = get_session()
    
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ApiError(
            "User not found",
            status_code=404,
            code="USER_NOT_FOUND",
        )
    
    # Verify current password
    if not user.verify_password(current_password):
        raise ApiError(
            "Invalid current password",
            status_code=401,
            code="INVALID_PASSWORD",
            details={"current_password": "Current password is incorrect"},
        )
    
    # Update password
    user.update_password(new_password)
    session.commit()
    session.refresh(user)
    
    return user
