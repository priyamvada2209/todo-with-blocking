from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, scoped_session, sessionmaker


class Base(DeclarativeBase):
    pass


_session_factory = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False)
)
_engine: Engine | None = None


def init_db(database_url: str) -> Engine:
    global _engine
    _engine = create_engine(database_url, future=True, pool_pre_ping=True)
    _session_factory.configure(bind=_engine)
    return _engine


def get_session() -> Session:
    return _session_factory()


def remove_session(_exception: Exception | None = None) -> None:
    _session_factory.remove()
