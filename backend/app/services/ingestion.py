import logging
import os
import tempfile
import uuid
import httpx
from datetime import datetime

from app.core.database import get_database
from app.models.document import DocumentStatus
from app.services.extractor import TextExtractor
from app.services.chunker import TextChunker
from app.services.embedding import get_embeddings_batch

logger = logging.getLogger(__name__)


async def download_file_from_url(url: str, file_ext: str) -> str:
    """Download a file from URL to a temporary location."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()

        fd, temp_path = tempfile.mkstemp(suffix=f".{file_ext}")
        try:
            with os.fdopen(fd, 'wb') as f:
                f.write(response.content)
        except Exception:
            os.close(fd)
            raise

        return temp_path


async def update_status(db, doc_id: str, status: DocumentStatus):
    """Update document status in MongoDB."""
    await db.documents.update_one(
        {"_id": doc_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
    )


async def process_document(doc_id: str):
    """
    Background task to process a document:
    1. Extract text
    2. Create chunks
    3. Generate embeddings
    4. Store in vector DB
    """
    temp_file_path = None
    db = get_database()

    try:
        doc = await db.documents.find_one({"_id": doc_id})

        if not doc:
            logger.error(f"Document {doc_id} not found")
            return

        logger.info(f"Processing document: {doc['file_name']}")

        # Determine file path - download from URL if needed
        if doc.get("file_url"):
            logger.info(f"Downloading file from UploadThing: {doc['file_url']}")
            temp_file_path = await download_file_from_url(doc["file_url"], doc["file_type"])
            file_path = temp_file_path
        else:
            file_path = doc.get("file_path")

        # Step 1: Extract text
        await update_status(db, doc_id, DocumentStatus.EXTRACTING)
        extractor = TextExtractor()
        pages = await extractor.extract(file_path, doc["file_type"])

        if not pages:
            raise ValueError("No text could be extracted from document")

        # Save pages to MongoDB
        page_docs = [
            {
                "_id": str(uuid.uuid4()),
                "document_id": doc_id,
                "page_number": page_data["page_number"],
                "raw_text": page_data["text"],
                "created_at": datetime.utcnow(),
            }
            for page_data in pages
        ]
        await db.document_pages.insert_many(page_docs)
        logger.info(f"Extracted {len(pages)} pages from {doc['file_name']}")

        # Step 2: Chunk text
        await update_status(db, doc_id, DocumentStatus.CHUNKING)
        chunker = TextChunker()
        chunks = chunker.chunk_pages(pages)

        if not chunks:
            raise ValueError("No chunks could be created from document")

        # Save chunks to MongoDB
        now = datetime.utcnow()
        chunk_docs = [
            {
                "_id": str(uuid.uuid4()),
                "document_id": doc_id,
                "chunk_index": i,
                "text": chunk_data["text"],
                "token_count": chunk_data["token_count"],
                "page_start": chunk_data["page_start"],
                "page_end": chunk_data["page_end"],
                "created_at": now,
            }
            for i, chunk_data in enumerate(chunks)
        ]
        await db.chunks.insert_many(chunk_docs)
        logger.info(f"Created {len(chunks)} chunks from {doc['file_name']}")

        # Step 3: Generate embeddings
        await update_status(db, doc_id, DocumentStatus.EMBEDDING)
        texts = [c["text"] for c in chunk_docs]
        embeddings = await get_embeddings_batch(texts)
        logger.info(f"Generated {len(embeddings)} embeddings for {doc['file_name']}")

        # Step 4: Store in vector DB
        from app.main import app
        from app.services.vector_store import VectorStore
        vector_store: VectorStore = app.state.vector_store

        metadata_list = [
            {
                "chunk_id": chunk["_id"],
                "doc_id": doc_id,
                "file_name": doc["file_name"],
                "text": chunk["text"],
                "page_start": chunk["page_start"],
                "page_end": chunk["page_end"],
            }
            for chunk in chunk_docs
        ]

        await vector_store.add_vectors(embeddings, metadata_list)

        await update_status(db, doc_id, DocumentStatus.INDEXED)
        logger.info(f"Successfully indexed document: {doc['file_name']}")

    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {e}")
        await db.documents.update_one(
            {"_id": doc_id},
            {
                "$set": {
                    "status": DocumentStatus.FAILED,
                    "error_message": str(e),
                    "updated_at": datetime.utcnow(),
                }
            },
        )

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Cleaned up temp file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file_path}: {e}")
