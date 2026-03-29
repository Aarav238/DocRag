# DocRAG - Document Analysis with RAG

A full-stack RAG (Retrieval-Augmented Generation) application for document analysis, featuring semantic search, Q&A with citations, and AI-powered draft generation.

**Full project documentation** (architecture, repo layout, APIs, configuration, operations): [DOCUMENTATION.md](./DOCUMENTATION.md).

## System Architecture

```
                              ┌──────────────────────┐
                              │   Clerk (hosted)     │
                              │  Sign-in / Sign-up   │
                              │  Session JWT (OAuth) │
                              └──────────┬───────────┘
                                         │
┌────────────────────────────────────────┼────────────────────────────────────┐
│                     FRONTEND (React + Vite + Clerk React)                     │
│  ClerkProvider · Protected routes · getToken() → Authorization: Bearer JWT  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐              │
│  │  Upload  │  │  Search  │  │   Chat   │  │  Draft Generator │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘              │
└───────┼─────────────┼─────────────┼─────────────────┼────────────────────────┘
        │             │             │                 │
        │  HTTPS + Bearer session JWT on every API call (except public pages) │
        ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Auth: verify JWT (JWKS from Clerk) → upsert user in MongoDB → scope data ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │  /documents/*   │  │   /search       │  │  /qa          /draft/*      │   │
│  │  /users/me      │  │                 │  │                             │   │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────────────┘   │
│           │                    │                      │                       │
│  ┌────────▼────────────────────▼──────────────────────▼──────────────────┐  │
│  │                        SERVICE LAYER                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐     │  │
│  │  │Extractor │  │ Chunker  │  │Embedding │  │ Pinecone │  │   LLM   │     │  │
│  │  │PDF/DOCX  │  │Token-base│  │ +Cache   │  │  Vector  │  │ Service │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  Optional: POST /webhooks/clerk (Svix) → sync users from Clerk events        │
└─────────────────────────────────────────────────────────────────────────────┘
        │                                                    │
        ▼                                                    ▼
┌───────────────────┐                              ┌───────────────────┐
│   MongoDB         │                              │  Pinecone Cloud   │
│   DB: docRag      │                              │   - Embeddings    │
│   - users         │                              │   - Metadata      │
│   - documents     │                              │   - Serverless    │
│   - document_pages│                              │                   │
│   - chunks        │                              │                   │
└───────────────────┘                              └───────────────────┘
                                    │
                                    ▼
                          ┌───────────────────┐
                          │    OpenAI API     │
                          │  - Embeddings     │
                          │  - Chat (GPT-4o)  │
                          └───────────────────┘
```

### How authentication works

**Division of responsibility**

| Layer | Responsibility |
|--------|------------------|
| **Clerk** | Identity: accounts, OAuth/social, passwords, MFA, session **JWTs**. Clerk does **not** store your app’s documents. |
| **This backend** | Trust: validates JWTs against Clerk’s **JWKS**, creates/updates rows in **`users`**, enforces **`user_id`** on every document and on search/QA/draft. |
| **MongoDB** | Source of truth for **app users** (`users`) and **ownership** (`documents.user_id`). |

**End-to-end request flow (signed-in user)**

1. The user authenticates in the browser with **Clerk** (`@clerk/clerk-react`: `ClerkProvider`, sign-in/up pages, session).
2. Before calling the API, the frontend attaches the Clerk **session token** using `useAuth().getToken()` (wired through `ClerkTokenBridge` → `api/client.ts`).
3. Each request to protected routes includes `Authorization: Bearer <session_jwt>`.
4. The backend uses **PyJWT**’s `PyJWKClient` to fetch Clerk’s **JWKS** from `CLERK_JWKS_URL` (HTTPS; **certifi** is used for the TLS trust store so JWKS fetch works reliably on macOS and in containers).
5. The JWT signature and **`iss`** (issuer, `CLERK_ISSUER`) are verified. The **`sub`** claim is the **Clerk user id** (`user_…`).
6. **`get_current_user`** upserts a document in the **`users`** collection (internal `_id`, `clerk_user_id`, email/name when available). Optional **`CLERK_SECRET_KEY`** lets the server call Clerk’s Backend API to enrich profile fields.
7. All **documents**, **search**, **QA**, and **draft** operations are scoped to that internal **`user_id`**. Users cannot access another user’s documents or vectors by ID guessing.

**Optional: Clerk webhooks**

- Configure an endpoint URL pointing to **`POST /webhooks/clerk`** and set **`CLERK_WEBHOOK_SECRET`** (Svix signing secret).
- Subscribe to **`user.created`**, **`user.updated`**, **`user.deleted`** so MongoDB **`users`** stays aligned when accounts change outside an API call (e.g. admin deletes a user in Clerk).

**Public vs protected**

- **Public (no JWT):** e.g. `GET /health`, `GET /` API root.
- **Protected (Bearer required):** ` /documents/*`, `/search`, `/qa`, `/draft/*`, `GET /users/me`. Unauthenticated requests receive **401**.

**Environment variables (auth)**

See **`frontend/.env.example`** (`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`) and **`backend/.env.example`** (`CLERK_JWKS_URL`, `CLERK_ISSUER`, optional `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`).

### Example walkthrough (concrete story)

Imagine **Alex** opening the app for the first time and uploading a contract PDF.

**1 — Sign up and session (Clerk, in the browser)**

- Alex visits `/sign-up`, creates an account (email/password or Google). **Clerk** stores the identity and issues a **session**.
- The React app wraps the tree in **`ClerkProvider`**. For protected pages, **`ClerkTokenBridge`** calls `useAuth().getToken()` so your **`api/client`** can attach a **short-lived session JWT** to backend calls.

**2 — First API call: “who am I?”**

- Alex navigates to `/upload`. The frontend calls e.g. `GET /api/documents` (via `VITE_BACKEND_URL=/api` and the Vite proxy).
- The request looks like:  
  `Authorization: Bearer eyJhbGciOiJSUzI1NiIs...` (session JWT from Clerk).
- The backend **`verify_clerk_session_token`** pulls the signing keys from **`CLERK_JWKS_URL`**, checks the signature and **`iss`** (`CLERK_ISSUER`), and reads **`sub`** — e.g. `user_2abcXYZ` (Clerk user id).
- **`upsert_user_from_clerk`** writes or updates **`users`**:  
  `{ _id: "7f3e…", clerk_user_id: "user_2abcXYZ", email: "alex@company.com", … }`.  
  That internal **`7f3e…`** is **`UserContext.id`** for this request.

**3 — Upload a document**

- Alex `POST /documents/upload` with the same `Authorization` header and a PDF file.
- The new **`documents`** row includes **`user_id: "7f3e…"`**. Ingestion runs in the background; vectors in Pinecone still reference **`doc_id`**, but every API query is filtered to documents that belong to **`7f3e…`** only.

**4 — Search**

- Alex runs semantic search. The backend resolves **allowed `doc_id`s** = all **indexed** documents where **`user_id === "7f3e…"`**, then calls Pinecone with that filter. Another user’s document IDs are never included, even if someone guessed a UUID.

**5 — Optional: Clerk webhook (parallel path)**

- If you configured **`POST /webhooks/clerk`**, when Alex’s account was created Clerk may have sent **`user.created`**. Your handler upserts the same **`users`** row (email, name). That complements step 2; the first login still works if the webhook arrived late or is disabled.

**Sequence (high level)**

```mermaid
sequenceDiagram
  participant Alex as Browser (Alex)
  participant Clerk as Clerk
  participant FE as React app
  participant API as FastAPI
  participant DB as MongoDB

  Alex->>Clerk: Sign up / Sign in
  Clerk-->>Alex: Session + cookies (Clerk-managed)
  Alex->>FE: Open /upload
  FE->>Clerk: getToken() (session JWT)
  Clerk-->>FE: JWT string
  FE->>API: GET /documents (Authorization Bearer JWT)
  API->>API: Verify JWT with JWKS, read sub
  API->>DB: upsert users by clerk_user_id
  API->>DB: find documents where user_id = internal id
  API-->>FE: JSON (only Alex's docs)
```

## Features

### Document Upload & Processing
- **File Support**: PDF and DOCX files up to 50MB
- **Text Extraction**: Intelligent extraction preserving page numbers
- **Chunking**: Token-based chunking for optimal retrieval
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
- **Clerk** session JWT verification (JWKS + issuer), optional webhooks (Svix)
- MongoDB (database: `docRag`) via Motor (async driver)
- Pinecone (vector storage - serverless)
- OpenAI API (embeddings + chat)
- pdfplumber, python-docx (extraction)
- tiktoken (tokenization)

**Frontend:**
- React 19 + TypeScript
- **Clerk** (`@clerk/clerk-react`) — auth UI, session, tokens for API calls
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── documents.py  # Upload, list, delete (Bearer)
│   │   │   ├── search.py     # Semantic search (Bearer)
│   │   │   ├── qa.py         # Q&A endpoint (Bearer)
│   │   │   ├── draft.py      # Draft generator (Bearer)
│   │   │   ├── users.py      # GET /users/me (Bearer)
│   │   │   └── webhooks.py   # POST /webhooks/clerk (Svix)
│   │   ├── core/             # Core utilities
│   │   │   ├── auth.py       # Clerk JWT verify, UserContext, user upsert
│   │   │   ├── config.py     # Environment config
│   │   │   ├── database.py   # DB setup
│   │   │   ├── cache.py      # TTL caching
│   │   │   ├── logging.py    # Logging & metrics
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── models/           # Data models
│   │   │   └── document.py   # DocumentStatus enum
│   │   ├── services/         # Business logic
│   │   │   ├── user_documents.py  # Per-user doc id filtering
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
│   ├── components/       # Reusable components (Layout, ProtectedRoute, ClerkTokenBridge, auth shell)
│   ├── pages/            # Page components (incl. SignInPage, SignUpPage)
│   └── App.tsx           # Root component
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB instance (local or cloud e.g. MongoDB Atlas)
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
# Edit .env and set:
#   OPENAI_API_KEY=...
#   PINECONE_API_KEY=...
#   MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
#   CLERK_JWKS_URL=...  CLERK_ISSUER=...  (see backend/.env.example)

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (copy from .env.example)
#   VITE_CLERK_PUBLISHABLE_KEY=pk_...
#   VITE_BACKEND_URL=/api

# Run development server
npm run dev
```

The frontend runs at http://localhost:5173 and proxies API requests to the backend (`/api` → FastAPI). Sign-in and sign-up use Clerk; the app sends the session JWT to the backend for protected routes.

## API Endpoints

Unless noted, **protected** endpoints require a valid Clerk session JWT: `Authorization: Bearer <token>`.

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Bearer | Current user from MongoDB (after JWT verification) |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents/upload` | Bearer | Upload a document (scoped to user) |
| GET | `/documents` | Bearer | List documents for the current user |
| GET | `/documents/{id}` | Bearer | Get document status |
| GET | `/documents/{id}/view` | Bearer | Inline view (e.g. PDF) |
| GET | `/documents/{id}/download` | Bearer | Download original file |
| DELETE | `/documents/{id}` | Bearer | Delete a document |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=...` | Bearer | Semantic search (user’s indexed docs only) |

### Q&A
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/qa` | Bearer | Ask a question |

### Draft Generator
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/draft/generate` | Bearer | Generate a document draft |

### Webhooks (Clerk)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/webhooks/clerk` | Svix signature (`CLERK_WEBHOOK_SECRET`) | Sync `users` from Clerk events |

### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/metrics` | — | Performance metrics |

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

## Database — MongoDB

The backend uses **MongoDB** (database name: `docRag`) via the **Motor** async driver.

### Collections

**`users`** (application profile, keyed by Clerk)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string (UUID) | Internal user id (referenced as `user_id` on documents) |
| `clerk_user_id` | string | Clerk user id (`user_…`), unique |
| `email`, `first_name`, `last_name`, `image_url` | optional | Synced from Clerk API and/or webhooks |
| `created_at`, `updated_at` | datetime | |
| `deleted_at` | datetime \| null | Set on `user.deleted` webhook |

**`documents`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string (UUID) | Document ID |
| `user_id` | string | Owner: references `users._id` |
| `file_name` | string | Original filename |
| `file_path` | string \| null | Local path (fallback storage) |
| `file_url` | string \| null | UploadThing cloud URL |
| `file_type` | string | `pdf` or `docx` |
| `file_size` | int | Size in bytes |
| `status` | string | `uploaded` → `extracting` → `chunking` → `embedding` → `indexed` \| `failed` |
| `error_message` | string \| null | Set on failure |
| `created_at` | datetime | |
| `updated_at` | datetime | Updated on every status change |

**`document_pages`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string (UUID) | Page ID |
| `document_id` | string | Reference to `documents._id` |
| `page_number` | int | Page number |
| `raw_text` | string | Extracted page text |
| `created_at` | datetime | |

**`chunks`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string (UUID) | Chunk ID |
| `document_id` | string | Reference to `documents._id` |
| `chunk_index` | int | Sequential index within document |
| `text` | string | Chunk text |
| `token_count` | int | OpenAI token count |
| `page_start` | int \| null | Starting page |
| `page_end` | int \| null | Ending page |
| `created_at` | datetime | |

### Indexes

Created automatically on startup:
- `users.clerk_user_id` (unique)
- `documents.user_id`
- `documents.created_at`, `documents.status`
- `document_pages.document_id`
- `chunks.document_id`

### Environment Variable

```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
```

The database name `docRag` is hardcoded in `app/core/database.py`.

---

## Limitations

- **File Size**: Maximum 50MB per document
- **File Types**: Only PDF and DOCX supported
- **Concurrent Processing**: Single document at a time per upload
- **Context Window**: Limited by OpenAI model context length
- **Pinecone Metadata**: Text stored in metadata is truncated to 1000 chars


## License

MIT
