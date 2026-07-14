from fastapi import APIRouter

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("/")
def list_rooms():
    return []
