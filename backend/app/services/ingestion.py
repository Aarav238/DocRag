from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import asyncio
import os
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


async def process_document(doc_id: str):
    """
    Background task to process a document:
    1. Extract text
    2. Create chunks
    3. Generate embeddings
    4. Store in vector DB
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get document
            result = await db.execute(select(Document).where(Document.id == doc_id))
            doc = result.scalar_one_or_none()

            if not doc:
                logger.error(f"Document {doc_id} not found")
                return

            logger.info(f"Processing document: {doc.file_name}")

            # Step 1: Extract text
            await update_status(db, doc.id, DocumentStatus.EXTRACTING)
            extractor = TextExtractor()
            pages = await extractor.extract(doc.file_path, doc.file_type)

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

            # Clean up: Delete the file after successful processing
            # (Embeddings are stored in Pinecone, metadata in PostgreSQL)
            if doc.file_path and os.path.exists(doc.file_path):
                try:
                    os.remove(doc.file_path)
                    logger.info(f"Cleaned up file: {doc.file_path}")
                except Exception as cleanup_error:
                    # Don't fail if cleanup fails - the important data is already saved
                    logger.warning(f"Failed to clean up file {doc.file_path}: {cleanup_error}")

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


async def update_status(db: AsyncSession, doc_id: str, status: DocumentStatus):
    """Update document status using explicit UPDATE statement."""
    await db.execute(
        update(Document)
        .where(Document.id == doc_id)
        .values(status=status, updated_at=datetime.utcnow())
    )
    await db.commit()
