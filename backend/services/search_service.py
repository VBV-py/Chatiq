from core.database import supabase

def search_messages(chat_id: str, query: str, user_id: str) -> list:
    # Verify user is member of this chat
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        return []

    # Use Supabase full-text search via RPC or direct filter
    # We use ilike as a fallback since tsvector requires raw SQL
    result = supabase.table("messages")\
        .select("*, users!messages_sender_id_fkey(username)")\
        .eq("chat_id", chat_id)\
        .eq("deleted", False)\
        .ilike("content", f"%{query}%")\
        .order("created_at", desc=False)\
        .execute()

    messages = []
    for msg in result.data or []:
        user_info = msg.pop("users", None)
        msg["sender_username"] = user_info["username"] if user_info else "AI"
        messages.append(msg)

    return messages
