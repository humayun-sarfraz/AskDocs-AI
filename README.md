<div align="center">

# AskDocs AI

### AI-Powered Document Q&A System

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=flat&logo=openai&logoColor=white)](https://openai.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Upload documents. Ask questions. Get accurate, source-grounded answers.

[Getting Started](#getting-started) · [API Docs](#api-endpoints) · [Architecture](#architecture) · [Contributing](#contributing)

</div>

---

## Overview

AskDocs AI is a full-stack Retrieval-Augmented Generation (RAG) application that lets you upload documents and ask natural-language questions. The system answers **only from your uploaded documents** — no hallucination, no guessing — with source references you can verify.

### How It Works

```
Upload Document → Extract Text → Chunk → Embed → Store in Vector DB
                                                         ↓
Ask Question → Embed Query → Semantic Search → Retrieve Chunks → LLM Answer + Sources
```

## Features

| Feature | Description |
|---------|-------------|
| **Document Upload** | Drag-and-drop PDF, DOCX, TXT files with progress tracking |
| **Smart Chunking** | Recursive text splitting with metadata preservation |
| **Semantic Search** | Vector similarity search via ChromaDB |
| **Grounded Answers** | LLM responses based strictly on document context |
| **Source Citations** | Every answer includes references with page numbers and snippets |
| **Fallback Safety** | Returns honest "not found" when documents don't contain the answer |
| **Chat History** | Persistent conversations with full message history |
| **Document Management** | Upload, list, select, and delete documents |
| **Dark UI** | Clean, responsive dark-themed interface |

## Screenshots

<details>
<summary>Click to view screenshots</summary>

> Screenshots coming soon — run the app locally to see the UI.

</details>

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│          Vite · TypeScript · Lucide Icons            │
├─────────────────────────────────────────────────────┤
│                        API                          │
├─────────────────────────────────────────────────────┤
│                  Backend (FastAPI)                   │
│                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │ Document  │  │    RAG    │  │  Chat History    │ │
│  │ Pipeline  │  │ Pipeline  │  │  (SQLite)        │ │
│  │          │  │           │  │                  │ │
│  │ Extract  │  │ Embed Q   │  └──────────────────┘ │
│  │ Chunk    │  │ Search    │                        │
│  │ Embed    │  │ Generate  │  ┌──────────────────┐ │
│  │ Store    │  │ Cite      │  │  Vector Store    │ │
│  └──────────┘  └───────────┘  │  (ChromaDB)      │ │
│                               └──────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │            OpenAI API                        │   │
│  │    Embeddings (text-embedding-3-small)       │   │
│  │    Chat (gpt-4o-mini)                        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic |
| **LLM & Embeddings** | OpenAI API (gpt-4o-mini, text-embedding-3-small) |
| **Vector Database** | ChromaDB (swappable — Pinecone/FAISS ready) |
| **Text Processing** | LangChain text splitters, PyMuPDF, python-docx |
| **Frontend** | React 18, TypeScript, Vite, Lucide Icons |
| **Database** | SQLite (metadata & chat history) |
| **Containerization** | Docker, Docker Compose |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 1. Clone the repository

```bash
git clone https://github.com/humayun-sarfraz/AskDocs-AI.git
cd AskDocs-AI
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 3. Run locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### Run with Docker

```bash
cp .env.example .env
# Add your OPENAI_API_KEY to .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

## API Endpoints

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload a document (PDF, DOCX, TXT) |
| `GET` | `/api/documents` | List all uploaded documents |
| `GET` | `/api/documents/{id}` | Get document details |
| `DELETE` | `/api/documents/{id}` | Delete a document and its chunks |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/query` | Ask a question about documents |
| `GET` | `/api/chat/conversations` | List all conversations |
| `GET` | `/api/chat/conversations/{id}` | Get conversation with messages |
| `DELETE` | `/api/chat/conversations/{id}` | Delete a conversation |

### Example: Ask a Question

**Request:**
```json
POST /api/chat/query
{
  "question": "What is the refund policy?",
  "document_ids": ["optional-doc-id"],
  "conversation_id": "optional-conv-id"
}
```

**Response:**
```json
{
  "answer": "According to the policy document, refunds are processed within 14 business days...",
  "sources": [
    {
      "document_id": "abc-123",
      "filename": "policy.pdf",
      "page": 3,
      "chunk_id": "abc-123_chunk_5",
      "snippet": "Refunds are processed within 14 business days of the request..."
    }
  ],
  "conversation_id": "conv-456"
}
```

## Project Structure

```
AskDocs-AI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration & environment variables
│   │   ├── database.py          # SQLite setup
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── routes/              # API endpoint handlers
│   │   └── services/            # Core business logic
│   │       ├── document_loader.py   # PDF/DOCX/TXT text extraction
│   │       ├── text_splitter.py     # Recursive chunking
│   │       ├── embeddings.py        # OpenAI embedding generation
│   │       ├── vector_store.py      # ChromaDB operations
│   │       ├── rag_pipeline.py      # Full RAG orchestration
│   │       └── llm.py              # LLM answer generation
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application layout
│   │   ├── components/          # React UI components
│   │   └── lib/api.ts           # Backend API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Known Limitations

- Single-user MVP (no authentication)
- No streaming responses
- Local file storage only
- SQLite (not suited for high concurrency)
- No OCR for scanned PDFs
- ChromaDB only (vector store is swappable by design)

## Roadmap

- [ ] User authentication & multi-tenant isolation
- [ ] Streaming responses (SSE)
- [ ] Cloud storage (S3, GCS)
- [ ] Pinecone / Weaviate / FAISS support
- [ ] OCR for scanned PDFs
- [ ] Citation highlighting in source documents
- [ ] Admin dashboard
- [ ] Role-based access control
- [ ] Export chat history

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built by <a href="https://github.com/humayun-sarfraz">Humayun Sarfraz</a>
</div>
