import logging
import sys
import time
from contextlib import contextmanager
from typing import Generator

# Configure logging format
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(debug: bool = False) -> None:
    """Configure application logging."""
    level = logging.DEBUG if debug else logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("faiss").setLevel(logging.WARNING)


@contextmanager
def log_timing(operation: str, logger: logging.Logger) -> Generator[None, None, None]:
    """Context manager to log operation timing."""
    start = time.perf_counter()
    logger.info(f"Starting: {operation}")
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f"Completed: {operation} ({elapsed:.2f}s)")


class OperationMetrics:
    """Track and log operation metrics."""

    def __init__(self):
        self.metrics: dict[str, list[float]] = {}

    def record(self, operation: str, duration: float):
        if operation not in self.metrics:
            self.metrics[operation] = []
        self.metrics[operation].append(duration)

    def get_stats(self, operation: str) -> dict:
        if operation not in self.metrics or not self.metrics[operation]:
            return {}

        values = self.metrics[operation]
        return {
            "count": len(values),
            "total": sum(values),
            "avg": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
        }

    def get_all_stats(self) -> dict:
        return {op: self.get_stats(op) for op in self.metrics}


# Global metrics instance
metrics = OperationMetrics()
