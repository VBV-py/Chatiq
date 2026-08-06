import json
from fastapi import WebSocket
from ws_core.manager import manager
from ws_core.events import *
from services import message_service, reaction_service

async def handle_event(chat_id: str, user_id: str, username: str, raw: str, websocket: WebSocket):
    try:
        data = json.loads(raw)
    except Exception:
        return
    event = data.get("event")
    payload = data.get("data", {})

    if event == SEND_MESSAGE:
        try:
            msg = message_service.send_message(
                chat_id=chat_id, sender_id=user_id,
                content=payload.get("content"),
                message_type=payload.get("message_type", "text"),
                sticker_id=payload.get("sticker_id"),
                attachments=payload.get("attachments"),
            )
            msg["sender_username"] = username
            msg["reactions"] = []
            msg["attachments"] = msg.get("attachments") or []
            await manager.broadcast(chat_id, {"event": RECEIVE_MESSAGE, "data": msg})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))

    elif event == EDIT_MESSAGE:
        try:
            msg = message_service.edit_message(payload["message_id"], user_id, payload["content"])
            msg["sender_username"] = username
            await manager.broadcast(chat_id, {"event": MESSAGE_EDITED, "data": msg})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))

    elif event == DELETE_MESSAGE:
        try:
            message_service.delete_message(payload["message_id"], user_id)
            await manager.broadcast(chat_id, {"event": MESSAGE_DELETED, "data": {"message_id": payload["message_id"]}})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))

    elif event == ADD_REACTION:
        try:
            reaction = reaction_service.add_reaction(payload["message_id"], user_id, payload["emoji"])
            reaction["username"] = username
            await manager.broadcast(chat_id, {"event": REACTION_ADDED, "data": reaction})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))

    elif event == REMOVE_REACTION:
        try:
            reaction_service.remove_reaction(payload["message_id"], user_id, payload["emoji"])
            await manager.broadcast(chat_id, {"event": REACTION_REMOVED, "data": {
                "message_id": payload["message_id"], "user_id": user_id, "emoji": payload["emoji"]
            }})
        except Exception as e:
            pass

    elif event == TYPING:
        await manager.broadcast(chat_id, {"event": TYPING, "data": {"user_id": user_id, "username": username}}, exclude_ws=websocket)

    elif event == STOP_TYPING:
        await manager.broadcast(chat_id, {"event": STOP_TYPING, "data": {"user_id": user_id, "username": username}}, exclude_ws=websocket)

    elif event == SEND_STICKER:
        try:
            msg = message_service.send_message(
                chat_id=chat_id, sender_id=user_id, content=payload.get("content"),
                message_type="sticker", sticker_id=payload.get("sticker_id"),
            )
            msg["sender_username"] = username
            msg["reactions"] = []
            msg["attachments"] = []
            await manager.broadcast(chat_id, {"event": RECEIVE_MESSAGE, "data": msg})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))

    elif event == FORWARD_MESSAGE:
        try:
            msg = message_service.forward_message(payload["message_id"], user_id, payload["target_chat_id"])
            msg["sender_username"] = username
            await manager.broadcast(payload["target_chat_id"], {"event": RECEIVE_MESSAGE, "data": msg})
        except Exception as e:
            await websocket.send_text(json.dumps({"event": "error", "data": str(e)}))
