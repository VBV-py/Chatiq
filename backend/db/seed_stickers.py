"""Seed the stickers table with a default static sticker pack."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()
from core.database import supabase

STICKERS = [
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png", "display_order": 1},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f602.png", "display_order": 2},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f60d.png", "display_order": 3},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f614.png", "display_order": 4},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f621.png", "display_order": 5},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f622.png", "display_order": 6},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f631.png", "display_order": 7},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f44d.png", "display_order": 8},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f44e.png", "display_order": 9},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2764.png", "display_order": 10},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f525.png", "display_order": 11},
    {"pack_name": "Emoji Pack", "image_url": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f389.png", "display_order": 12},
]

def seed():
    existing = supabase.table("stickers").select("id").execute()
    if existing.data:
        print(f"Stickers already seeded ({len(existing.data)} rows). Skipping.")
        return
    result = supabase.table("stickers").insert(STICKERS).execute()
    print(f"Seeded {len(result.data)} stickers.")

if __name__ == "__main__":
    seed()
