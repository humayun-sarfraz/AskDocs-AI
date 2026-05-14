import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.chat import Conversation, Message
from app.models.document import Document
from app.schemas import (
    QueryRequest, QueryResponse, ConversationResponse,
    ConversationDetailResponse, MessageResponse,
)
from app.services.rag_pipeline import ask_question

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest, db: Session = Depends(get_db)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Validate document_ids if provided
    if request.document_ids:
        for doc_id in request.document_ids:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if not doc:
                raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")
            if doc.status != "ready":
                raise HTTPException(status_code=400, detail=f"Document {doc.filename} is still processing")

    # Get or create conversation
    conversation_id = request.conversation_id
    if conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation.updated_at = datetime.utcnow()
    else:
        conversation_id = str(uuid.uuid4())
        title = request.question[:80] + ("..." if len(request.question) > 80 else "")
        conversation = Conversation(id=conversation_id, title=title)
        db.add(conversation)

    # Run RAG pipeline
    result = ask_question(
        question=request.question,
        document_ids=request.document_ids,
    )

    # Save user message
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=request.question,
    )
    db.add(user_msg)

    # Save assistant message
    assistant_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="assistant",
        content=result["answer"],
        sources=result["sources"],
    )
    db.add(assistant_msg)
    db.commit()

    return QueryResponse(
        answer=result["answer"],
        sources=result["sources"],
        conversation_id=conversation_id,
    )


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        messages=[MessageResponse.model_validate(m) for m in messages],
    )


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    db.delete(conversation)
    db.commit()

    return {"detail": "Conversation deleted successfully"}
