from openai import OpenAI
from app.config import OPENAI_API_KEY, OPENAI_CHAT_MODEL

SYSTEM_PROMPT = """You are a document question-answering assistant. Answer the user's question using only the provided document context. Do not use outside knowledge. If the answer is not clearly available in the context, say: 'I could not find that information in the uploaded documents.' Always cite the sources used by referencing the filename and page number when available. Be concise, accurate, and factual."""


def generate_answer(question: str, context_chunks: list[dict]) -> str:
    """Generate an answer using the LLM with retrieved context."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set.")

    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        meta = chunk["metadata"]
        source_label = meta.get("filename", "Unknown")
        page = meta.get("page")
        if page:
            source_label += f", page {page}"
        context_parts.append(f"[Source {i}: {source_label}]\n{chunk['text']}")

    context_text = "\n\n---\n\n".join(context_parts)

    user_message = f"""Document Context:
{context_text}

Question: {question}

Answer the question based only on the document context above. Cite sources by their filename and page number."""

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=OPENAI_CHAT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
        max_tokens=1500,
    )

    return response.choices[0].message.content
