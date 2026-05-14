from pathlib import Path
from typing import List, Dict


def extract_text_from_pdf(file_path: str) -> List[Dict]:
    """Extract text from PDF, returning list of {page, text} dicts."""
    import fitz  # pymupdf

    pages = []
    doc = fitz.open(file_path)
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        if text.strip():
            pages.append({"page": page_num, "text": text.strip()})
    doc.close()
    return pages


def extract_text_from_docx(file_path: str) -> List[Dict]:
    """Extract text from DOCX file."""
    from docx import Document

    doc = Document(file_path)
    full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    if not full_text.strip():
        return []
    return [{"page": None, "text": full_text}]


def extract_text_from_txt(file_path: str) -> List[Dict]:
    """Extract text from plain text file."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    if not content.strip():
        return []
    return [{"page": None, "text": content.strip()}]


def extract_text(file_path: str) -> List[Dict]:
    """Extract text from a document based on its extension."""
    ext = Path(file_path).suffix.lower()
    extractors = {
        ".pdf": extract_text_from_pdf,
        ".docx": extract_text_from_docx,
        ".txt": extract_text_from_txt,
    }
    extractor = extractors.get(ext)
    if not extractor:
        raise ValueError(f"Unsupported file type: {ext}")

    pages = extractor(file_path)
    if not pages:
        raise ValueError("Document contains no extractable text.")
    return pages
