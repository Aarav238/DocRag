"""Helpers to scope document IDs to the authenticated user."""

from typing import List, Optional

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import DocumentStatus


async def list_user_doc_ids(
    db: AsyncIOMotorDatabase,
    user_id: str,
    *,
    indexed_only: bool = False,
) -> List[str]:
    q: dict = {"user_id": user_id}
    if indexed_only:
        q["status"] = DocumentStatus.INDEXED
    cursor = db.documents.find(q, {"_id": 1})
    rows = await cursor.to_list(length=None)
    return [r["_id"] for r in rows]


async def require_docs_owned_by_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
    doc_ids: List[str],
) -> None:
    if not doc_ids:
        return
    unique = list(set(doc_ids))
    count = await db.documents.count_documents({"_id": {"$in": unique}, "user_id": user_id})
    if count != len(unique):
        raise HTTPException(status_code=403, detail="One or more documents are not accessible")


async def intersect_doc_filter(
    db: AsyncIOMotorDatabase,
    user_id: str,
    requested: Optional[List[str]],
    *,
    indexed_only: bool,
) -> List[str]:
    """
    Doc IDs the user may use for search / QA / draft.
    If `requested` is empty/None, all of the user's (indexed) documents are used.
    Otherwise, only IDs that belong to the user are kept.
    """
    allowed = set(await list_user_doc_ids(db, user_id, indexed_only=indexed_only))
    if not allowed:
        return []
    if not requested:
        return list(allowed)
    req = [d for d in requested if d]
    return [d for d in req if d in allowed]
