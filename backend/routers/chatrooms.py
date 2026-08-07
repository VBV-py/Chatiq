from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from models.chat import CreateChatroomRequest, InviteRequest, ChatOut, MemberOut
from models.room_summary import RoomSummaryOut
from services import chatroom_service
from services.message_service import get_messages
from services.search_service import search_messages
from core.dependencies import get_current_user
from core.security import decode_token
from ws_core.manager import manager
from ws_core.handler import handle_event
from ws_core.events import *
import jwt

router = APIRouter()

@router.post("/chatrooms", response_model=ChatOut)
def create_chatroom(req: CreateChatroomRequest, current_user: dict = Depends(get_current_user)):
    return ChatOut(**chatroom_service.create_chatroom(req.name, current_user["id"]))

@router.get("/chatrooms")
def list_chatrooms(current_user: dict = Depends(get_current_user)):
    return chatroom_service.get_user_chatrooms(current_user["id"])

@router.get("/chatrooms/{chat_id}")
def get_chatroom(chat_id: str, current_user: dict = Depends(get_current_user)):
    return chatroom_service.get_chatroom(chat_id)

@router.post("/chatrooms/{chat_id}/invite")
def invite_member(chat_id: str, req: InviteRequest, current_user: dict = Depends(get_current_user)):
    return chatroom_service.invite_member(chat_id, current_user["id"], req.username)

@router.post("/chatrooms/{chat_id}/join")
def join_chatroom(chat_id: str, current_user: dict = Depends(get_current_user)):
    return chatroom_service.join_chatroom(chat_id, current_user["id"])

@router.delete("/chatrooms/{chat_id}/members/{user_id}")
def remove_member(chat_id: str, user_id: str, current_user: dict = Depends(get_current_user)):
    chatroom_service.remove_member(chat_id, current_user["id"], user_id)
    return {"message": "Member removed"}

@router.delete("/chatrooms/{chat_id}")
def delete_chatroom(chat_id: str, current_user: dict = Depends(get_current_user)):
    chatroom_service.delete_chatroom(chat_id, current_user["id"])
    return {"message": "Chatroom deleted"}

@router.post("/chatrooms/{chat_id}/summarize")
def summarize(chat_id: str, current_user: dict = Depends(get_current_user)):
    result = chatroom_service.generate_and_post_summary(chat_id, "manual", current_user["id"])
    return result

@router.get("/chatrooms/{chat_id}/messages")
def messages(chat_id: str, limit: int = 100000, offset: int = 0, current_user: dict = Depends(get_current_user)):
    return get_messages(chat_id, current_user["id"], limit, offset)

@router.delete("/chatrooms/{chat_id}/messages")
def clear_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    from services.message_service import clear_chat
    return clear_chat(chat_id, current_user["id"])

@router.get("/chatrooms/{chat_id}/members")
def members(chat_id: str, current_user: dict = Depends(get_current_user)):
    return chatroom_service.get_members(chat_id)

@router.get("/chatrooms/{chat_id}/search")
def search(chat_id: str, q: str = Query(...), current_user: dict = Depends(get_current_user)):
    return search_messages(chat_id, q, current_user["id"])

@router.websocket("/ws/chatroom/{chat_id}")
async def chatroom_ws(chat_id: str, websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
        username = payload["username"]
    except (jwt.InvalidTokenError, KeyError):
        await websocket.close(code=4001)
        return

    await manager.connect(chat_id, user_id, websocket)
    chatroom_service.set_member_online(chat_id, user_id, True)
    await manager.broadcast(chat_id, {"event": USER_ONLINE, "data": {"user_id": user_id, "username": username}})

    try:
        while True:
            raw = await websocket.receive_text()
            await handle_event(chat_id, user_id, username, raw, websocket)
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(chat_id, user_id, websocket)
        chatroom_service.set_member_online(chat_id, user_id, False)
        await manager.broadcast(chat_id, {"event": USER_OFFLINE, "data": {"user_id": user_id, "username": username}})

