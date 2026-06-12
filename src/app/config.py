import os
import secrets
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    debug: bool
    jwt_secret_key: str
    jwt_expiration_minutes: int
    jwt_refresh_expiration_days: int

    @classmethod
    def from_env(cls) -> "Settings":
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is required. Example: mysql+pymysql://user:pass@localhost:3306/todo_v1")

        debug = os.getenv("FLASK_DEBUG", "false").strip().lower() == "true"
        
        jwt_secret_key = os.getenv("JWT_SECRET_KEY")
        if not jwt_secret_key:
            # Generate a random secret key if not provided (development only)
            jwt_secret_key = secrets.token_urlsafe(32)
            print(f"Generated JWT_SECRET_KEY: {jwt_secret_key}")
        
        jwt_expiration_minutes = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))
        jwt_refresh_expiration_days = int(os.getenv("JWT_REFRESH_EXPIRATION_DAYS", "7"))
        
        return cls(
            database_url=database_url,
            debug=debug,
            jwt_secret_key=jwt_secret_key,
            jwt_expiration_minutes=jwt_expiration_minutes,
            jwt_refresh_expiration_days=jwt_refresh_expiration_days,
        )
