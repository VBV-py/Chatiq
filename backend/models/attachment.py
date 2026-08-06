from pydantic import BaseModel
from typing import Optional

class AttachmentOut(BaseModel):
    id: str
    message_id: str
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
