import base64
import json
import hashlib
import tempfile
import uuid
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime

from .schemas import (
    GoogleAuthRequest,
    UserRegisterRequest,
    UserLoginRequest,
    UserPreferencesUpdate,
    UserProfileResponse
)

USERS_FILE = Path(__file__).resolve().parent.parent / "data" / "users.json"
RUNTIME_USERS_FILE = Path(tempfile.gettempdir()) / "ronda_users.json"
ZERO_PII_PEPPER = "::ronda_zero_pii_v1"
FORBIDDEN_PII_KEYS = {"password_hash", "salt", "email", "name", "password"}


def compute_google_anon_id(raw_sub: str) -> str:
    clean_sub = raw_sub.strip().lower()
    digest = hashlib.sha256((clean_sub + ZERO_PII_PEPPER).encode("utf-8")).hexdigest()[:16]
    return f"g_{digest}"


def _decode_google_jwt_payload(credential: str) -> dict:
    parts = credential.strip().split(".")
    if len(parts) != 3:
        raise ValueError("Formato de credencial JWT de Google inválido.")
    payload_b64 = parts[1]
    padding = "=" * (-len(payload_b64) % 4)
    try:
        decoded_bytes = base64.urlsafe_b64decode(payload_b64 + padding)
        payload = json.loads(decoded_bytes.decode("utf-8"))
    except Exception as exc:
        raise ValueError("No se pudo decodificar el token de Google.") from exc

    iss = payload.get("iss")
    if iss and iss not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError("Emisor (iss) de credencial Google no válido.")

    if not payload.get("sub"):
        raise ValueError("El token de Google no contiene identificador 'sub'.")

    return payload


def _sanitize_record(record: dict) -> dict:
    return {k: v for k, v in record.items() if k not in FORBIDDEN_PII_KEYS}


def _load_users() -> Dict[str, dict]:
    target_file = RUNTIME_USERS_FILE if RUNTIME_USERS_FILE.exists() else USERS_FILE
    if not target_file.exists():
        try:
            USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(USERS_FILE, "w", encoding="utf-8") as f:
                json.dump({}, f)
        except OSError:
            pass
        return {}
    try:
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {k: _sanitize_record(v) for k, v in data.items()}
    except Exception:
        return {}


def _save_users(users: Dict[str, dict]):
    sanitized = {k: _sanitize_record(v) for k, v in users.items()}
    try:
        USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(sanitized, f, indent=2, ensure_ascii=False)
        if RUNTIME_USERS_FILE.exists():
            try:
                RUNTIME_USERS_FILE.unlink()
            except OSError:
                pass
    except OSError:
        try:
            with open(RUNTIME_USERS_FILE, "w", encoding="utf-8") as f:
                json.dump(sanitized, f, indent=2, ensure_ascii=False)
        except OSError:
            pass


def login_with_google(req: GoogleAuthRequest) -> UserProfileResponse:
    raw_sub: Optional[str] = None
    if req.credential and req.credential.strip():
        payload = _decode_google_jwt_payload(req.credential)
        raw_sub = str(payload["sub"])
    elif req.google_sub and req.google_sub.strip():
        raw_sub = req.google_sub.strip()

    if not raw_sub:
        raise ValueError("Se requiere una cuenta de Google válida.")

    anon_id = compute_google_anon_id(raw_sub)
    users = _load_users()
    new_token = f"tok_{uuid.uuid4().hex}"

    if anon_id in users:
        user_record = _sanitize_record(users[anon_id])
        user_record["id"] = anon_id
        user_record["auth_provider"] = "google"
        user_record["token"] = new_token
        users[anon_id] = user_record
    else:
        user_record = {
            "id": anon_id,
            "auth_provider": "google",
            "token": new_token,
            "neighborhood": req.neighborhood or "San Telmo",
            "pet_friendly": bool(req.pet_friendly),
            "vegetarian_friendly": bool(req.vegetarian_friendly),
            "budget_preference": req.budget_preference or "$$",
            "saved_plans": [],
            "favorite_place_ids": [],
            "created_at": datetime.utcnow().isoformat()
        }
        users[anon_id] = user_record

    _save_users(users)
    return _to_profile_response(user_record, token=new_token)


def register_user(req: UserRegisterRequest) -> UserProfileResponse:
    return login_with_google(
        GoogleAuthRequest(
            google_sub=req.email,
            neighborhood=req.neighborhood,
            pet_friendly=req.pet_friendly,
            vegetarian_friendly=req.vegetarian_friendly,
            budget_preference=req.budget_preference
        )
    )


def login_user(req: UserLoginRequest) -> UserProfileResponse:
    return login_with_google(
        GoogleAuthRequest(
            google_sub=req.email
        )
    )


def get_user_by_token(token: str) -> Optional[UserProfileResponse]:
    if not token:
        return None
    users = _load_users()
    for u in users.values():
        if u.get("token") == token:
            return _to_profile_response(u, token=token)
    return None


def update_preferences(user_id: str, prefs: UserPreferencesUpdate) -> UserProfileResponse:
    users = _load_users()
    if user_id not in users:
        raise ValueError("Usuario no encontrado.")

    user = _sanitize_record(users[user_id])
    if prefs.neighborhood is not None:
        user["neighborhood"] = prefs.neighborhood
    if prefs.pet_friendly is not None:
        user["pet_friendly"] = prefs.pet_friendly
    if prefs.vegetarian_friendly is not None:
        user["vegetarian_friendly"] = prefs.vegetarian_friendly
    if prefs.budget_preference is not None:
        user["budget_preference"] = prefs.budget_preference

    users[user_id] = user
    _save_users(users)
    return _to_profile_response(user, token=user.get("token"))


def save_plan_for_user(user_id: str, plan_data: dict) -> UserProfileResponse:
    users = _load_users()
    if user_id not in users:
        raise ValueError("Usuario no encontrado.")

    user = _sanitize_record(users[user_id])
    saved = user.get("saved_plans", [])

    plan_id = plan_data.get("id")
    already_saved = any((p.get("plan", p).get("id") == plan_id or p.get("id") == plan_id) for p in saved)
    if not already_saved:
        plan_copy = dict(plan_data)
        plan_copy["saved_at"] = datetime.utcnow().strftime("%d/%m/%Y %H:%M")
        saved.insert(0, plan_copy)
        user["saved_plans"] = saved
        users[user_id] = user
        _save_users(users)

    return _to_profile_response(user, token=user.get("token"))


def remove_saved_plan(user_id: str, plan_id: str) -> UserProfileResponse:
    users = _load_users()
    if user_id not in users:
        raise ValueError("Usuario no encontrado.")

    user = _sanitize_record(users[user_id])
    saved = user.get("saved_plans", [])
    user["saved_plans"] = [
        p for p in saved
        if p.get("id") != plan_id and p.get("plan", {}).get("id") != plan_id
    ]
    users[user_id] = user
    _save_users(users)
    return _to_profile_response(user, token=user.get("token"))


def toggle_favorite_place(user_id: str, place_id: str) -> UserProfileResponse:
    users = _load_users()
    if user_id not in users:
        raise ValueError("Usuario no encontrado.")

    user = _sanitize_record(users[user_id])
    favs = set(user.get("favorite_place_ids", []))
    if place_id in favs:
        favs.remove(place_id)
    else:
        favs.add(place_id)

    user["favorite_place_ids"] = list(favs)
    users[user_id] = user
    _save_users(users)
    return _to_profile_response(user, token=user.get("token"))


def _to_profile_response(u: dict, token: Optional[str] = None) -> UserProfileResponse:
    return UserProfileResponse(
        id=u["id"],
        name="Viajero Porteño",
        email="",
        auth_provider=u.get("auth_provider", "google"),
        neighborhood=u.get("neighborhood", "San Telmo"),
        pet_friendly=u.get("pet_friendly", False),
        vegetarian_friendly=u.get("vegetarian_friendly", False),
        budget_preference=u.get("budget_preference", "$$"),
        saved_plans=u.get("saved_plans", []),
        favorite_place_ids=u.get("favorite_place_ids", []),
        token=token or u.get("token")
    )
