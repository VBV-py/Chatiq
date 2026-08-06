from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    preferred_language: Optional[str] = "en"
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UpdateLanguageRequest(BaseModel):
    preferred_language: str
