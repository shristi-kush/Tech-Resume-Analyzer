from typing import Optional

from werkzeug.security import check_password_hash, generate_password_hash

from services.database import create_app_user, get_user_by_email


def register_user(email: str, password: str, name: str = "") -> dict:
    email = email.strip().lower()
    if not email or not password:
        raise ValueError("Email and password are required")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")
    if get_user_by_email(email):
        raise ValueError("An account with this email already exists")
    password_hash = generate_password_hash(password)
    user_id = create_app_user(email, password_hash, name.strip() or None)
    return {"id": user_id, "email": email, "name": name.strip() or None}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    email = email.strip().lower()
    user = get_user_by_email(email)
    if not user:
        return None
    if not check_password_hash(user["password_hash"], password):
        return None
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name"),
        "role": "user",
    }
