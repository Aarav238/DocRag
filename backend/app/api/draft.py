from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional, List
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
import json

from app.core.auth import UserContext, get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.services.embedding import get_embedding
from app.services.vector_store import VectorStore
from app.services.llm import generate_draft, generate_draft_stream, parse_markdown_sections
from app.services.user_documents import require_docs_owned_by_user

router = APIRouter()
settings = get_settings()


class DraftRequest(BaseModel):
    instruction: str
    reference_doc_ids: List[str]
    sections: Optional[List[str]] = None
    style_guidance: Optional[str] = None


class DraftSection(BaseModel):
    title: str
    content: str


class DraftResponse(BaseModel):
    instruction: str
    draft: str
    sections: List[DraftSection]
    reference_docs: List[str]


@router.post("/generate", response_model=DraftResponse)
async def generate_document_draft(
    request: Request,
    draft_request: DraftRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserContext = Depends(get_current_user),
):
    """Generate a document draft based on reference documents owned by the user."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    if not draft_request.reference_doc_ids:
        raise HTTPException(status_code=400, detail="At least one reference document is required")

    await require_docs_owned_by_user(db, user.id, draft_request.reference_doc_ids)

    instruction_embedding = await get_embedding(draft_request.instruction)

    results = await vector_store.search(
        query_embedding=instruction_embedding,
        top_k=10,
        doc_ids=draft_request.reference_doc_ids,
    )

    reference_excerpts = []

    doc_excerpts = {}
    for r in results:
        doc_id = r["doc_id"]
        if doc_id not in doc_excerpts:
            doc_excerpts[doc_id] = []
        if len(doc_excerpts[doc_id]) < 3:
            doc_excerpts[doc_id].append(r)

    for doc_id, excerpts in doc_excerpts.items():
        file_name = excerpts[0]["file_name"] if excerpts else "Unknown"
        excerpt_texts = [e["text"] for e in excerpts]
        reference_excerpts.append({
            "doc_id": doc_id,
            "file_name": file_name,
            "excerpts": excerpt_texts,
        })

    default_sections = [
        "Introduction",
        "Background",
        "Scope",
        "Methodology",
        "Deliverables",
        "Timeline",
        "Conclusion",
    ]
    sections = draft_request.sections or default_sections

    draft_content, parsed_sections = await generate_draft(
        instruction=draft_request.instruction,
        reference_excerpts=reference_excerpts,
        sections=sections,
        style_guidance=draft_request.style_guidance,
    )

    return DraftResponse(
        instruction=draft_request.instruction,
        draft=draft_content,
        sections=[
            DraftSection(title=s["title"], content=s["content"])
            for s in parsed_sections
        ],
        reference_docs=[r["file_name"] for r in reference_excerpts],
    )


@router.post("/generate/stream")
async def generate_document_draft_stream(
    request: Request,
    draft_request: DraftRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserContext = Depends(get_current_user),
):
    """Stream a document draft token-by-token via SSE."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    if not draft_request.reference_doc_ids:
        raise HTTPException(status_code=400, detail="At least one reference document is required")

    await require_docs_owned_by_user(db, user.id, draft_request.reference_doc_ids)

    instruction_embedding = await get_embedding(draft_request.instruction)
    results = await vector_store.search(
        query_embedding=instruction_embedding,
        top_k=10,
        doc_ids=draft_request.reference_doc_ids,
    )

    reference_excerpts = []
    doc_excerpts = {}
    for r in results:
        doc_id = r["doc_id"]
        if doc_id not in doc_excerpts:
            doc_excerpts[doc_id] = []
        if len(doc_excerpts[doc_id]) < 3:
            doc_excerpts[doc_id].append(r)

    for doc_id, excerpts in doc_excerpts.items():
        file_name = excerpts[0]["file_name"] if excerpts else "Unknown"
        excerpt_texts = [e["text"] for e in excerpts]
        reference_excerpts.append({
            "doc_id": doc_id,
            "file_name": file_name,
            "excerpts": excerpt_texts,
        })

    default_sections = [
        "Introduction", "Background", "Scope", "Methodology",
        "Deliverables", "Timeline", "Conclusion",
    ]
    sections = draft_request.sections or default_sections
    ref_doc_names = [r["file_name"] for r in reference_excerpts]

    async def stream_draft():
        full_draft = []
        async for token in generate_draft_stream(
            instruction=draft_request.instruction,
            reference_excerpts=reference_excerpts,
            sections=sections,
            style_guidance=draft_request.style_guidance,
        ):
            full_draft.append(token)
            yield f"event: chunk\ndata: {json.dumps({'text': token})}\n\n"

        complete_draft = "".join(full_draft)
        parsed = parse_markdown_sections(complete_draft)
        yield f"event: metadata\ndata: {json.dumps({'sections': parsed, 'reference_docs': ref_doc_names})}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(stream_draft(), media_type="text/event-stream")
