from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import engine_from_config, pool
from sqlalchemy import create_engine
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from alembic import context

ROOT_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT_DIR / "src"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.db import Base  # noqa: E402
from app.models import Task  # noqa: F401,E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Build URL and connect args so we can support Aiven-style SSL params.
    def _strip_ssl_mode_from_url(url: str) -> str:
        parts = urlsplit(url)
        qs = parse_qsl(parts.query, keep_blank_values=True)
        qs = [(k, v) for k, v in qs if k.lower() not in ("ssl-mode", "ssl_mode")]
        new_query = urlencode(qs)
        return urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))

    raw_url = config.get_main_option("sqlalchemy.url")
    url = raw_url
    if raw_url:
        url = _strip_ssl_mode_from_url(raw_url)

    # If you provide a CA path via env var, pass it as a PyMySQL-friendly ssl dict.
    connect_args = {}
    ca_path = os.getenv("MYSQL_CA_PATH") or os.getenv("AIVEN_MYSQL_CA_PATH") or os.getenv("MYSQL_SSL_CA")
    if ca_path:
        connect_args["ssl"] = {"ca": ca_path}

    connectable = create_engine(
        url,
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
