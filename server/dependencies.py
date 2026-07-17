from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import sqlite3
from auth_utils import decode_access_token
from config import DB_PATH

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

def get_current_admin(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject"
        )
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, year FROM admins WHERE username = ?", (username,))
    admin = cursor.fetchone()
    conn.close()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found"
        )
        
    return dict(admin)

def check_admin_auth(admin: dict, required_year: int = None, min_role: str = "writer"):
    role = admin["role"]
    
    # 1. Super admin can do everything, globally
    if role == "superadmin":
        return True
        
    # 2. Check minimal role level (superadmin > admin > writer)
    role_priority = {"superadmin": 3, "admin": 2, "writer": 1}
    if role_priority.get(role, 0) < role_priority.get(min_role, 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not allowed with your role level"
        )
        
    # 3. Restrict admin and writer to their assigned academic year
    if required_year is not None and admin["year"] != required_year:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are only authorized to manage year {admin['year']}"
        )
        
    return True
