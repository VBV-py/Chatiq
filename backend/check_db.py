import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

print("--- Chats ---")
chats = supabase.table("chats").select("*").eq("type", "private").execute()
print(chats.data)

print("\n--- Members ---")
members = supabase.table("chat_members").select("*").execute()
print(members.data)

print("\n--- Messages ---")
msgs = supabase.table("messages").select("*").execute()
print(msgs.data)
