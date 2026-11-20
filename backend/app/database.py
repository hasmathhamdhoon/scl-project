from collections.abc import Generator

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool


class Settings(BaseSettings):
    database_url: str
    api_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    session_cookie_name: str = "greenfield_session"
    session_cookie_secure: bool = True
    session_ttl_hours: int = Field(default=8, ge=1, le=168)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
engine_options = {"pool_pre_ping": True}
if settings.database_url in {"sqlite:///:memory:", "sqlite+pysqlite:///:memory:"}:
    engine_options.update(
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
engine = create_engine(settings.database_url, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
allowed_origins = [origin.strip() for origin in settings.api_origins.split(",") if origin.strip()]


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
