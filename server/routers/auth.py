from fastapi import APIRouter, HTTPException, status
import sqlite3
from config import DB_PATH
from auth_utils import verify_password, create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(payload: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, role, year FROM admins WHERE username = ?", (payload.username,))
    admin = cursor.fetchone()
    conn.close()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    if not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    access_token = create_access_token(data={
        "sub": payload.username,
        "role": admin["role"],
        "year": admin["year"]
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": admin["role"],
        "year": admin["year"]
    }
