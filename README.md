# DocRAG - Document Analysis with RAG

A full-stack RAG (Retrieval-Augmented Generation) application for document analysis, featuring semantic search, Q&A with citations, and AI-powered draft generation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐            │
│  │  Upload  │  │  Search  │  │   Chat   │  │  Draft Generator │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘            │
└───────┼─────────────┼─────────────┼─────────────────┼───────────────────────┘
        │             │             │                 │
        ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  /documents/*   │  │   /search       │  │  /qa          /draft/*     │ │
│  │  Upload, List   │  │   Semantic      │  │  Q&A with     Generate     │ │
│  │  Delete, Status │  │   Search        │  │  Citations    Documents    │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────────────┘ │
│           │                    │                      │                     │
│  ┌────────▼────────────────────▼──────────────────────▼──────────────────┐ │
│  │                        SERVICE LAYER                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │Extractor │  │ Chunker  │  │Embedding │  │ Pinecone │  │   LLM   │ │ │
│  │  │PDF/DOCX  │  │Token-base│  │ +Cache   │  │  Vector  │  │ Service │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
        │                                                    │
        ▼                                                    ▼
┌───────────────────┐                              ┌───────────────────┐
│   SQLite DB       │                              │  Pinecone Cloud   │
│   - Documents     │                              │   - Embeddings    │
│   - Pages         │                              │   - Metadata      │
│   - Chunks        │                              │   - Serverless    │
└───────────────────┘                              └───────────────────┘
                                    │
                                    ▼
                          ┌───────────────────┐
                          │    OpenAI API     │
                          │  - Embeddings     │
                          │  - Chat (GPT-4o)  │
                          └───────────────────┘
```

## Features

### Document Upload & Processing
- **File Support**: PDF and DOCX files up to 50MB
- **Text Extraction**: Intelligent extraction preserving page numbers
- **Chunking**: Token-based chunking (600 tokens, 100 overlap) for optimal retrieval
- **Background Processing**: Non-blocking async ingestion pipeline

### Semantic Search
- **Vector Search**: Pinecone-powered similarity search
- **Document Filtering**: Search within specific documents
- **Deduplication**: Automatic removal of near-duplicate results
- **Relevance Scoring**: Similarity scores with each result

### Q&A with Citations
- **Context-Aware Answers**: Responses grounded in document content
- **Source Citations**: Every answer includes document + page references
- **Confidence Levels**: High/medium/low confidence indicators
- **Multi-Document Q&A**: Query across multiple documents simultaneously

### AI Draft Generator
- **Reference-Based Generation**: Create documents based on your materials
- **Structured Output**: Customizable section templates
- **Style Guidance**: Control tone and formatting
- **No Hallucination**: Content strictly based on provided references

## Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- SQLAlchemy + SQLite (async)
- Pinecone (vector storage - serverless)
- OpenAI API (embeddings + chat)
- pdfplumber, python-docx (extraction)
- tiktoken (tokenization)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── documents.py  # Upload, list, delete
│   │   │   ├── search.py     # Semantic search
│   │   │   ├── qa.py         # Q&A endpoint
│   │   │   └── draft.py      # Draft generator
│   │   ├── core/             # Core utilities
│   │   │   ├── config.py     # Environment config
│   │   │   ├── database.py   # DB setup
│   │   │   ├── cache.py      # TTL caching
│   │   │   ├── logging.py    # Logging & metrics
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── models/           # SQLAlchemy models
│   │   │   └── document.py   # Document, Page, Chunk
│   │   ├── services/         # Business logic
│   │   │   ├── extractor.py  # Text extraction
│   │   │   ├── chunker.py    # Text chunking
│   │   │   ├── embedding.py  # OpenAI embeddings
│   │   │   ├── vector_store.py # Pinecone operations
│   │   │   ├── ingestion.py  # Background processing
│   │   │   └── llm.py        # OpenAI chat
│   │   └── main.py           # FastAPI app
│   ├── storage/              # File storage
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/              # API client
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   └── App.tsx           # Root component
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key
- Pinecone API key (free tier available at https://www.pinecone.io)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and PINECONE_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend runs at http://localhost:5173 and proxies API requests to the backend.

## API Endpoints

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload a document |
| GET | `/documents` | List all documents |
| GET | `/documents/{id}` | Get document status |
| DELETE | `/documents/{id}` | Delete a document |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=...` | Semantic search |

### Q&A
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/qa` | Ask a question |

### Draft Generator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/draft/generate` | Generate a document draft |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Performance metrics |

## Ingestion Pipeline

```
Upload File
    │
    ▼
┌─────────────────┐
│ Validate File   │  Check type (pdf/docx), size (<50MB)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to Disk    │  Store in /storage/uploads/{doc_id}.{ext}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create DB Record│  doc_id, file_name, status=UPLOADED
└────────┬────────┘
         │
         ▼ (Background Task)
┌─────────────────┐
│ Extract Text    │  pdfplumber (PDF) / python-docx (DOCX)
│ status=EXTRACTING│  Preserves page numbers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Chunk Text      │  Token-based: 600 tokens, 100 overlap
│ status=CHUNKING │  Sentence-boundary aware
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │  OpenAI text-embedding-3-small
│ Embeddings      │  Batched, with retry & caching
│ status=EMBEDDING│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store Vectors   │  Pinecone serverless (cosine similarity)
│ status=INDEXED  │  Metadata: doc_id, file_name, page_range
└─────────────────┘
```

## Retrieval Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Embed Query     │  Same model as document embeddings
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vector Search   │  Pinecone similarity search (top-k)
│ + Filter        │  Optional: filter by doc_ids
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deduplicate     │  Remove near-duplicate chunks
│ & Rank          │  Sort by similarity score
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build Context   │  Combine chunks with metadata
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ LLM Generation  │  GPT-4o-mini with system prompt
│ + Citations     │  Enforce source attribution
└─────────────────┘
```

## Prompt Design

### Q&A System Prompt
```
You are a document analysis assistant. Answer questions accurately
based ONLY on the provided context from the user's documents.

RULES:
1. Only use information from the provided context
2. If the answer cannot be found, clearly state that
3. Always cite sources with document name and page number
4. Be concise but thorough
5. Indicate confidence level when unsure
```

### Draft Generator Prompt
```
You are a professional document drafting assistant. Create well-structured,
professional documents based on instructions and reference materials.

RULES:
1. Follow the exact structure and sections requested
2. Use reference documents for style, tone, and content
3. Do NOT hallucinate facts - only verifiable information
4. Maintain consistent professional tone
5. Use Markdown formatting with ## headers
```

## Limitations

- **File Size**: Maximum 50MB per document
- **File Types**: Only PDF and DOCX supported
- **Concurrent Processing**: Single document at a time per upload
- **Context Window**: Limited by OpenAI model context length
- **Pinecone Metadata**: Text stored in metadata is truncated to 1000 chars

## Future Improvements

- [ ] Support for more file types (TXT, MD, HTML)
- [ ] Streaming responses for long generations
- [ ] Document comparison feature
- [ ] User authentication
- [ ] Rate limiting and quotas
- [ ] Celery for distributed background tasks
- [ ] OCR support for scanned PDFs
- [ ] Hybrid search (keyword + semantic)

## License

MIT
