from fastapi import APIRouter, Depends
from services.sticker_service import get_all_stickers
from core.dependencies import get_current_user

router = APIRouter()

@router.get("/stickers")
def list_stickers(current_user: dict = Depends(get_current_user)):
    return get_all_stickers()
