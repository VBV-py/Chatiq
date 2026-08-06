from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.ai_service import translate_message
from services import auth_service
from core.dependencies import get_current_user

router = APIRouter()

class TranslateRequest(BaseModel):
    content: str
    target_language: str = None
    model: str | None = None

@router.post("/ai/translate")
def translate(req: TranslateRequest, current_user: dict = Depends(get_current_user)):
    lang = req.target_language
    if not lang:
        user = auth_service.get_user_by_id(current_user["id"])
        lang = user.get("preferred_language", "en")
    translated = translate_message(req.content, lang, model=req.model)
    return {
        "original": req.content,
        "translated": translated,
        "language": lang,
        "model": req.model,
    }
