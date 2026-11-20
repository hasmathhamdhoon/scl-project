from app.database import Base, engine
from app import models  # noqa: F401


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Database tables created (existing tables were left unchanged).")


if __name__ == "__main__":
    main()
