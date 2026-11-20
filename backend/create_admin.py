import argparse
from getpass import getpass

from sqlalchemy import select

from app.auth import password_hash
from app.database import SessionLocal
from app.models import Role, User


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a school portal account.")
    parser.add_argument("username", help="Unique login username (case-insensitive)")
    parser.add_argument(
        "--role",
        choices=[role.value for role in Role],
        default=Role.PRINCIPAL.value,
        help="Account role (default: Principal)",
    )
    args = parser.parse_args()

    username = args.username.strip().lower()
    if not 3 <= len(username) <= 320:
        parser.error("Username must contain between 3 and 320 characters.")
    password = getpass("Password (minimum 12 characters): ")
    confirmation = getpass("Confirm password: ")
    if not 12 <= len(password) <= 128:
        parser.error("Password must contain between 12 and 128 characters.")
    if password != confirmation:
        parser.error("Passwords do not match.")

    with SessionLocal.begin() as db:
        if db.scalar(select(User.id).where(User.email == username)) is not None:
            parser.error(f"An account for {username} already exists.")
        db.add(
            User(
                email=username,
                password_hash=password_hash.hash(password),
                role=Role(args.role),
                is_active=True,
            )
        )
    print(f"{args.role} account created for {username}.")


if __name__ == "__main__":
    main()
