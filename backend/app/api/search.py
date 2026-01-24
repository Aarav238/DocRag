from fastapi import APIRouter, Query, Depends, Request, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.embedding import get_embedding
from app.services.vector_store import VectorStore

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
    q: str = Query(..., min_length=1, description="Search query"),
    doc_ids: Optional[str] = Query(None, description="Comma-separated document IDs to filter"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
):
    """Perform semantic search across indexed documents."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    # Parse doc_ids filter
    doc_id_list = None
    if doc_ids:
        doc_id_list = [d.strip() for d in doc_ids.split(",") if d.strip()]

    # Get query embedding
    query_embedding = await get_embedding(q)

    # Search vector store
    results = await vector_store.search(
        query_embedding=query_embedding,
        top_k=top_k,
        doc_ids=doc_id_list,
    )

    # Deduplicate and rank results
    seen_texts = set()
    unique_results = []
    for r in results:
        text_hash = hash(r["text"][:200])  # Use first 200 chars for dedup
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
