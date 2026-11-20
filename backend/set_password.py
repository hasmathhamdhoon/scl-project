import argparse
from getpass import getpass

from sqlalchemy import delete, select

from app.auth import password_hash
from app.database import SessionLocal
from app.models import User, UserSession


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset a portal user's password.")
    parser.add_argument("username", help="Existing login username")
    args = parser.parse_args()

    password = getpass("New password (12-128 characters): ")
    confirmation = getpass("Confirm new password: ")
    if not 12 <= len(password) <= 128:
        parser.error("Password must contain between 12 and 128 characters.")
    if password != confirmation:
        parser.error("Passwords do not match.")

    username = args.username.strip().lower()
    with SessionLocal.begin() as db:
        user = db.scalar(select(User).where(User.email == username))
        if user is None:
            parser.error(f"No account exists for {username}.")
        user.password_hash = password_hash.hash(password)
        db.execute(delete(UserSession).where(UserSession.user_id == user.id))
    print(f"Password updated and active sessions revoked for {username}.")


if __name__ == "__main__":
    main()
