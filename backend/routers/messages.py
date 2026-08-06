from fastapi import APIRouter, Depends
from models.message import SendMessageRequest, EditMessageRequest, ForwardMessageRequest
from services import message_service
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/messages")
def send_message(req: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    return message_service.send_message(
        req.chat_id,
        current_user["id"],
        req.content,
        req.message_type,
        req.sticker_id,
        req.forwarded_from,
        [a.model_dump() for a in req.attachments] if req.attachments else None,
    )

@router.put("/messages/{message_id}")
def edit_message(message_id: str, req: EditMessageRequest, current_user: dict = Depends(get_current_user)):
    return message_service.edit_message(message_id, current_user["id"], req.content)

@router.delete("/messages/{message_id}")
def delete_message(message_id: str, current_user: dict = Depends(get_current_user)):
    return message_service.delete_message(message_id, current_user["id"])

@router.post("/messages/{message_id}/forward")
def forward_message(message_id: str, req: ForwardMessageRequest, current_user: dict = Depends(get_current_user)):
    return message_service.forward_message(message_id, current_user["id"], req.target_chat_id)
