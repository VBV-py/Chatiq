from core.database import supabase
from fastapi import HTTPException
from services.ai_service import summarize_conversation
from services.message_service import get_messages
from datetime import datetime, timezone

def create_chatroom(name: str, admin_id: str) -> dict:
    result = supabase.table("chats").insert({
        "type": "chatroom",
        "name": name,
        "admin_id": admin_id,
    }).execute()
    chat = result.data[0]
    # Add admin as member
    supabase.table("chat_members").insert({
        "chat_id": chat["id"],
        "user_id": admin_id,
        "is_online": True,
    }).execute()
    return chat

def get_user_chatrooms(user_id: str) -> list:
    memberships = supabase.table("chat_members").select("chat_id").eq("user_id", user_id).execute()
    chat_ids = [m["chat_id"] for m in memberships.data or []]
    if not chat_ids:
        return []
    result = supabase.table("chats").select("*").eq("type", "chatroom").in_("id", chat_ids).execute()
    return result.data or []

def get_chatroom(chat_id: str) -> dict:
    result = supabase.table("chats").select("*").eq("id", chat_id).eq("type", "chatroom").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Chatroom not found")
    return result.data[0]

def invite_member(chat_id: str, admin_id: str, username: str) -> dict:
    room = get_chatroom(chat_id)
    if room["admin_id"] != admin_id:
        raise HTTPException(status_code=403, detail="Only admin can invite")
    user = supabase.table("users").select("id").eq("username", username).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user.data[0]["id"]
    existing = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already in room")
    result = supabase.table("chat_members").insert({"chat_id": chat_id, "user_id": user_id, "is_online": False}).execute()
    return result.data[0]

def join_chatroom(chat_id: str, user_id: str) -> dict:
    existing = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if existing.data:
        supabase.table("chat_members").update({"is_online": True}).eq("chat_id", chat_id).eq("user_id", user_id).execute()
        return {"status": "already_member"}
    result = supabase.table("chat_members").insert({"chat_id": chat_id, "user_id": user_id, "is_online": False}).execute()
    return result.data[0]

def remove_member(chat_id: str, admin_id: str, user_id: str):
    room = get_chatroom(chat_id)
    if room["admin_id"] != admin_id:
        raise HTTPException(status_code=403, detail="Only admin can remove members")
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="Admin cannot remove themselves")
    supabase.table("chat_members").delete().eq("chat_id", chat_id).eq("user_id", user_id).execute()

def get_members(chat_id: str) -> list:
    result = supabase.table("chat_members")\
        .select("*, users!chat_members_user_id_fkey(username)")\
        .eq("chat_id", chat_id).execute()
    members = []
    for m in result.data or []:
        user_info = m.pop("users", None)
        m["username"] = user_info["username"] if user_info else "Unknown"
        members.append(m)
    return members

def set_member_online(chat_id: str, user_id: str, is_online: bool):
    supabase.table("chat_members").update({"is_online": is_online}).eq("chat_id", chat_id).eq("user_id", user_id).execute()

def generate_and_post_summary(chat_id: str, trigger: str, user_id: str = None) -> dict:
    room = get_chatroom(chat_id)
    members_data = get_members(chat_id)
    member_names = [m["username"] for m in members_data]
    messages = get_messages(chat_id, user_id or members_data[0]["user_id"])
    summary_text = summarize_conversation(messages, room["name"], member_names)
    # Save to room_summaries
    summary = supabase.table("room_summaries").insert({
        "chat_id": chat_id,
        "chat_name": room["name"],
        "members_present": member_names,
        "summary_text": summary_text,
        "trigger": trigger,
    }).execute()
    # Post as system message
    msg = supabase.table("messages").insert({
        "chat_id": chat_id,
        "sender_type": "ai",
        "content": f"📋 **AI Summary — {room['name']}**\nMembers: {', '.join(member_names)}\n\n{summary_text}",
        "message_type": "text",
    }).execute()
    return {"summary": summary.data[0] if summary.data else {}, "message": msg.data[0] if msg.data else {}}

def delete_chatroom(chat_id: str, admin_id: str):
    room = get_chatroom(chat_id)
    if room["admin_id"] != admin_id:
        raise HTTPException(status_code=403, detail="Only admin can delete room")
    _delete_chatroom_data(chat_id)

def _delete_chatroom_data(chat_id: str):
    """Delete all messages/media/members and the chat itself."""
    # Delete attachments files from storage
    attachments = supabase.table("attachments")\
        .select("file_url")\
        .in_("message_id",
             [m["id"] for m in (supabase.table("messages").select("id").eq("chat_id", chat_id).execute().data or [])]
        ).execute()
    for att in attachments.data or []:
        try:
            path = att["file_url"].split("/storage/v1/object/public/media/")[-1]
            supabase.storage.from_("media").remove([path])
        except Exception:
            pass
    # Delete chat (cascade deletes messages, members, reactions, attachments)
    supabase.table("chats").delete().eq("id", chat_id).execute()
