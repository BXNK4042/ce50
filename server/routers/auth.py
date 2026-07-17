from fastapi import APIRouter, HTTPException, status
from db import get_db
from auth_utils import verify_password, create_access_token, hash_password
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    fullName: str | None = None
    role: str = "writer"
    year: int = 1

@router.post("/login")
def login(payload: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, role, year FROM users WHERE username = ?", (payload.username,))
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

@router.post("/register")
def register(payload: RegisterRequest):
    # Validate role
    if payload.role not in ["superadmin", "admin", "writer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if username or email already exists
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (payload.username, payload.email))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
        
    # Hash password and insert
    hashed = hash_password(payload.password)
    cursor.execute(
        "INSERT INTO users (username, password_hash, email, full_name, role, year) VALUES (?, ?, ?, ?, ?, ?)",
        (payload.username, hashed, payload.email, payload.fullName, payload.role, payload.year)
    )
    conn.commit()
    conn.close()
    
    return {"detail": "User registered successfully"}
