"""Clerk webhooks — keep `users` collection in sync (Svix-signed)."""

import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from svix.webhooks import Webhook

from app.core.config import get_settings
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


def _primary_email_from_clerk(data: dict[str, Any]) -> Optional[str]:
    emails = data.get("email_addresses") or []
    primary_id = data.get("primary_email_address_id")
    for e in emails:
        if primary_id and e.get("id") == primary_id:
            return e.get("email_address")
    if emails:
        return emails[0].get("email_address")
    return None


async def _upsert_user_from_clerk_payload(db: AsyncIOMotorDatabase, data: dict[str, Any]) -> None:
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        return

    now = datetime.utcnow()
    email = _primary_email_from_clerk(data)
    new_id = str(uuid.uuid4())
    await db.users.update_one(
        {"clerk_user_id": clerk_user_id},
        {
            "$set": {
                "clerk_user_id": clerk_user_id,
                "email": email,
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "image_url": data.get("image_url"),
                "updated_at": now,
                "deleted_at": None,
            },
            "$setOnInsert": {"_id": new_id, "created_at": now},
        },
        upsert=True,
    )


async def _soft_delete_clerk_user(db: AsyncIOMotorDatabase, clerk_user_id: str) -> None:
    now = datetime.utcnow()
    await db.users.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": {"deleted_at": now, "updated_at": now}},
    )


@router.post("/clerk")
async def clerk_webhook(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    if not settings.clerk_webhook_secret:
        raise HTTPException(status_code=503, detail="Clerk webhooks are not configured")

    body = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    wh = Webhook(settings.clerk_webhook_secret)
    try:
        payload = wh.verify(body, headers)
    except Exception as e:
        logger.warning("Invalid Clerk webhook: %s", e)
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from e

    event_type = payload.get("type")
    data = payload.get("data") or {}

    try:
        if event_type in ("user.created", "user.updated"):
            await _upsert_user_from_clerk_payload(db, data)
        elif event_type == "user.deleted":
            uid = data.get("id")
            if uid:
                await _soft_delete_clerk_user(db, uid)
        else:
            logger.debug("Ignoring Clerk webhook type: %s", event_type)
    except Exception as e:
        logger.exception("Clerk webhook handler error: %s", e)
        raise HTTPException(status_code=500, detail="Webhook processing failed") from e

    return {"received": True}
