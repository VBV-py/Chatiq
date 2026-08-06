from core.database import supabase
from fastapi import HTTPException

ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"]

def add_reaction(message_id: str, user_id: str, emoji: str) -> dict:
    if emoji not in ALLOWED_EMOJIS:
        raise HTTPException(status_code=400, detail="Emoji not in allowed set")
    existing = supabase.table("reactions").select("id").eq("message_id", message_id).eq("user_id", user_id).eq("emoji", emoji).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already reacted with this emoji")
    result = supabase.table("reactions").insert({"message_id": message_id, "user_id": user_id, "emoji": emoji}).execute()
    return result.data[0]

def remove_reaction(message_id: str, user_id: str, emoji: str):
    supabase.table("reactions").delete().eq("message_id", message_id).eq("user_id", user_id).eq("emoji", emoji).execute()

def get_reactions(message_id: str) -> list:
    result = supabase.table("reactions")\
        .select("*, users!reactions_user_id_fkey(username)")\
        .eq("message_id", message_id).execute()
    reactions = []
    for r in result.data or []:
        u = r.pop("users", None)
        r["username"] = u["username"] if u else ""
        reactions.append(r)
    return reactions
