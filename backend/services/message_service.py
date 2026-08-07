from core.database import supabase
from fastapi import HTTPException
from typing import Optional, List, Dict, Any

def send_message(chat_id: str, sender_id: str, content: Optional[str],
                 message_type: str = "text", sticker_id: Optional[str] = None,
                 forwarded_from: Optional[str] = None,
                 attachments: Optional[List[Dict[str, Any]]] = None) -> dict:
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", sender_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member of this chat")

    payload = {
        "chat_id": chat_id,
        "sender_id": sender_id,
        "sender_type": "user",
        "content": content,
        "message_type": message_type,
        "sticker_id": sticker_id,
        "forwarded_from": forwarded_from,
        "edited": False,
        "deleted": False,
    }
    result = supabase.table("messages").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    message = result.data[0]
    created_attachments: List[dict] = []
    if attachments:
        rows = []
        for att in attachments:
            if not att.get("file_url") or not att.get("file_name"):
                continue
            rows.append({
                "message_id": message["id"],
                "file_url": att["file_url"],
                "file_name": att["file_name"],
                "file_size": att.get("file_size"),
                "mime_type": att.get("mime_type"),
            })
        if rows:
            att_result = supabase.table("attachments").insert(rows).execute()
            created_attachments = att_result.data or []

    message["attachments"] = created_attachments
    return message

def edit_message(message_id: str, user_id: str, content: str) -> dict:
    msg = supabase.table("messages").select("*").eq("id", message_id).execute()
    if not msg.data:
        raise HTTPException(status_code=404, detail="Message not found")
    m = msg.data[0]
    if m["sender_id"] != user_id:
        raise HTTPException(status_code=403, detail="Can only edit your own messages")
    if m["message_type"] != "text":
        raise HTTPException(status_code=400, detail="Can only edit text messages")
    result = supabase.table("messages").update({"content": content, "edited": True}).eq("id", message_id).execute()
    return result.data[0]

def delete_message(message_id: str, user_id: str) -> dict:
    msg = supabase.table("messages").select("*").eq("id", message_id).execute()
    if not msg.data:
        raise HTTPException(status_code=404, detail="Message not found")
    m = msg.data[0]
    if m["sender_id"] != user_id:
        if m["message_type"] == "ai_summary_interactive":
            member = supabase.table("chat_members").select("id").eq("chat_id", m["chat_id"]).eq("user_id", user_id).execute()
            if not member.data:
                raise HTTPException(status_code=403, detail="Can only delete messages in chats you belong to")
        else:
            raise HTTPException(status_code=403, detail="Can only delete your own messages")
    # Delete attachments from storage
    attachments = supabase.table("attachments").select("file_url").eq("message_id", message_id).execute()
    for att in attachments.data or []:
        try:
            path = att["file_url"].split("/storage/v1/object/public/media/")[-1]
            supabase.storage.from_("media").remove([path])
        except Exception:
            pass
    result = supabase.table("messages").update({"deleted": True, "content": None}).eq("id", message_id).execute()
    return result.data[0]

def forward_message(message_id: str, user_id: str, target_chat_id: str) -> dict:
    msg = supabase.table("messages").select("*").eq("id", message_id).execute()
    if not msg.data:
        raise HTTPException(status_code=404, detail="Message not found")
    m = msg.data[0]
    return send_message(
        chat_id=target_chat_id,
        sender_id=user_id,
        content=m.get("content"),
        message_type=m.get("message_type", "text"),
        sticker_id=m.get("sticker_id"),
        forwarded_from=message_id
    )

def get_messages(chat_id: str, user_id: str, limit: int = 50, offset: int = 0) -> list:
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member of this chat")

    result = supabase.table("messages")\
        .select("*, users!messages_sender_id_fkey(username)")\
        .eq("chat_id", chat_id)\
        .order("created_at", desc=False)\
        .range(offset, offset + limit - 1)\
        .execute()

    messages = []
    for msg in result.data or []:
        user_info = msg.pop("users", None)
        msg["sender_username"] = user_info["username"] if user_info else "AI"
        # Get reactions
        reactions = supabase.table("reactions")\
            .select("*, users!reactions_user_id_fkey(username)")\
            .eq("message_id", msg["id"]).execute()
        msg["reactions"] = []
        for r in reactions.data or []:
            u = r.pop("users", None)
            r["username"] = u["username"] if u else ""
            msg["reactions"].append(r)
        # Get attachments
        atts = supabase.table("attachments").select("*").eq("message_id", msg["id"]).execute()
        msg["attachments"] = atts.data or []
        messages.append(msg)
    return messages

def clear_chat(chat_id: str, user_id: str) -> dict:
    member = supabase.table("chat_members").select("id").eq("chat_id", chat_id).eq("user_id", user_id).execute()
    if not member.data:
        raise HTTPException(status_code=403, detail="Not a member of this chat")
    
    # Delete messages from DB
    result = supabase.table("messages").delete().eq("chat_id", chat_id).execute()
    return {"message": "Chat cleared successfully"}
