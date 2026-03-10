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

    # UploadThing (Cloud Storage)
    uploadthing_token: str = ""  # Optional - if not set, files are stored locally

    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"

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
