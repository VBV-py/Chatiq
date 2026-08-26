from core.database import supabase
from fastapi import HTTPException
from datetime import datetime, timezone

def get_or_create_private_chat(user1_id: str, user2_id: str) -> dict:
    # Find existing private chat between these two users
    user1_chats = supabase.table("chat_members").select("chat_id").eq("user_id", user1_id).execute()
    user1_chat_ids = [m["chat_id"] for m in user1_chats.data or []]
    if user1_chat_ids:
        user2_chats = supabase.table("chat_members").select("chat_id").eq("user_id", user2_id).in_("chat_id", user1_chat_ids).execute()
        user2_chat_ids = [m["chat_id"] for m in user2_chats.data or []]
        if user2_chat_ids:
            result = supabase.table("chats").select("*").eq("type", "private").in_("id", user2_chat_ids).execute()
            if result.data:
                return result.data[0]
    # Create new
    chat = supabase.table("chats").insert({"type": "private"}).execute().data[0]
    supabase.table("chat_members").insert([
        {"chat_id": chat["id"], "user_id": user1_id, "is_online": True},
        {"chat_id": chat["id"], "user_id": user2_id, "is_online": False},
    ]).execute()
    return chat

def get_user_private_chats(user_id: str) -> list:
    memberships = supabase.table("chat_members").select("chat_id").eq("user_id", user_id).execute()
    chat_ids = [m["chat_id"] for m in memberships.data or []]
    if not chat_ids:
        return []
    result = supabase.table("chats")\
        .select("*, chat_members(*, users!chat_members_user_id_fkey(username))")\
        .eq("type", "private").in_("id", chat_ids).execute()
    
    chats = []
    for chat in result.data or []:
        raw_members = chat.pop("chat_members", [])
        chat["members"] = []
        for m in raw_members:
            u = m.pop("users", None)
            m["username"] = u["username"] if u else "Unknown"
            chat["members"].append(m)
        chats.append(chat)
    return chats

def delete_private_chat(chat_id: str, user_id: str):
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member of this chat")
    supabase.table("chats").delete().eq("id", chat_id).eq("type", "private").execute()

def propose_auto_reset(chat_id: str, user_id: str) -> dict:
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member")
    chat = supabase.table("chats").select("*").eq("id", chat_id).execute().data[0]
    accepted = chat.get("auto_reset_accepted_by") or []
    if user_id not in accepted:
        accepted.append(user_id)
    result = supabase.table("chats").update({"auto_reset_accepted_by": accepted}).eq("id", chat_id).execute()
    return result.data[0]

def accept_auto_reset(chat_id: str, user_id: str) -> dict:
    chat = supabase.table("chats").select("*").eq("id", chat_id).execute().data[0]
    accepted = chat.get("auto_reset_accepted_by") or []
    if user_id not in accepted:
        accepted.append(user_id)
    # Get all member ids
    members = supabase.table("chat_members").select("user_id").eq("chat_id", chat_id).execute()
    all_member_ids = [m["user_id"] for m in members.data or []]
    enable = all(uid in accepted for uid in all_member_ids)
    update_data = {"auto_reset_accepted_by": accepted}
    if enable:
        update_data["auto_reset_enabled"] = True
        update_data["last_reset_at"] = datetime.now(timezone.utc).isoformat()
    result = supabase.table("chats").update(update_data).eq("id", chat_id).execute()
    return result.data[0]

def disable_auto_reset(chat_id: str, user_id: str) -> dict:
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member")
    result = supabase.table("chats").update({
        "auto_reset_enabled": False,
        "auto_reset_accepted_by": []
    }).eq("id", chat_id).execute()
    return result.data[0]

def reset_chat_messages(chat_id: str):
    """Clear all messages in a private chat (auto-reset)."""
    supabase.table("messages").delete().eq("chat_id", chat_id).execute()
    supabase.table("chats").update({"last_reset_at": datetime.now(timezone.utc).isoformat()}).eq("id", chat_id).execute()

def set_member_online(chat_id: str, user_id: str, is_online: bool):
    supabase.table("chat_members").update({"is_online": is_online}).eq("chat_id", chat_id).eq("user_id", user_id).execute()
