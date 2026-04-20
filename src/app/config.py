import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    debug: bool

    @classmethod
    def from_env(cls) -> "Settings":
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is required. Example: mysql+pymysql://user:pass@localhost:3306/todo_v1")

        debug = os.getenv("FLASK_DEBUG", "false").strip().lower() == "true"
        return cls(database_url=database_url, debug=debug)
