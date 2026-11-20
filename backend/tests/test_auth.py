import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["API_ORIGINS"] = "http://localhost:5173,http://testserver"
os.environ["SESSION_COOKIE_SECURE"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.auth import password_hash
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Role, User, UserSession


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def create_user(*, active: bool = True) -> str:
    with SessionLocal.begin() as db:
        user = User(
            email="principal@example.edu",
            password_hash=password_hash.hash("a-strong-password"),
            role=Role.PRINCIPAL,
            is_active=active,
        )
        db.add(user)
    return "principal@example.edu"


def test_health_check_verifies_the_database(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}


def test_login_creates_hashed_password_and_authenticated_session(client):
    username = create_user()

    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "a-strong-password"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == username
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=lax" in response.headers["set-cookie"].lower()
    with SessionLocal() as db:
        user = db.query(User).filter_by(email=username).one()
        assert user.password_hash != "a-strong-password"
        assert password_hash.verify("a-strong-password", user.password_hash)
        assert db.query(UserSession).count() == 1

    current_user = client.get("/api/auth/me")
    assert current_user.status_code == 200
    assert current_user.json()["role"] == "Principal"


def test_login_rejects_bad_credentials_without_creating_a_session(client):
    username = create_user()

    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "incorrect-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"
    with SessionLocal() as db:
        assert db.query(UserSession).count() == 0


def test_inactive_accounts_cannot_sign_in(client):
    username = create_user(active=False)

    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "a-strong-password"},
    )

    assert response.status_code == 401


def test_logout_revokes_the_server_side_session(client):
    username = create_user()
    client.post(
        "/api/auth/login",
        json={"username": username, "password": "a-strong-password"},
    )

    response = client.post("/api/auth/logout", headers={"Origin": "http://testserver"})

    assert response.status_code == 204
    assert client.get("/api/auth/me").status_code == 401
    with SessionLocal() as db:
        assert db.query(UserSession).count() == 0


def test_cookie_authenticated_mutations_reject_untrusted_origins(client):
    username = create_user()
    client.post(
        "/api/auth/login",
        json={"username": username, "password": "a-strong-password"},
    )

    response = client.post("/api/auth/logout", headers={"Origin": "https://untrusted.example"})

    assert response.status_code == 403
    assert client.get("/api/auth/me").status_code == 200
