import re
import uuid
from pathlib import Path
from app.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename."""
    name = Path(filename).stem
    ext = Path(filename).suffix.lower()
    name = re.sub(r'[^\w\s\-.]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    if not name:
        name = "document"
    return f"{name}_{uuid.uuid4().hex[:8]}{ext}"


def validate_file(filename: str, file_size: int) -> str | None:
    """Validate file type and size. Returns error message or None."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        return f"File too large. Maximum size: {MAX_UPLOAD_SIZE_MB}MB"
    return None


def get_file_type(filename: str) -> str:
    return Path(filename).suffix.lower().lstrip(".")
