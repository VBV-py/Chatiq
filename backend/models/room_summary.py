from pydantic import BaseModel
from typing import List, Optional

class RoomSummaryOut(BaseModel):
    id: str
    chat_id: str
    chat_name: str
    members_present: List[str]
    summary_text: str
    generated_at: str
    trigger: str
