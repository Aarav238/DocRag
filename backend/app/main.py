from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from app.core.config import get_settings, ensure_directories
from app.core.database import init_db
from app.core.logging import setup_logging, metrics
from app.core.exceptions import AppException, to_http_exception
from app.core.cache import embedding_cache, search_cache
from app.api import documents, search, qa, draft

settings = get_settings()
setup_logging(settings.debug)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Document RAG API...")
    ensure_directories()
    await init_db()

    from app.services.vector_store import VectorStore
    vector_store = VectorStore()
    await vector_store.initialize()
    app.state.vector_store = vector_store

    logger.info("Application ready")
    yield

    logger.info("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="RAG-powered document analysis API with semantic search, Q&A, and draft generation",
    version="1.0.0",
    lifespan=lifespan,
)


# Exception handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, **exc.details},
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start

    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} ({duration:.3f}s)"
    )
    metrics.record(f"http_{request.method.lower()}", duration)

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(qa.router, prefix="/qa", tags=["Q&A"])
app.include_router(draft.router, prefix="/draft", tags=["Draft Generator"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "vector_store_initialized": app.state.vector_store.is_initialized,
    }


@app.get("/metrics")
async def get_metrics():
    """Get application metrics."""
    return {
        "operations": metrics.get_all_stats(),
        "cache": {
            "embedding_cache_size": len(embedding_cache.cache),
            "search_cache_size": len(search_cache.cache),
        },
        "vector_store": {
            "total_vectors": app.state.vector_store.total_vectors,
        },
    }


@app.get("/")
async def root():
    return {
        "message": "Document RAG API",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics",
    }
