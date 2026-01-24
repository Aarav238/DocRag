from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
from typing import List


class Settings(BaseSettings):
    # Application
    app_name: str = "Document RAG API"
    debug: bool = False
    
    # CORS - comma-separated list of allowed origins
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # OpenAI
    openai_api_key: str
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4o-mini"

    # Pinecone Vector DB
    pinecone_api_key: str
    pinecone_index_name: str = "docrag"
    vector_dimension: int = 1536

    # File Storage
    upload_dir: str = "./storage/uploads"
    max_file_size_mb: int = 50
    allowed_extensions: set = {"pdf", "docx"}

    # Database
    # Read from DATABASE_URL or database_url in .env file
    # If not set, defaults to SQLite for local development
    database_url: str = ""
    
    def get_database_url(self) -> str:
        """Get database URL, defaulting to SQLite if not provided."""
        import os
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Check for DATABASE_URL environment variable first (standard name, used by Render)
        env_db_url = os.getenv("DATABASE_URL")
        if env_db_url and env_db_url.strip():
            # Render provides postgres:// but SQLAlchemy needs postgresql+asyncpg://
            if env_db_url.startswith("postgres://"):
                env_db_url = env_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif env_db_url.startswith("postgresql://") and "+asyncpg" not in env_db_url:
                env_db_url = env_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            logger.info(f"Using DATABASE_URL from environment: {env_db_url[:50]}...")
            return env_db_url
        
        # Use database_url from .env file (read by Pydantic Settings)
        # Only use it if it's not empty and starts with a valid database protocol
        if self.database_url and self.database_url.strip():
            db_url = self.database_url.strip()
            
            # Validate that it's a proper database URL
            valid_prefixes = ("postgres://", "postgresql://", "sqlite://", "sqlite+aiosqlite://")
            if not any(db_url.startswith(prefix) for prefix in valid_prefixes):
                logger.warning(f"Invalid database_url format in .env, falling back to SQLite. URL: {db_url[:50]}...")
                return "sqlite+aiosqlite:///./storage/app.db"
            
            # Convert postgres:// to postgresql+asyncpg:// if needed
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
                db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            logger.info(f"Using database_url from .env: {db_url[:50]}...")
            return db_url
        
        # Default to SQLite for local development
        logger.info("No database URL configured, using SQLite for local development")
        return "sqlite+aiosqlite:///./storage/app.db"

    # Chunking
    chunk_size_tokens: int = 600
    chunk_overlap_tokens: int = 100

    # Search
    default_top_k: int = 5
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def ensure_directories():
    """Ensure required directories exist."""
    settings = get_settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
