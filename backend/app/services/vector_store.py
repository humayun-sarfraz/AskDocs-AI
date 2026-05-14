from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from app.config import CHROMA_DB_PATH, TOP_K_RESULTS, SIMILARITY_THRESHOLD

COLLECTION_NAME = "document_chunks"

_client = None


def _get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_DB_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_collection():
    client = _get_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(chunks: List[Dict], embeddings: List[List[float]]):
    """Add document chunks with embeddings to the vector store."""
    collection = get_collection()
    collection.add(
        ids=[c["chunk_id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[c["metadata"] for c in chunks],
    )


def query_chunks(
    query_embedding: List[float],
    document_ids: Optional[List[str]] = None,
    top_k: int = TOP_K_RESULTS,
) -> List[Dict]:
    """Query the vector store for relevant chunks."""
    collection = get_collection()

    where_filter = None
    if document_ids:
        if len(document_ids) == 1:
            where_filter = {"document_id": document_ids[0]}
        else:
            where_filter = {"document_id": {"$in": document_ids}}

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    if results and results["ids"] and results["ids"][0]:
        for i, chunk_id in enumerate(results["ids"][0]):
            distance = results["distances"][0][i]
            # Cosine distance: lower = more similar. Convert to similarity.
            similarity = 1 - distance
            if similarity < SIMILARITY_THRESHOLD:
                continue
            chunks.append({
                "chunk_id": chunk_id,
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "similarity": similarity,
            })

    return chunks


def delete_document_chunks(document_id: str):
    """Delete all chunks for a document from the vector store."""
    collection = get_collection()
    try:
        existing = collection.get(where={"document_id": document_id})
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass
