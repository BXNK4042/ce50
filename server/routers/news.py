from fastapi import APIRouter

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/")
def list_news(category: str | None = None):
    return []
