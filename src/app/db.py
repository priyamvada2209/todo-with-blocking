import os
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, scoped_session, sessionmaker
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode


class Base(DeclarativeBase):
    pass


_session_factory = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False)
)
_engine: Engine | None = None


def _strip_ssl_mode_from_url(url: str) -> str:
    parts = urlsplit(url)
    qs = parse_qsl(parts.query, keep_blank_values=True)
    qs = [(k, v) for k, v in qs if k.lower() not in ("ssl-mode", "ssl_mode")]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))


def _connect_args_from_env() -> dict:
    ca_path = os.getenv("MYSQL_CA_PATH") or os.getenv("AIVEN_MYSQL_CA_PATH") or os.getenv("MYSQL_SSL_CA")
    if ca_path:
        return {"ssl": {"ca": ca_path}}
    return {}


def init_db(database_url: str) -> Engine:
    global _engine
    clean_url = _strip_ssl_mode_from_url(database_url)
    connect_args = _connect_args_from_env()
    _engine = create_engine(clean_url, future=True, pool_pre_ping=True, connect_args=connect_args)
    _session_factory.configure(bind=_engine)
    return _engine


def get_session() -> Session:
    return _session_factory()


def remove_session(_exception: Exception | None = None) -> None:
    _session_factory.remove()
