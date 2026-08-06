from fastapi import APIRouter, Depends, UploadFile, File
from services.media_service import upload_file
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    return await upload_file(file, current_user["id"])
