from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from services import private_chat_service
from services.message_service import get_messages
from services.search_service import search_messages
from core.dependencies import get_current_user
from core.security import decode_token
from ws_core.manager import manager
from ws_core.handler import handle_event
from ws_core.events import *
import jwt

router = APIRouter()

@router.post("/private-chats")
def create_private_chat(target_username: str, current_user: dict = Depends(get_current_user)):
    from core.database import supabase
    user = supabase.table("users").select("id").eq("username", target_username).execute()
    if not user.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return private_chat_service.get_or_create_private_chat(current_user["id"], user.data[0]["id"])

@router.get("/private-chats")
def list_private_chats(current_user: dict = Depends(get_current_user)):
    return private_chat_service.get_user_private_chats(current_user["id"])

@router.get("/private-chats/{chat_id}/messages")
def messages(chat_id: str, limit: int = 100000, offset: int = 0, current_user: dict = Depends(get_current_user)):
    return get_messages(chat_id, current_user["id"], limit, offset)

@router.get("/private-chats/{chat_id}/search")
def search(chat_id: str, q: str = Query(...), current_user: dict = Depends(get_current_user)):
    return search_messages(chat_id, q, current_user["id"])

@router.delete("/private-chats/{chat_id}")
def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    private_chat_service.delete_private_chat(chat_id, current_user["id"])
    return {"message": "Chat deleted"}

@router.post("/private-chats/{chat_id}/auto-reset/propose")
def propose_reset(chat_id: str, current_user: dict = Depends(get_current_user)):
    return private_chat_service.propose_auto_reset(chat_id, current_user["id"])

@router.post("/private-chats/{chat_id}/auto-reset/accept")
def accept_reset(chat_id: str, current_user: dict = Depends(get_current_user)):
    return private_chat_service.accept_auto_reset(chat_id, current_user["id"])

@router.post("/private-chats/{chat_id}/auto-reset/disable")
def disable_reset(chat_id: str, current_user: dict = Depends(get_current_user)):
    return private_chat_service.disable_auto_reset(chat_id, current_user["id"])

@router.websocket("/ws/private/{chat_id}")
async def private_ws(chat_id: str, websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
        username = payload["username"]
    except (jwt.InvalidTokenError, KeyError):
        await websocket.close(code=4001)
        return

    await manager.connect(chat_id, user_id, websocket)
    private_chat_service.set_member_online(chat_id, user_id, True)
    await manager.broadcast(chat_id, {"event": USER_ONLINE, "data": {"user_id": user_id, "username": username}})

    try:
        while True:
            raw = await websocket.receive_text()
            await handle_event(chat_id, user_id, username, raw, websocket)
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(chat_id, user_id, websocket)
        private_chat_service.set_member_online(chat_id, user_id, False)
        await manager.broadcast(chat_id, {"event": USER_OFFLINE, "data": {"user_id": user_id, "username": username}})

