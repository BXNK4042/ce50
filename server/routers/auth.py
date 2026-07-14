from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["auth"])


@router.post("/login")
def login():
    # ponytail: stub — real password verify + JWT in auth.py next pass
    return {"detail": "not implemented"}
