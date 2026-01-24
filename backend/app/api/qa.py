from fastapi import APIRouter, Depends, Request, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.embedding import get_embedding
from app.services.vector_store import VectorStore
from app.services.llm import generate_answer

router = APIRouter()
settings = get_settings()


class QARequest(BaseModel):
    question: str
    doc_ids: Optional[List[str]] = None
    top_k: int = 5


class Source(BaseModel):
    chunk_id: str
    doc_id: str
    file_name: str
    page_start: Optional[int]
    page_end: Optional[int]
    text_excerpt: str


class QAResponse(BaseModel):
    question: str
    answer: str
    sources: List[Source]
    confidence: str


@router.post("", response_model=QAResponse)
async def answer_question(
    request: Request,
    qa_request: QARequest,
):
    """Answer a question based on indexed documents."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    # Get question embedding
    question_embedding = await get_embedding(qa_request.question)

    # Retrieve relevant chunks
    results = await vector_store.search(
        query_embedding=question_embedding,
        top_k=qa_request.top_k,
        doc_ids=qa_request.doc_ids,
    )

    if not results:
        return QAResponse(
            question=qa_request.question,
            answer="I couldn't find any relevant information in the indexed documents to answer this question.",
            sources=[],
            confidence="low",
        )

    # Build context from retrieved chunks
    context_parts = []
    sources = []
    for i, r in enumerate(results):
        page_info = ""
        if r.get("page_start"):
            if r.get("page_end") and r["page_end"] != r["page_start"]:
                page_info = f" (pages {r['page_start']}-{r['page_end']})"
            else:
                page_info = f" (page {r['page_start']})"

        context_parts.append(
            f"[Source {i+1}: {r['file_name']}{page_info}]\n{r['text']}"
        )

        sources.append(
            Source(
                chunk_id=r["chunk_id"],
                doc_id=r["doc_id"],
                file_name=r["file_name"],
                page_start=r.get("page_start"),
                page_end=r.get("page_end"),
                text_excerpt=r["text"][:200] + "..." if len(r["text"]) > 200 else r["text"],
            )
        )

    context = "\n\n".join(context_parts)

    # Generate answer using LLM
    answer, confidence = await generate_answer(
        question=qa_request.question,
        context=context,
    )

    return QAResponse(
        question=qa_request.question,
        answer=answer,
        sources=sources,
        confidence=confidence,
    )
