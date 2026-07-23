import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin
from config import UPLOAD_DIR

router = APIRouter(prefix="/works", tags=["works"])


class WorkCreate(BaseModel):
    year: int
    scope: str
    title: str
    description: str | None = None
    image: str | None = None
    author_ids: str | None = None


class WorkUpdate(BaseModel):
    year: int | None = None
    scope: str | None = None
    title: str | None = None
    description: str | None = None
    image: str | None = None
    author_ids: str | None = None


@router.get("/")
def list_works(year: int = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if year is not None:
        cursor.execute("SELECT * FROM works WHERE year = ? ORDER BY id DESC", (year,))
    else:
        cursor.execute("SELECT * FROM works ORDER BY id DESC")
    works = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return works


@router.get("/{id}")
def get_work(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM works WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Work item not found")
    return dict(row)


@router.post("/")
def create_work(payload: WorkCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=payload.year, min_role="admin")
    if payload.scope not in ("branch", "group", "solo"):
        raise HTTPException(status_code=400, detail="Invalid scope (must be branch, group, or solo)")

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO works (year, scope, title, description, image, author_ids) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (payload.year, payload.scope, payload.title, payload.description, payload.image, payload.author_ids),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_work(id: int, payload: WorkUpdate, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM works WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Work item not found")
        existing_dict = dict(existing)

    # Check permission for the existing work's year
    check_admin_auth(admin, required_year=existing_dict["year"], min_role="admin")

    # If payload updates year, also check permission for the target year
    if payload.year is not None and payload.year != existing_dict["year"]:
        check_admin_auth(admin, required_year=payload.year, min_role="admin")

    if payload.scope is not None and payload.scope not in ("branch", "group", "solo"):
        raise HTTPException(status_code=400, detail="Invalid scope")

    update_dict = payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE works SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "Work updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_work(id: int, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT year FROM works WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Work item not found")

    check_admin_auth(admin, required_year=existing["year"], min_role="admin")

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM works WHERE id = ?", (id,))
            return {"status": "success", "message": "Work deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image")
def upload_work_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="admin")
    ext = file.filename.split(".")[-1].lower() if file.filename else "webp"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"work_{uuid.uuid4()}.{ext}"
    works_dir = UPLOAD_DIR / "works"
    works_dir.mkdir(parents=True, exist_ok=True)
    dest_path = works_dir / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/works/{new_filename}"}
