from pydantic import BaseModel
from typing import Optional

class ReactionRequest(BaseModel):
    emoji: str

class ReactionOut(BaseModel):
    id: str
    message_id: str
    user_id: str
    username: Optional[str] = None
    emoji: str
    created_at: Optional[str] = None
