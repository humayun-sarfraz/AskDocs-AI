import uuid
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.document import Document
from app.schemas import DocumentResponse
from app.utils.file_utils import sanitize_filename, validate_file, get_file_type
from app.config import UPLOAD_DIR
from app.services.document_loader import extract_text
from app.services.text_splitter import split_text
from app.services.embeddings import get_embeddings
from app.services.vector_store import add_chunks, delete_document_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])


def process_document(document_id: str, file_path: str, filename: str, db_url: str):
    """Background task to process an uploaded document."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    engine = create_engine(db_url, connect_args=connect_args)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        pages = extract_text(file_path)
        chunks = split_text(pages, document_id, filename)

        if not chunks:
            doc.status = "error"
            doc.error_message = "No text could be extracted from the document."
            db.commit()
            return

        # Generate embeddings in batches of 100
        batch_size = 100
        all_embeddings = []
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [c["text"] for c in batch]
            embeddings = get_embeddings(texts)
            all_embeddings.extend(embeddings)

        add_chunks(chunks, all_embeddings)

        doc.chunk_count = len(chunks)
        doc.status = "ready"
        db.commit()

    except Exception as e:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "error"
            error_msg = str(e)[:500]
            from app.config import OPENAI_API_KEY
            if OPENAI_API_KEY:
                error_msg = error_msg.replace(OPENAI_API_KEY, "[REDACTED]")
            doc.error_message = error_msg
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    content = await file.read()
    error = validate_file(file.filename, len(content))
    if error:
        raise HTTPException(status_code=400, detail=error)

    safe_name = sanitize_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(content)

    document_id = str(uuid.uuid4())
    doc = Document(
        id=document_id,
        filename=file.filename,
        original_filename=file.filename,
        file_type=get_file_type(file.filename),
        file_path=file_path,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    from app.config import DATABASE_URL
    background_tasks.add_task(process_document, document_id, file_path, file.filename, DATABASE_URL)

    return doc


@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.upload_date.desc()).all()


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    # Delete chunks from vector store
    delete_document_chunks(document_id)

    # Delete from database
    db.delete(doc)
    db.commit()

    return {"detail": "Document deleted successfully"}
