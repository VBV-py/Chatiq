from core.database import supabase

def get_all_stickers() -> list:
    result = supabase.table("stickers").select("*").order("display_order").execute()
    return result.data or []

def get_sticker(sticker_id: str) -> dict:
    result = supabase.table("stickers").select("*").eq("id", sticker_id).execute()
    return result.data[0] if result.data else None
