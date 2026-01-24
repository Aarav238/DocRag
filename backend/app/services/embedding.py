from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List
import logging
import hashlib
import time

from app.core.config import get_settings
from app.core.cache import embedding_cache
from app.core.logging import metrics

logger = logging.getLogger(__name__)
settings = get_settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)


def _hash_text(text: str) -> str:
    """Create a hash key for caching."""
    return hashlib.sha256(text.encode()).hexdigest()[:16]


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def get_embedding(text: str, use_cache: bool = True) -> List[float]:
    """Get embedding for a single text with caching."""
    cache_key = _hash_text(text)

    # Check cache
    if use_cache:
        cached = embedding_cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for embedding")
            return cached

    start = time.perf_counter()
    response = await client.embeddings.create(
        model=settings.openai_embedding_model,
        input=text,
    )
    duration = time.perf_counter() - start
    metrics.record("embedding_single", duration)

    embedding = response.data[0].embedding

    # Store in cache
    if use_cache:
        embedding_cache.set(cache_key, embedding)

    return embedding


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def get_embeddings_batch(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """Get embeddings for multiple texts in batches."""
    all_embeddings = []
    total_batches = (len(texts) - 1) // batch_size + 1

    start_total = time.perf_counter()

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_num = i // batch_size + 1
        logger.info(f"Embedding batch {batch_num}/{total_batches} ({len(batch)} texts)")

        start = time.perf_counter()
        response = await client.embeddings.create(
            model=settings.openai_embedding_model,
            input=batch,
        )
        duration = time.perf_counter() - start
        metrics.record("embedding_batch", duration)

        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

        # Cache individual embeddings
        for text, emb in zip(batch, batch_embeddings):
            embedding_cache.set(_hash_text(text), emb)

    total_duration = time.perf_counter() - start_total
    logger.info(f"Embedded {len(texts)} texts in {total_duration:.2f}s")

    return all_embeddings
