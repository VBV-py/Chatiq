import asyncio
from core.database import supabase
from services.chatroom_service import generate_and_send_private_summaries, _delete_chatroom_data
from ws_core.manager import manager
from ws_core.events import RECEIVE_MESSAGE

async def expiry_watcher():
    """Polls every 30s for chatrooms where all members are offline."""
    await asyncio.sleep(5)  # Startup delay
    while True:
        try:
            chatrooms = supabase.table("chats").select("*").eq("type", "chatroom").execute()
            for room in chatrooms.data or []:
                chat_id = room["id"]
                members = supabase.table("chat_members").select("*").eq("chat_id", chat_id).execute()
                if not members.data:
                    continue
                all_offline = all(not m.get("is_online", False) for m in members.data)
                ws_empty = manager.is_chat_empty(chat_id)
                if all_offline and ws_empty:
                    # Generate summary and send to private chats before deleting
                    try:
                        result = generate_and_send_private_summaries(chat_id, "expiry")
                        for p_chat_id, msg_data in result.get("broadcasts", []):
                            await manager.broadcast(p_chat_id, {"event": RECEIVE_MESSAGE, "data": msg_data})
                    except Exception as e:
                        print(f"[ExpiryWatcher] Summary generation failed: {e}")
                    # Delete chatroom
                    _delete_chatroom_data(chat_id)
        except Exception as e:
            print(f"[ExpiryWatcher] Error: {e}")
        await asyncio.sleep(30)

