from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Optional
import logging
import asyncio

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorStore:
    """Pinecone-based vector store for document chunks."""

    def __init__(self):
        self.pc: Optional[Pinecone] = None
        self.index = None
        self.is_initialized = False

    async def initialize(self):
        """Initialize or connect to the Pinecone index."""
        def _init_sync():
            self.pc = Pinecone(api_key=settings.pinecone_api_key)

            # Check if index exists using has_index
            if not self.pc.has_index(settings.pinecone_index_name):
                logger.info(f"Creating Pinecone index: {settings.pinecone_index_name}")
                self.pc.create_index(
                    name=settings.pinecone_index_name,
                    dimension=settings.vector_dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )

            self.index = self.pc.Index(settings.pinecone_index_name)

        await asyncio.to_thread(_init_sync)
        self.is_initialized = True

        # Get index stats
        stats = await self._get_stats()
        logger.info(f"Pinecone index initialized with {stats.get('total_vector_count', 0)} vectors")

    async def _get_stats(self) -> dict:
        """Get index statistics."""
        def _stats_sync():
            return self.index.describe_index_stats()

        stats = await asyncio.to_thread(_stats_sync)
        return stats.to_dict() if hasattr(stats, 'to_dict') else dict(stats)

    async def add_vectors(
        self,
        embeddings: List[List[float]],
        metadata_list: List[Dict],
    ) -> List[str]:
        """Add vectors with metadata to the store."""
        if not self.is_initialized:
            raise RuntimeError("Vector store not initialized")

        # Prepare vectors for upsert
        vectors = []
        ids = []
        for embedding, meta in zip(embeddings, metadata_list):
            vec_id = meta["chunk_id"]
            ids.append(vec_id)

            # Pinecone metadata must be flat and values must be strings, numbers, booleans, or lists of strings
            flat_meta = {
                "chunk_id": meta["chunk_id"],
                "doc_id": meta["doc_id"],
                "file_name": meta["file_name"],
                "text": meta["text"][:1000],  # Pinecone has metadata size limits
                "page_start": meta.get("page_start") or 0,
                "page_end": meta.get("page_end") or 0,
            }

            vectors.append({
                "id": vec_id,
                "values": embedding,
                "metadata": flat_meta,
            })

        # Upsert in batches of 100
        def _upsert_sync():
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)

        await asyncio.to_thread(_upsert_sync)

        logger.info(f"Added {len(embeddings)} vectors to Pinecone")
        return ids

    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        doc_ids: Optional[List[str]] = None,
    ) -> List[Dict]:
        """Search for similar vectors."""
        if not self.is_initialized:
            raise RuntimeError("Vector store not initialized")

        # Build filter if doc_ids provided
        filter_dict = None
        if doc_ids:
            filter_dict = {"doc_id": {"$in": doc_ids}}

        def _search_sync():
            return self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict,
            )

        response = await asyncio.to_thread(_search_sync)

        # Build results
        results = []
        for match in response.matches:
            meta = match.metadata or {}
            results.append({
                "chunk_id": meta.get("chunk_id"),
                "doc_id": meta.get("doc_id"),
                "file_name": meta.get("file_name"),
                "text": meta.get("text"),
                "page_start": meta.get("page_start") if meta.get("page_start") != 0 else None,
                "page_end": meta.get("page_end") if meta.get("page_end") != 0 else None,
                "score": match.score,
            })

        return results

    async def delete_by_doc_id(self, doc_id: str):
        """Delete all vectors for a document."""
        if not self.is_initialized:
            raise RuntimeError("Vector store not initialized")

        def _delete_sync():
            # Pinecone serverless supports delete by metadata filter
            self.index.delete(filter={"doc_id": {"$eq": doc_id}})

        await asyncio.to_thread(_delete_sync)
        logger.info(f"Deleted vectors for doc_id: {doc_id}")

    @property
    def total_vectors(self) -> int:
        """Get total number of vectors in the index."""
        if not self.is_initialized or not self.index:
            return 0
        try:
            stats = self.index.describe_index_stats()
            return stats.total_vector_count
        except Exception:
            return 0
