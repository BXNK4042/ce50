from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin
from auth_utils import hash_password

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    full_name: str | None = None
    role: str = "admin"
    year: int = 1


class UserUpdate(BaseModel):
    password: str | None = None
    email: str | None = None
    full_name: str | None = None
    role: str | None = None
    year: int | None = None


@router.get("/")
def list_users(admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, full_name, role, year, created_at FROM users ORDER BY id ASC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return users


@router.post("/")
def create_user(payload: UserCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    if payload.role not in ("superadmin", "admin", "writer"):
        raise HTTPException(status_code=400, detail="Invalid role")
    if payload.year < 1 or payload.year > 4:
        raise HTTPException(status_code=400, detail="Year must be between 1 and 4")

    hashed = hash_password(payload.password)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash, email, full_name, role, year) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (payload.username, hashed, payload.email, payload.full_name, payload.role, payload.year),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Username or email already exists")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_user(id: int, payload: UserUpdate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    update_dict = payload.dict(exclude_unset=True)

    if "password" in update_dict:
        raw_pw = update_dict.pop("password")
        if raw_pw:
            update_dict["password_hash"] = hash_password(raw_pw)

    if "role" in update_dict and update_dict["role"] not in ("superadmin", "admin", "writer"):
        raise HTTPException(status_code=400, detail="Invalid role")

    if "year" in update_dict and (update_dict["year"] < 1 or update_dict["year"] > 4):
        raise HTTPException(status_code=400, detail="Year must be between 1 and 4")

    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")
            cursor.execute(f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "User updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_user(id: int, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")

    # Prevent admin from deleting themselves
    if admin.get("id") == id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")
            cursor.execute("DELETE FROM users WHERE id = ?", (id,))
            return {"status": "success", "message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
