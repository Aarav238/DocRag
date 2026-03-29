from fastapi import APIRouter, Query, Depends, Request, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import UserContext, get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.services.embedding import get_embedding
from app.services.vector_store import VectorStore
from app.services.user_documents import intersect_doc_filter

router = APIRouter()
settings = get_settings()


class SearchResult(BaseModel):
    chunk_id: str
    doc_id: str
    file_name: str
    text: str
    page_start: Optional[int]
    page_end: Optional[int]
    similarity_score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int


@router.get("", response_model=SearchResponse)
async def semantic_search(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserContext = Depends(get_current_user),
    q: str = Query(..., min_length=1, description="Search query"),
    doc_ids: Optional[str] = Query(None, description="Comma-separated document IDs to filter"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
):
    """Perform semantic search across indexed documents owned by the user."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    doc_id_list: Optional[List[str]] = None
    if doc_ids:
        doc_id_list = [d.strip() for d in doc_ids.split(",") if d.strip()]

    filtered = await intersect_doc_filter(db, user.id, doc_id_list, indexed_only=True)
    if not filtered:
        return SearchResponse(query=q, results=[], total_results=0)

    query_embedding = await get_embedding(q)

    results = await vector_store.search(
        query_embedding=query_embedding,
        top_k=top_k,
        doc_ids=filtered,
    )

    seen_texts = set()
    unique_results = []
    for r in results:
        text_hash = hash(r["text"][:200])
        if text_hash not in seen_texts:
            seen_texts.add(text_hash)
            unique_results.append(
                SearchResult(
                    chunk_id=r["chunk_id"],
                    doc_id=r["doc_id"],
                    file_name=r["file_name"],
                    text=r["text"],
                    page_start=r.get("page_start"),
                    page_end=r.get("page_end"),
                    similarity_score=r["score"],
                )
            )

    return SearchResponse(
        query=q,
        results=unique_results,
        total_results=len(unique_results),
    )
