from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import aiofiles
import os
from pathlib import Path

from app.core.config import get_settings
from app.core.database import get_db
from app.models.document import Document, DocumentStatus
from app.services.ingestion import process_document

router = APIRouter()
settings = get_settings()


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document for processing and indexing."""
    # Validate file extension
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.allowed_extensions}",
        )

    # Read file content to check size
    content = await file.read()
    file_size = len(content)

    if file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB",
        )

    # Create document record
    doc = Document(
        file_name=file.filename,
        file_path="",  # Will be updated after saving
        file_type=file_ext,
        file_size=file_size,
        status=DocumentStatus.UPLOADED,
    )
    db.add(doc)
    await db.flush()

    # Save file to disk
    file_path = os.path.join(settings.upload_dir, f"{doc.id}.{file_ext}")
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Update document with file path
    doc.file_path = file_path
    await db.commit()
    await db.refresh(doc)

    # Trigger background processing
    background_tasks.add_task(process_document, doc.id)

    return {
        "doc_id": doc.id,
        "file_name": doc.file_name,
        "status": doc.status.value,
        "message": "Document uploaded successfully. Processing started.",
    }


@router.get("/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Get document details and status."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "doc_id": doc.id,
        "file_name": doc.file_name,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "status": doc.status.value,
        "error_message": doc.error_message,
        "created_at": doc.created_at.isoformat(),
        "updated_at": doc.updated_at.isoformat(),
    }


@router.get("")
async def list_documents(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all documents."""
    query = select(Document).order_by(Document.created_at.desc())

    if status:
        try:
            status_enum = DocumentStatus(status)
            query = query.where(Document.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    result = await db.execute(query)
    docs = result.scalars().all()

    return {
        "documents": [
            {
                "doc_id": doc.id,
                "file_name": doc.file_name,
                "file_type": doc.file_type,
                "status": doc.status.value,
                "created_at": doc.created_at.isoformat(),
            }
            for doc in docs
        ]
    }


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and its associated data."""
    from app.main import app
    from app.services.vector_store import VectorStore

    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete vectors from Pinecone
    vector_store: VectorStore = app.state.vector_store
    if vector_store.is_initialized:
        try:
            await vector_store.delete_by_doc_id(doc_id)
        except Exception as e:
            # Log but don't fail the deletion
            import logging
            logging.getLogger(__name__).warning(f"Failed to delete vectors for {doc_id}: {e}")

    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    # Delete from database (cascades to chunks and pages)
    await db.delete(doc)
    await db.commit()

    return {"message": "Document deleted successfully"}
