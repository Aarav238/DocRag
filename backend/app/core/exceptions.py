from fastapi import HTTPException
from typing import Optional


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(self, message: str, status_code: int = 500, details: Optional[dict] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class DocumentNotFoundError(AppException):
    """Raised when a document is not found."""

    def __init__(self, doc_id: str):
        super().__init__(
            message=f"Document not found: {doc_id}",
            status_code=404,
            details={"doc_id": doc_id},
        )


class DocumentProcessingError(AppException):
    """Raised when document processing fails."""

    def __init__(self, doc_id: str, reason: str):
        super().__init__(
            message=f"Failed to process document: {reason}",
            status_code=500,
            details={"doc_id": doc_id, "reason": reason},
        )


class EmbeddingError(AppException):
    """Raised when embedding generation fails."""

    def __init__(self, reason: str):
        super().__init__(
            message=f"Failed to generate embedding: {reason}",
            status_code=503,
            details={"reason": reason},
        )


class VectorStoreError(AppException):
    """Raised when vector store operations fail."""

    def __init__(self, operation: str, reason: str):
        super().__init__(
            message=f"Vector store {operation} failed: {reason}",
            status_code=503,
            details={"operation": operation, "reason": reason},
        )


class LLMError(AppException):
    """Raised when LLM operations fail."""

    def __init__(self, operation: str, reason: str):
        super().__init__(
            message=f"LLM {operation} failed: {reason}",
            status_code=503,
            details={"operation": operation, "reason": reason},
        )


class FileTooLargeError(AppException):
    """Raised when uploaded file exceeds size limit."""

    def __init__(self, file_size: int, max_size: int):
        super().__init__(
            message=f"File too large: {file_size} bytes (max: {max_size} bytes)",
            status_code=400,
            details={"file_size": file_size, "max_size": max_size},
        )


class UnsupportedFileTypeError(AppException):
    """Raised when file type is not supported."""

    def __init__(self, file_type: str, allowed_types: set):
        super().__init__(
            message=f"Unsupported file type: {file_type}",
            status_code=400,
            details={"file_type": file_type, "allowed_types": list(allowed_types)},
        )


def to_http_exception(exc: AppException) -> HTTPException:
    """Convert AppException to FastAPI HTTPException."""
    return HTTPException(
        status_code=exc.status_code,
        detail={"message": exc.message, **exc.details},
    )
