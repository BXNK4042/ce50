from fastapi import APIRouter

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/")
def list_schedule(kind: str | None = None, year: int | None = None):
    return []
