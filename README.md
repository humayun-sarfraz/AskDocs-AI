# AskDocs AI

AI-Powered Document Q&A System using Retrieval-Augmented Generation.

Upload PDF, DOCX, or TXT documents and ask natural-language questions. The system answers **only from your uploaded documents** with source references, fallback behavior, and chat history.

## Features

- Document upload with text extraction (PDF, DOCX, TXT)
- Automatic chunking and embedding generation
- Vector similarity search via ChromaDB
- Source-grounded answers using OpenAI GPT
- Source references with snippets for each answer
- Fallback response when answer is not found
- Chat history with conversation management
- Document management (upload, list, delete)
- Dark-themed responsive UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| LLM/Embeddings | OpenAI API |
| Vector Database | ChromaDB |
| Text Processing | LangChain text splitters, PyMuPDF, python-docx |
| Frontend | React, TypeScript, Vite |
| Database | SQLite |
| Containerization | Docker, Docker Compose |

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key

### Environment Variables

Copy `.env.example` to `.env` and set your API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CHROMA_DB_PATH=./chroma
UPLOAD_DIR=./storage/uploads
DATABASE_URL=sqlite:///./rag_assistant.db
```

### Run Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Run with Docker

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete a document |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/query` | Ask a question |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/{id}` | Get conversation with messages |
| DELETE | `/api/chat/conversations/{id}` | Delete a conversation |

### Query Request

```json
{
  "question": "What is the refund policy?",
  "document_ids": ["optional-doc-id"],
  "conversation_id": "optional-conv-id"
}
```

### Query Response

```json
{
  "answer": "According to the policy document...",
  "sources": [
    {
      "document_id": "...",
      "filename": "policy.pdf",
      "page": 3,
      "chunk_id": "...",
      "snippet": "Refunds are processed within..."
    }
  ],
  "conversation_id": "..."
}
```

## Known Limitations

- No user authentication (single-user MVP)
- No streaming responses
- Local file storage only
- SQLite not suitable for high concurrency
- No OCR for scanned PDFs
- ChromaDB only (no Pinecone/FAISS yet)

## Future Improvements

- User authentication and multi-tenant isolation
- Cloud storage (S3, GCS) for documents
- Pinecone / Weaviate / FAISS support
- Streaming responses (SSE)
- OCR for scanned PDFs
- Citation highlighting in source documents
- Admin dashboard
- Role-based access control
- Batch document upload with progress tracking
- Export chat history
