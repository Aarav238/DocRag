from fastapi import APIRouter, Depends

from app.core.auth import UserContext, get_current_user

router = APIRouter()


@router.get("/me")
async def read_current_user(user: UserContext = Depends(get_current_user)):
    """Return the authenticated user as stored in the application database."""
    return {
        "user_id": user.id,
        "clerk_user_id": user.clerk_user_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
