from fastapi import APIRouter

router = APIRouter(prefix="/works", tags=["works"])


@router.get("/")
def list_works(year: int | None = None):
    return []
