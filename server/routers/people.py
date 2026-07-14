from fastapi import APIRouter

router = APIRouter(prefix="/people", tags=["people"])


@router.get("/teachers")
def list_teachers():
    return []


@router.get("/students")
def list_students():
    return []
