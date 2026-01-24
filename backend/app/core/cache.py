from functools import lru_cache
from typing import Any, Optional
import hashlib
import json
import time
from collections import OrderedDict
import threading


class TTLCache:
    """Simple in-memory cache with TTL expiration."""

    def __init__(self, max_size: int = 1000, ttl_seconds: int = 3600):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict[str, tuple[Any, float]] = OrderedDict()
        self.lock = threading.Lock()

    def _make_key(self, *args, **kwargs) -> str:
        """Create a cache key from arguments."""
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
        return hashlib.sha256(key_data.encode()).hexdigest()[:16]

    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache if not expired."""
        with self.lock:
            if key not in self.cache:
                return None

            value, expiry = self.cache[key]
            if time.time() > expiry:
                del self.cache[key]
                return None

            # Move to end (LRU)
            self.cache.move_to_end(key)
            return value

    def set(self, key: str, value: Any) -> None:
        """Set a value in cache with TTL."""
        with self.lock:
            expiry = time.time() + self.ttl_seconds
            self.cache[key] = (value, expiry)
            self.cache.move_to_end(key)

            # Evict oldest if over max size
            while len(self.cache) > self.max_size:
                self.cache.popitem(last=False)

    def clear(self) -> None:
        """Clear all cached values."""
        with self.lock:
            self.cache.clear()

    def cleanup_expired(self) -> int:
        """Remove expired entries. Returns count removed."""
        removed = 0
        with self.lock:
            now = time.time()
            keys_to_remove = [
                k for k, (_, expiry) in self.cache.items() if now > expiry
            ]
            for key in keys_to_remove:
                del self.cache[key]
                removed += 1
        return removed


# Global cache for embeddings
embedding_cache = TTLCache(max_size=5000, ttl_seconds=86400)  # 24 hour TTL

# Global cache for search results
search_cache = TTLCache(max_size=1000, ttl_seconds=300)  # 5 minute TTL
