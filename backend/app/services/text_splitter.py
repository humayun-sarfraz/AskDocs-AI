from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def split_text(pages: List[Dict], document_id: str, filename: str) -> List[Dict]:
    """Split extracted page texts into chunks with metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    chunk_index = 0

    for page_data in pages:
        page_text = page_data["text"]
        page_num = page_data.get("page")

        split_texts = splitter.split_text(page_text)
        for text in split_texts:
            chunks.append({
                "chunk_id": f"{document_id}_chunk_{chunk_index}",
                "text": text,
                "metadata": {
                    "document_id": document_id,
                    "filename": filename,
                    "page": page_num,
                    "chunk_index": chunk_index,
                },
            })
            chunk_index += 1

    return chunks
