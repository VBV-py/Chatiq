from core.database import supabase
from core.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException

def register_user(username: str, email: str, password: str) -> dict:
    # Check username uniqueness
    existing = supabase.table("users").select("id").eq("username", username).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Username already taken")
    existing_email = supabase.table("users").select("id").eq("email", email).execute()
    if existing_email.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(password)
    result = supabase.table("users").insert({
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "preferred_language": "en"
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    token = create_access_token(user["id"], user["username"])
    return {"token": token, "user": user}

def login_user(email: str, password: str) -> dict:
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user["id"], user["username"])
    return {"token": token, "user": user}

def get_user_by_id(user_id: str) -> dict:
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

def update_preferred_language(user_id: str, language: str) -> dict:
    result = supabase.table("users").update({"preferred_language": language}).eq("id", user_id).execute()
    return result.data[0]
