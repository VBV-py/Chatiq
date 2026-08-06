from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[tuple]] = {}

    async def connect(self, chat_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active:
            self.active[chat_id] = []
        self.active[chat_id].append((user_id, websocket))

    def disconnect(self, chat_id: str, user_id: str, websocket: WebSocket):
        if chat_id in self.active:
            self.active[chat_id] = [
                (uid, ws) for uid, ws in self.active[chat_id]
                if ws != websocket
            ]

    async def broadcast(self, chat_id: str, data: dict, exclude_ws: WebSocket = None):
        if chat_id not in self.active:
            return
        dead = []
        for uid, ws in self.active[chat_id]:
            if ws == exclude_ws:
                continue
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append((uid, ws))
        for item in dead:
            if item in self.active[chat_id]:
                self.active[chat_id].remove(item)

    async def send_to_user(self, chat_id: str, user_id: str, data: dict):
        if chat_id not in self.active:
            return
        for uid, ws in self.active[chat_id]:
            if uid == user_id:
                try:
                    await ws.send_text(json.dumps(data))
                except Exception:
                    pass

    def get_online_user_ids(self, chat_id: str) -> List[str]:
        return [uid for uid, ws in self.active.get(chat_id, [])]

    def is_chat_empty(self, chat_id: str) -> bool:
        return len(self.active.get(chat_id, [])) == 0

manager = ConnectionManager()
