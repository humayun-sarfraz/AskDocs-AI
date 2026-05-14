from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    chunk_count = Column(Integer, default=0)
    status = Column(String, default="processing")  # processing, ready, error
    error_message = Column(Text, nullable=True)
