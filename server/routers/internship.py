from fastapi import APIRouter

router = APIRouter(prefix="/internship", tags=["internship"])


@router.get("/")
def list_internship(host_branch: str | None = None):
    return []
