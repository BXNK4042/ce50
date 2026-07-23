from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin

router = APIRouter(prefix="/internship", tags=["internship"])


class InternshipCreate(BaseModel):
    host_branch: str
    title: str
    description: str | None = None
    year: int = 3


class InternshipUpdate(BaseModel):
    host_branch: str | None = None
    title: str | None = None
    description: str | None = None
    year: int | None = None


@router.get("/")
def list_internships(year: int = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if year is not None:
        cursor.execute("SELECT * FROM internship_topics WHERE year = ? ORDER BY id DESC", (year,))
    else:
        cursor.execute("SELECT * FROM internship_topics ORDER BY id DESC")
    topics = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return topics


@router.post("/")
def create_internship(payload: InternshipCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=payload.year, min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO internship_topics (host_branch, title, description, year) VALUES (?, ?, ?, ?)",
                (payload.host_branch, payload.title, payload.description, payload.year),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_internship(id: int, payload: InternshipUpdate, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM internship_topics WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Topic not found")
        existing_dict = dict(existing)

    check_admin_auth(admin, required_year=existing_dict["year"], min_role="admin")
    update_dict = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE internship_topics SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "Topic updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_internship(id: int, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT year FROM internship_topics WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Topic not found")

    check_admin_auth(admin, required_year=existing["year"], min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM internship_topics WHERE id = ?", (id,))
            return {"status": "success", "message": "Topic deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
