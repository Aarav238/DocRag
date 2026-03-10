from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from pydantic import BaseModel
import aiofiles
import os
import uuid
from datetime import datetime

from app.core.config import get_settings
from app.core.database import get_db
from app.models.document import DocumentStatus
from app.services.ingestion import process_document
from app.services.uploadthing import upload_file_to_uploadthing, delete_file_from_uploadthing

router = APIRouter()
settings = get_settings()


class RegisterDocumentRequest(BaseModel):
    """Request to register a document uploaded to UploadThing."""
    file_name: str
    file_url: str
    file_type: str
    file_size: int


# MIME types for file downloads
MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "doc": "application/msword",
}


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Upload a document for processing and indexing."""
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.allowed_extensions}",
        )

    content = await file.read()
    file_size = len(content)

    if file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB",
        )

    content_type = MIME_TYPES.get(file_ext, "application/octet-stream")
    file_url = await upload_file_to_uploadthing(content, file.filename, content_type)

    file_path = None
    if not file_url:
        file_path = os.path.join(settings.upload_dir, f"{file.filename}")
        base_path = file_path
        counter = 1
        while os.path.exists(file_path):
            name, ext = os.path.splitext(base_path)
            file_path = f"{name}_{counter}{ext}"
            counter += 1

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

    now = datetime.utcnow()
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "file_name": file.filename,
        "file_path": file_path,
        "file_url": file_url,
        "file_type": file_ext,
        "file_size": file_size,
        "status": DocumentStatus.UPLOADED,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.documents.insert_one(doc)

    background_tasks.add_task(process_document, doc_id)

    return {
        "doc_id": doc_id,
        "file_name": file.filename,
        "status": DocumentStatus.UPLOADED,
        "message": "Document uploaded successfully. Processing started.",
    }


@router.post("/register")
async def register_document(
    request: RegisterDocumentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Register a document that was uploaded to UploadThing."""
    file_ext = request.file_type.lower()
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.allowed_extensions}",
        )

    if request.file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB",
        )

    now = datetime.utcnow()
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "file_name": request.file_name,
        "file_path": None,
        "file_url": request.file_url,
        "file_type": file_ext,
        "file_size": request.file_size,
        "status": DocumentStatus.UPLOADED,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.documents.insert_one(doc)

    background_tasks.add_task(process_document, doc_id)

    return {
        "doc_id": doc_id,
        "file_name": request.file_name,
        "status": DocumentStatus.UPLOADED,
        "message": "Document registered successfully. Processing started.",
    }


@router.get("/{doc_id}")
async def get_document(doc_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get document details and status."""
    doc = await db.documents.find_one({"_id": doc_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "doc_id": doc["_id"],
        "file_name": doc["file_name"],
        "file_type": doc["file_type"],
        "file_size": doc["file_size"],
        "status": doc["status"],
        "error_message": doc.get("error_message"),
        "created_at": doc["created_at"].isoformat(),
        "updated_at": doc["updated_at"].isoformat(),
    }


@router.get("")
async def list_documents(
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all documents."""
    query = {}

    if status:
        try:
            status_enum = DocumentStatus(status)
            query["status"] = status_enum
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    cursor = db.documents.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=None)

    return {
        "documents": [
            {
                "doc_id": doc["_id"],
                "file_name": doc["file_name"],
                "file_type": doc["file_type"],
                "status": doc["status"],
                "created_at": doc["created_at"].isoformat(),
            }
            for doc in docs
        ]
    }


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete a document and its associated data."""
    from app.main import app
    from app.services.vector_store import VectorStore

    doc = await db.documents.find_one({"_id": doc_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete vectors from Pinecone
    vector_store: VectorStore = app.state.vector_store
    if vector_store.is_initialized:
        try:
            await vector_store.delete_by_doc_id(doc_id)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to delete vectors for {doc_id}: {e}")

    # Delete file from UploadThing
    if doc.get("file_url"):
        try:
            await delete_file_from_uploadthing(doc["file_url"])
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to delete file from UploadThing for {doc_id}: {e}")

    # Delete local file
    if doc.get("file_path") and os.path.exists(doc["file_path"]):
        try:
            os.remove(doc["file_path"])
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to delete file {doc['file_path']}: {e}")

    # Delete document and related data from MongoDB
    await db.chunks.delete_many({"document_id": doc_id})
    await db.document_pages.delete_many({"document_id": doc_id})
    await db.documents.delete_one({"_id": doc_id})

    return {"message": "Document deleted successfully"}


@router.get("/{doc_id}/download")
async def download_document(doc_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Download the original document file."""
    doc = await db.documents.find_one({"_id": doc_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.get("file_url"):
        return RedirectResponse(url=doc["file_url"], status_code=302)

    if not doc.get("file_path") or not os.path.exists(doc["file_path"]):
        raise HTTPException(status_code=404, detail="Original file not available.")

    mime_type = MIME_TYPES.get(doc["file_type"], "application/octet-stream")

    return FileResponse(
        path=doc["file_path"],
        filename=doc["file_name"],
        media_type=mime_type,
    )


@router.get("/{doc_id}/view")
async def view_document(doc_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get document for inline viewing (PDF only)."""
    doc = await db.documents.find_one({"_id": doc_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.get("file_url"):
        return RedirectResponse(url=doc["file_url"], status_code=302)

    if not doc.get("file_path") or not os.path.exists(doc["file_path"]):
        raise HTTPException(status_code=404, detail="Original file not available.")

    mime_type = MIME_TYPES.get(doc["file_type"], "application/octet-stream")

    return FileResponse(
        path=doc["file_path"],
        filename=doc["file_name"],
        media_type=mime_type,
        headers={"Content-Disposition": f"inline; filename={doc['file_name']}"},
    )
