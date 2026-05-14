from typing import List
from openai import OpenAI
from app.config import OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts using OpenAI."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set.")

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.embeddings.create(
        model=OPENAI_EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


def get_query_embedding(text: str) -> List[float]:
    """Generate embedding for a single query text."""
    return get_embeddings([text])[0]
