from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Optional
import asyncio
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


async def _embed_single_batch(batch: List[str], batch_num: int, total_batches: int) -> List[List[float]]:
    """Embed a single batch with retry logic."""
    logger.info(f"Embedding batch {batch_num}/{total_batches} ({len(batch)} texts)")
    for attempt in range(3):
        try:
            start = time.perf_counter()
            response = await client.embeddings.create(
                model=settings.openai_embedding_model,
                input=batch,
            )
            duration = time.perf_counter() - start
            metrics.record("embedding_batch", duration)

            batch_embeddings = [item.embedding for item in response.data]

            # Cache individual embeddings
            for text, emb in zip(batch, batch_embeddings):
                embedding_cache.set(_hash_text(text), emb)

            return batch_embeddings
        except Exception as e:
            if attempt == 2:
                raise
            wait_time = 2 ** (attempt + 1)
            logger.warning(f"Embedding batch {batch_num} failed (attempt {attempt + 1}), retrying in {wait_time}s: {e}")
            await asyncio.sleep(wait_time)
    return []  # unreachable but satisfies type checker


async def get_embeddings_batch(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """Get embeddings for multiple texts in batches.

    Optimizations:
    - Skips texts that are already cached (avoids redundant API calls)
    - Processes up to 3 batches concurrently for faster throughput
    """
    start_total = time.perf_counter()

    # Check cache first — separate cached vs uncached texts
    results: List[Optional[List[float]]] = [None] * len(texts)
    uncached_indices: List[int] = []
    uncached_texts: List[str] = []

    for i, text in enumerate(texts):
        cached = embedding_cache.get(_hash_text(text))
        if cached is not None:
            results[i] = cached
        else:
            uncached_indices.append(i)
            uncached_texts.append(text)

    cache_hits = len(texts) - len(uncached_texts)
    if cache_hits > 0:
        logger.info(f"Embedding cache: {cache_hits}/{len(texts)} texts already cached, {len(uncached_texts)} to embed")

    if uncached_texts:
        # Build batches from uncached texts only
        batches = []
        for i in range(0, len(uncached_texts), batch_size):
            batches.append(uncached_texts[i:i + batch_size])

        total_batches = len(batches)

        # Process batches with limited concurrency (max 3 concurrent API calls)
        max_concurrent = min(3, total_batches)
        semaphore = asyncio.Semaphore(max_concurrent)

        async def embed_with_semaphore(batch, batch_num):
            async with semaphore:
                return await _embed_single_batch(batch, batch_num, total_batches)

        tasks = [
            embed_with_semaphore(batch, i + 1)
            for i, batch in enumerate(batches)
        ]
        batch_results = await asyncio.gather(*tasks)

        # Map results back to original positions
        uncached_embeddings = []
        for batch_embs in batch_results:
            uncached_embeddings.extend(batch_embs)

        for idx, emb in zip(uncached_indices, uncached_embeddings):
            results[idx] = emb

    total_duration = time.perf_counter() - start_total
    logger.info(f"Embedded {len(texts)} texts in {total_duration:.2f}s ({cache_hits} cached, {len(uncached_texts)} new)")

    return results
