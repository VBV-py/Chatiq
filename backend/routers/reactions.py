from fastapi import APIRouter, Depends
from models.reaction import ReactionRequest
from services import reaction_service
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/messages/{message_id}/reactions")
def add_reaction(message_id: str, req: ReactionRequest, current_user: dict = Depends(get_current_user)):
    return reaction_service.add_reaction(message_id, current_user["id"], req.emoji)

@router.delete("/messages/{message_id}/reactions/{emoji}")
def remove_reaction(message_id: str, emoji: str, current_user: dict = Depends(get_current_user)):
    reaction_service.remove_reaction(message_id, current_user["id"], emoji)
    return {"message": "Reaction removed"}

@router.get("/messages/{message_id}/reactions")
def get_reactions(message_id: str, current_user: dict = Depends(get_current_user)):
    return reaction_service.get_reactions(message_id)
