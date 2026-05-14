from typing import Optional, List, Dict
from app.services.embeddings import get_query_embedding
from app.services.vector_store import query_chunks
from app.services.llm import generate_answer

FALLBACK_RESPONSE = "I could not find that information in the uploaded documents."


def ask_question(
    question: str,
    document_ids: Optional[List[str]] = None,
) -> Dict:
    """Full RAG pipeline: embed query, retrieve chunks, generate answer."""
    query_embedding = get_query_embedding(question)

    relevant_chunks = query_chunks(query_embedding, document_ids=document_ids)

    if not relevant_chunks:
        return {
            "answer": FALLBACK_RESPONSE,
            "sources": [],
            "chunks_used": 0,
        }

    answer = generate_answer(question, relevant_chunks)

    sources = []
    for chunk in relevant_chunks:
        meta = chunk["metadata"]
        sources.append({
            "document_id": meta.get("document_id", ""),
            "filename": meta.get("filename", ""),
            "page": meta.get("page"),
            "chunk_id": chunk["chunk_id"],
            "snippet": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
            "similarity": round(chunk["similarity"], 4),
        })

    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(relevant_chunks),
    }
