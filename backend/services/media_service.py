import uuid
from core.database import supabase
from fastapi import UploadFile, HTTPException

BUCKET = "media"

async def upload_file(file: UploadFile, uploader_id: str) -> dict:
    content = await file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 100MB.")
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{uploader_id}/{uuid.uuid4()}.{ext}"
    try:
        supabase.storage.from_(BUCKET).upload(path, content, file_options={"content-type": file.content_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    public_url = supabase.storage.from_(BUCKET).get_public_url(path)
    return {"file_url": public_url, "file_name": file.filename, "file_size": len(content), "mime_type": file.content_type}
