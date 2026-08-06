from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
