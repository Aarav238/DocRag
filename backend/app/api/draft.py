from fastapi import APIRouter, Depends, Request, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.embedding import get_embedding
from app.services.vector_store import VectorStore
from app.services.llm import generate_draft

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
):
    """Generate a document draft based on reference documents."""
    vector_store: VectorStore = request.app.state.vector_store

    if not vector_store.is_initialized:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    if not draft_request.reference_doc_ids:
        raise HTTPException(status_code=400, detail="At least one reference document is required")

    # Get representative chunks from each reference document
    reference_excerpts = []

    # Embed the instruction to find most relevant chunks
    instruction_embedding = await get_embedding(draft_request.instruction)

    # Search across reference documents
    results = await vector_store.search(
        query_embedding=instruction_embedding,
        top_k=10,
        doc_ids=draft_request.reference_doc_ids,
    )

    # Group results by document
    doc_excerpts = {}
    for r in results:
        doc_id = r["doc_id"]
        if doc_id not in doc_excerpts:
            doc_excerpts[doc_id] = []
        if len(doc_excerpts[doc_id]) < 3:  # Max 3 excerpts per doc
            doc_excerpts[doc_id].append(r)

    # Build reference context
    for doc_id, excerpts in doc_excerpts.items():
        file_name = excerpts[0]["file_name"] if excerpts else "Unknown"
        excerpt_texts = [e["text"] for e in excerpts]
        reference_excerpts.append({
            "doc_id": doc_id,
            "file_name": file_name,
            "excerpts": excerpt_texts,
        })

    # Default sections if not provided
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

    # Generate draft
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
