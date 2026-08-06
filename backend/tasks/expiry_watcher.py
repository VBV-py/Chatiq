import asyncio
from core.database import supabase
from services.chatroom_service import generate_and_post_summary, _delete_chatroom_data, get_members
from ws_core.manager import manager
from ws_core.events import ROOM_EXPIRED, AI_SUMMARY_READY
import json

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
                    # Generate summary before deleting
                    try:
                        member_names = []
                        for m in members.data:
                            user = supabase.table("users").select("username").eq("id", m["user_id"]).execute()
                            if user.data:
                                member_names.append(user.data[0]["username"])
                        msgs = supabase.table("messages").select("*, users!messages_sender_id_fkey(username)").eq("chat_id", chat_id).eq("deleted", False).execute()
                        messages = []
                        for msg in msgs.data or []:
                            u = msg.pop("users", None)
                            msg["sender_username"] = u["username"] if u else "AI"
                            messages.append(msg)
                        from services.ai_service import summarize_conversation
                        summary_text = summarize_conversation(messages, room["name"], member_names)
                        # Save summary
                        supabase.table("room_summaries").insert({
                            "chat_id": chat_id,
                            "chat_name": room["name"],
                            "members_present": member_names,
                            "summary_text": summary_text,
                            "trigger": "expiry"
                        }).execute()
                    except Exception as e:
                        print(f"[ExpiryWatcher] Summary generation failed: {e}")
                    # Delete chatroom
                    _delete_chatroom_data(chat_id)
        except Exception as e:
            print(f"[ExpiryWatcher] Error: {e}")
        await asyncio.sleep(30)

