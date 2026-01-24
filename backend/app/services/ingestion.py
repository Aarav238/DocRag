from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import asyncio
import os
import tempfile
import httpx
from datetime import datetime

from app.core.database import AsyncSessionLocal
from app.models.document import Document, DocumentPage, Chunk, DocumentStatus
from app.services.extractor import TextExtractor
from app.services.chunker import TextChunker
from app.services.embedding import get_embeddings_batch
from app.services.vector_store import VectorStore
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def download_file_from_url(url: str, file_ext: str) -> str:
    """Download a file from URL to a temporary location."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()

        # Create temp file with proper extension
        fd, temp_path = tempfile.mkstemp(suffix=f".{file_ext}")
        try:
            with os.fdopen(fd, 'wb') as f:
                f.write(response.content)
        except Exception:
            os.close(fd)
            raise

        return temp_path


async def process_document(doc_id: str):
    """
    Background task to process a document:
    1. Extract text
    2. Create chunks
    3. Generate embeddings
    4. Store in vector DB
    """
    temp_file_path = None  # Track temp file for cleanup

    async with AsyncSessionLocal() as db:
        try:
            # Get document
            result = await db.execute(select(Document).where(Document.id == doc_id))
            doc = result.scalar_one_or_none()

            if not doc:
                logger.error(f"Document {doc_id} not found")
                return

            logger.info(f"Processing document: {doc.file_name}")

            # Determine file path - download from URL if needed
            if doc.file_url:
                # File is in UploadThing - download to temp location
                logger.info(f"Downloading file from UploadThing: {doc.file_url}")
                temp_file_path = await download_file_from_url(doc.file_url, doc.file_type)
                file_path = temp_file_path
            else:
                # Legacy local file
                file_path = doc.file_path

            # Step 1: Extract text
            await update_status(db, doc.id, DocumentStatus.EXTRACTING)
            extractor = TextExtractor()
            pages = await extractor.extract(file_path, doc.file_type)

            if not pages:
                raise ValueError("No text could be extracted from document")

            # Save pages to database
            for page_data in pages:
                page = DocumentPage(
                    document_id=doc.id,
                    page_number=page_data["page_number"],
                    raw_text=page_data["text"],
                )
                db.add(page)

            await db.commit()
            logger.info(f"Extracted {len(pages)} pages from {doc.file_name}")

            # Step 2: Chunk text
            await update_status(db, doc.id, DocumentStatus.CHUNKING)
            chunker = TextChunker()
            chunks = chunker.chunk_pages(pages)

            if not chunks:
                raise ValueError("No chunks could be created from document")

            # Save chunks to database
            chunk_records = []
            for i, chunk_data in enumerate(chunks):
                chunk = Chunk(
                    document_id=doc.id,
                    chunk_index=i,
                    text=chunk_data["text"],
                    token_count=chunk_data["token_count"],
                    page_start=chunk_data["page_start"],
                    page_end=chunk_data["page_end"],
                )
                db.add(chunk)
                chunk_records.append(chunk)

            await db.commit()
            logger.info(f"Created {len(chunks)} chunks from {doc.file_name}")

            # Refresh to get IDs
            for chunk in chunk_records:
                await db.refresh(chunk)

            # Step 3: Generate embeddings
            await update_status(db, doc.id, DocumentStatus.EMBEDDING)
            texts = [c.text for c in chunk_records]
            embeddings = await get_embeddings_batch(texts)

            logger.info(f"Generated {len(embeddings)} embeddings for {doc.file_name}")

            # Step 4: Store in vector DB
            # Get vector store from running app
            from app.main import app
            vector_store: VectorStore = app.state.vector_store

            metadata_list = [
                {
                    "chunk_id": chunk.id,
                    "doc_id": doc.id,
                    "file_name": doc.file_name,
                    "text": chunk.text,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                }
                for chunk in chunk_records
            ]

            await vector_store.add_vectors(embeddings, metadata_list)

            # Mark as indexed
            await update_status(db, doc.id, DocumentStatus.INDEXED)
            logger.info(f"Successfully indexed document: {doc.file_name}")

        except Exception as e:
            logger.error(f"Error processing document {doc_id}: {e}")
            async with AsyncSessionLocal() as error_db:
                await error_db.execute(
                    update(Document)
                    .where(Document.id == doc_id)
                    .values(
                        status=DocumentStatus.FAILED,
                        error_message=str(e),
                        updated_at=datetime.utcnow()
                    )
                )
                await error_db.commit()

        finally:
            # Clean up temp file if we downloaded from URL
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                    logger.info(f"Cleaned up temp file: {temp_file_path}")
                except Exception as e:
                    logger.warning(f"Failed to clean up temp file {temp_file_path}: {e}")


async def update_status(db: AsyncSession, doc_id: str, status: DocumentStatus):
    """Update document status using explicit UPDATE statement."""
    await db.execute(
        update(Document)
        .where(Document.id == doc_id)
        .values(status=status, updated_at=datetime.utcnow())
    )
    await db.commit()
