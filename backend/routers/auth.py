from fastapi import APIRouter, Depends
from models.user import RegisterRequest, LoginRequest, TokenResponse, UserOut, UpdateLanguageRequest
from services import auth_service
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    result = auth_service.register_user(req.username, req.email, req.password)
    return TokenResponse(access_token=result["token"], user=UserOut(**result["user"]))

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    result = auth_service.login_user(req.email, req.password)
    return TokenResponse(access_token=result["token"], user=UserOut(**result["user"]))

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    user = auth_service.get_user_by_id(current_user["id"])
    return UserOut(**user)

@router.patch("/me/language")
def update_language(req: UpdateLanguageRequest, current_user: dict = Depends(get_current_user)):
    user = auth_service.update_preferred_language(current_user["id"], req.preferred_language)
    return UserOut(**user)
