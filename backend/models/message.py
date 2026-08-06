from pydantic import BaseModel
from typing import Optional, List


class AttachmentIn(BaseModel):
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class SendMessageRequest(BaseModel):
    chat_id: str
    content: Optional[str] = None
    message_type: str = "text"
    sticker_id: Optional[str] = None
    forwarded_from: Optional[str] = None
    attachments: Optional[List[AttachmentIn]] = None

class EditMessageRequest(BaseModel):
    content: str

class ForwardMessageRequest(BaseModel):
    target_chat_id: str

class MessageOut(BaseModel):
    id: str
    chat_id: str
    sender_id: Optional[str] = None
    sender_type: str = "user"
    sender_username: Optional[str] = None
    content: Optional[str] = None
    message_type: str = "text"
    sticker_id: Optional[str] = None
    edited: bool = False
    deleted: bool = False
    forwarded_from: Optional[str] = None
    created_at: Optional[str] = None
    reactions: Optional[List[dict]] = []
    attachments: Optional[List[dict]] = []
