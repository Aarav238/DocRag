"""Clerk session JWT verification and MongoDB user context."""

from __future__ import annotations

import logging
import ssl
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

import certifi
import httpx
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings
from app.core.database import get_db

logger = logging.getLogger(__name__)
settings = get_settings()

security = HTTPBearer(auto_error=False)
_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if not settings.clerk_jwks_url:
        raise RuntimeError("clerk_jwks_url is not configured")
    if _jwks_client is None:
        # Use certifi's CA bundle so JWKS HTTPS fetch works on macOS / installs
        # where the default ssl context lacks system certs (SSL: CERTIFICATE_VERIFY_FAILED).
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        _jwks_client = PyJWKClient(
            settings.clerk_jwks_url,
            cache_keys=True,
            ssl_context=ssl_context,
        )
    return _jwks_client


def verify_clerk_session_token(token: str) -> dict[str, Any]:
    """Verify Clerk session JWT and return claims (includes `sub` = Clerk user id)."""
    if not settings.clerk_jwks_url or not settings.clerk_issuer:
        raise HTTPException(
            status_code=503,
            detail="Clerk JWT verification is not configured on the server",
        )
    try:
        jwks = _get_jwks_client()
        signing_key = jwks.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer,
            options={"verify_aud": False},
        )
        return payload
    except jwt.exceptions.InvalidTokenError as e:
        logger.debug("Invalid Clerk token: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired session") from e


async def fetch_clerk_user_profile(clerk_user_id: str) -> Optional[dict[str, Any]]:
    """Fetch user from Clerk Backend API (requires clerk_secret_key)."""
    if not settings.clerk_secret_key:
        return None
    url = f"https://api.clerk.com/v1/users/{clerk_user_id}"
    headers = {"Authorization": f"Bearer {settings.clerk_secret_key}"}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url, headers=headers)
            if r.status_code != 200:
                logger.warning("Clerk API user fetch failed: %s %s", r.status_code, r.text[:200])
                return None
            return r.json()
    except httpx.HTTPError as e:
        logger.warning("Clerk API request error: %s", e)
        return None


def _primary_email(clerk_json: dict[str, Any]) -> Optional[str]:
    emails = clerk_json.get("email_addresses") or []
    primary_id = clerk_json.get("primary_email_address_id")
    for e in emails:
        if primary_id and e.get("id") == primary_id:
            return e.get("email_address")
    if emails:
        return emails[0].get("email_address")
    return None


async def upsert_user_from_clerk(
    db: AsyncIOMotorDatabase,
    clerk_user_id: str,
    claims: dict[str, Any],
) -> dict[str, Any]:
    """
    Ensure a row exists in `users` for this Clerk user.
    Prefer Clerk Backend API when clerk_secret_key is set; otherwise use JWT claims + webhook data later.
    """
    now = datetime.utcnow()
    existing = await db.users.find_one({"clerk_user_id": clerk_user_id})
    if existing and existing.get("deleted_at"):
        raise HTTPException(status_code=403, detail="Account is not available")

    profile = await fetch_clerk_user_profile(clerk_user_id)
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None

    if profile:
        email = _primary_email(profile)
        first_name = profile.get("first_name")
        last_name = profile.get("last_name")
        image_url = profile.get("image_url")
    else:
        email = claims.get("email")
        first_name = claims.get("given_name")
        last_name = claims.get("family_name")

    new_id = str(uuid.uuid4())
    set_doc: dict[str, Any] = {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "image_url": image_url,
        "updated_at": now,
        "deleted_at": None,
    }
    await db.users.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": set_doc, "$setOnInsert": {"_id": new_id, "created_at": now}},
        upsert=True,
    )
    user_doc = await db.users.find_one({"clerk_user_id": clerk_user_id})
    if not user_doc:
        raise HTTPException(status_code=500, detail="User sync failed")
    return user_doc


@dataclass
class UserContext:
    """Authenticated application user (MongoDB `users` document)."""

    id: str
    clerk_user_id: str
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UserContext:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    claims = verify_clerk_session_token(credentials.credentials)
    clerk_user_id = claims.get("sub")
    if not clerk_user_id or not isinstance(clerk_user_id, str):
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user_doc = await upsert_user_from_clerk(db, clerk_user_id, claims)
    return UserContext(
        id=user_doc["_id"],
        clerk_user_id=user_doc["clerk_user_id"],
        email=user_doc.get("email"),
        first_name=user_doc.get("first_name"),
        last_name=user_doc.get("last_name"),
    )
