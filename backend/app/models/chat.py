from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True)
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    conversation_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
