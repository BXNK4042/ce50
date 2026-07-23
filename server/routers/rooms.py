import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin
from config import UPLOAD_DIR

router = APIRouter(prefix="/rooms", tags=["rooms"])


class RoomCreate(BaseModel):
    name: str
    description: str | None = None
    image: str | None = None


class RoomUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image: str | None = None


@router.get("/")
def list_rooms():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rooms ORDER BY id ASC")
    rooms = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rooms


@router.get("/{id}")
def get_room(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rooms WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Room not found")
    return dict(row)


@router.post("/")
def create_room(payload: RoomCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO rooms (name, description, image) VALUES (?, ?, ?)",
                (payload.name, payload.description, payload.image),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_room(id: int, payload: RoomUpdate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    update_dict = payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM rooms WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Room not found")
            cursor.execute(f"UPDATE rooms SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "Room updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_room(id: int, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM rooms WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Room not found")
            cursor.execute("DELETE FROM rooms WHERE id = ?", (id,))
            return {"status": "success", "message": "Room deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image")
def upload_room_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="superadmin")
    ext = file.filename.split(".")[-1].lower() if file.filename else "webp"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"room_{uuid.uuid4()}.{ext}"
    rooms_dir = UPLOAD_DIR / "rooms"
    rooms_dir.mkdir(parents=True, exist_ok=True)
    dest_path = rooms_dir / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/rooms/{new_filename}"}
