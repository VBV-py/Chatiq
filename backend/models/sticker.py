from pydantic import BaseModel

class StickerOut(BaseModel):
    id: str
    pack_name: str
    image_url: str
    display_order: int = 0
