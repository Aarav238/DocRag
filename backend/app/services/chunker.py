import tiktoken
from typing import List, Dict, Tuple
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class TextChunker:
    """Chunk text into smaller pieces for embedding."""

    def __init__(
        self,
        chunk_size: int = None,
        chunk_overlap: int = None,
        model: str = "cl100k_base",
    ):
        self.chunk_size = chunk_size or settings.chunk_size_tokens
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap_tokens
        self.encoding = tiktoken.get_encoding(model)

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in text."""
        return len(self.encoding.encode(text))

    def chunk_pages(self, pages: List[Dict]) -> List[Dict]:
        """
        Chunk document pages into smaller pieces.

        Args:
            pages: List of dicts with 'page_number' and 'text' keys.

        Returns:
            List of chunks with 'text', 'token_count', 'page_start', 'page_end' keys.
        """
        # Combine all pages with page markers
        combined_text = ""
        page_positions = []  # (position, page_number)

        for page in pages:
            start_pos = len(combined_text)
            if combined_text:
                combined_text += "\n\n"
            combined_text += page["text"]
            page_positions.append((start_pos, page["page_number"]))

        # Split into chunks
        chunks = self._split_text(combined_text)

        if not chunks:
            logger.warning("No chunks created from text")
            return []

        # Assign page ranges to chunks
        result = []
        current_pos = 0  # Track position to handle overlapping chunks correctly

        for chunk_text, token_count in chunks:
            # Find this chunk's position starting from current_pos to handle overlaps
            chunk_start = combined_text.find(chunk_text, current_pos)
            if chunk_start == -1:
                # Fallback: search from beginning
                chunk_start = combined_text.find(chunk_text)

            if chunk_start == -1:
                # Chunk not found in text, skip
                logger.warning(f"Chunk not found in combined text, skipping")
                continue

            chunk_end = chunk_start + len(chunk_text)
            current_pos = chunk_start + 1  # Move past this position for next search

            # Find page range
            page_start = None
            page_end = None

            for i, (pos, page_num) in enumerate(page_positions):
                next_pos = page_positions[i + 1][0] if i + 1 < len(page_positions) else len(combined_text)

                # Check if chunk overlaps with this page
                if chunk_start < next_pos and chunk_end > pos:
                    if page_start is None:
                        page_start = page_num
                    page_end = page_num

            result.append({
                "text": chunk_text,
                "token_count": token_count,
                "page_start": page_start,
                "page_end": page_end,
            })

        logger.info(f"Created {len(result)} chunks from {len(pages)} pages")
        return result

    def _split_text(self, text: str) -> List[Tuple[str, int]]:
        """Split text into chunks by tokens with overlap."""
        if not text or not text.strip():
            return []

        tokens = self.encoding.encode(text)

        if not tokens:
            return []

        if len(tokens) <= self.chunk_size:
            return [(text.strip(), len(tokens))]

        chunks = []
        start = 0
        min_advance = max(1, self.chunk_size // 4)  # Ensure we always advance by at least 25% of chunk size

        while start < len(tokens):
            end = min(start + self.chunk_size, len(tokens))

            # Try to find a good break point
            chunk_tokens = tokens[start:end]
            chunk_text = self.encoding.decode(chunk_tokens)
            original_chunk_len = len(chunk_tokens)

            # Try to break at paragraph or sentence boundary (only if not at the end)
            if end < len(tokens):
                # Look for paragraph break
                last_para = chunk_text.rfind("\n\n")
                if last_para > len(chunk_text) * 0.5:
                    chunk_text = chunk_text[:last_para]
                    chunk_tokens = self.encoding.encode(chunk_text)
                else:
                    # Look for sentence break
                    for sep in [". ", ".\n", "! ", "? "]:
                        last_sep = chunk_text.rfind(sep)
                        if last_sep > len(chunk_text) * 0.7:
                            chunk_text = chunk_text[:last_sep + 1]
                            chunk_tokens = self.encoding.encode(chunk_text)
                            break

            token_count = len(chunk_tokens)
            stripped_text = chunk_text.strip()

            if stripped_text:  # Only add non-empty chunks
                chunks.append((stripped_text, token_count))

            # Calculate advance: tokens consumed minus overlap, but ensure minimum advance
            advance = max(min_advance, token_count - self.chunk_overlap)
            start = start + advance

            # Safety check to prevent infinite loop
            if advance == 0:
                logger.warning("Zero advance detected in chunker, forcing advance")
                start += min_advance

        logger.debug(f"Split text into {len(chunks)} chunks")
        return chunks
