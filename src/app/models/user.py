from datetime import datetime

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHash, VerifyMismatchError
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash a password using Argon2id."""
        ph = PasswordHasher()
        return ph.hash(password)

    @classmethod
    def from_password(cls, name: str, email: str, password: str) -> "User":
        """Create a new User with hashed password."""
        password_hash = cls._hash_password(password)
        return cls(name=name, email=email, password_hash=password_hash)

    def verify_password(self, password: str) -> bool:
        """Verify a password against the stored hash."""
        try:
            ph = PasswordHasher()
            ph.verify(self.password_hash, password)
            return True
        except (InvalidHash, VerifyMismatchError):
            return False

    def update_password(self, new_password: str) -> None:
        """Update user password."""
        self.password_hash = self._hash_password(new_password)
