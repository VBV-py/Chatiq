import asyncio
from core.database import supabase
from services.private_chat_service import reset_chat_messages
from ws_core.manager import manager
from ws_core.events import CHAT_RESET
from datetime import datetime, timezone, timedelta

async def auto_reset_scheduler():
    """Polls every 60s for private chats with auto_reset_enabled."""
    await asyncio.sleep(10)
    while True:
        try:
            chats = supabase.table("chats")\
                .select("*")\
                .eq("type", "private")\
                .eq("auto_reset_enabled", True)\
                .execute()
            now = datetime.now(timezone.utc)
            for chat in chats.data or []:
                last_reset = chat.get("last_reset_at")
                if last_reset:
                    last_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
                    if (now - last_dt) >= timedelta(hours=24):
                        reset_chat_messages(chat["id"])
                        await manager.broadcast(chat["id"], {"event": CHAT_RESET, "data": {"chat_id": chat["id"]}})
        except Exception as e:
            print(f"[AutoReset] Error: {e}")
        await asyncio.sleep(60)

