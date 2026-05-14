from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Document schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    upload_date: datetime
    chunk_count: int
    status: str
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


# Chat schemas
class QueryRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    conversation_id: Optional[str] = None


class SourceResponse(BaseModel):
    document_id: str
    filename: str
    page: Optional[int] = None
    chunk_id: str
    snippet: str
    similarity: Optional[float] = None


class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceResponse]
    conversation_id: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[dict]] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[MessageResponse]
