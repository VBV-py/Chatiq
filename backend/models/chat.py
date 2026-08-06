from pydantic import BaseModel
from typing import Optional, List

class CreateChatroomRequest(BaseModel):
    name: str

class InviteRequest(BaseModel):
    username: str

class ChatOut(BaseModel):
    id: str
    type: str
    name: Optional[str] = None
    admin_id: Optional[str] = None
    auto_reset_enabled: Optional[bool] = False
    created_at: Optional[str] = None

class MemberOut(BaseModel):
    user_id: str
    username: str
    is_online: bool
    joined_at: Optional[str] = None
