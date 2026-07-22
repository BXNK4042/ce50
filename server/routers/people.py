import json
import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from db import db_cursor, get_db

from dependencies import check_admin_auth, get_current_admin
from config import UPLOAD_DIR

router = APIRouter(prefix="/people", tags=["people"])


class TeacherCreate(BaseModel):
    name_th: str
    name_en: str | None = None
    photo: str | None = None
    advise_years: list[str] | str | None = None
    contact: str | None = None


class TeacherUpdate(BaseModel):
    name_th: str | None = None
    name_en: str | None = None
    photo: str | None = None
    advise_years: list[str] | str | None = None
    contact: str | None = None


@router.get("/teachers")
def list_teachers():
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM teachers ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]


@router.post("/teachers")
def create_teacher(payload: TeacherCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    advise_years_str = None
    if payload.advise_years is not None:
        if isinstance(payload.advise_years, list):
            advise_years_str = json.dumps(payload.advise_years)
        else:
            advise_years_str = payload.advise_years

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO teachers (name_th, name_en, photo, advise_years, contact) "
                "VALUES (?, ?, ?, ?, ?)",
                (payload.name_th, payload.name_en, payload.photo, advise_years_str, payload.contact),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/teachers/{id}")
def update_teacher(id: int, payload: TeacherUpdate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    update_dict = payload.dict(exclude_unset=True)
    if "advise_years" in update_dict:
        val = update_dict["advise_years"]
        if isinstance(val, list):
            update_dict["advise_years"] = json.dumps(val)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM teachers WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Teacher not found")

            if not update_dict:
                return {"status": "success", "message": "No changes made"}

            update_fields = [f"{key} = ?" for key in update_dict.keys()]
            params = list(update_dict.values())
            params.append(id)

            query_str = f"UPDATE teachers SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query_str, params)
            return {"status": "success", "message": "Teacher updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/teachers/{id}")
def delete_teacher(id: int, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM teachers WHERE id = ?", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Teacher not found")

            cursor.execute("DELETE FROM teachers WHERE id = ?", (id,))
            return {"status": "success", "message": "Teacher deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/teachers/upload-image")
def upload_teacher_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    ext = file.filename.split(".")[-1].lower() if file.filename else "webp"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"teacher_{uuid.uuid4()}.{ext}"
    dest_path = UPLOAD_DIR / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/{new_filename}"}


@router.get("/students")
def list_students(year: int = Query(None), cohort: str = Query(None)):
    conn = get_db()
    cursor = conn.cursor()

    if cohort is not None:
        c_upper = cohort.strip().upper()
        target_prefix = ""
        target_code = ""

        if c_upper.startswith("CE") and len(c_upper) >= 4 and c_upper[2:4].isdigit():
            gen = int(c_upper[2:4])
            target_code = c_upper
            target_prefix = str(gen + 63)
        elif len(c_upper) == 2 and c_upper.isdigit():
            target_prefix = c_upper
            gen = int(c_upper) - 63
            if gen > 0:
                target_code = f"CE{gen:02d}"

        if target_prefix and target_code:
            cursor.execute(
                "SELECT * FROM students WHERE UPPER(track) LIKE ? OR student_id LIKE ? ORDER BY student_id ASC",
                (target_code + "%", target_prefix + "%"),
            )
        else:
            cursor.execute(
                "SELECT * FROM students WHERE UPPER(track) LIKE ? OR student_id LIKE ? ORDER BY student_id ASC",
                (c_upper + "%", c_upper + "%"),
            )
    elif year is not None:
        cursor.execute("SELECT * FROM students WHERE year = ? ORDER BY student_id ASC", (year,))
    else:
        cursor.execute("SELECT * FROM students ORDER BY student_id ASC")

    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return students


@router.get("/cohorts")
def list_cohorts():
    """
    Returns list of cohort codes (e.g. ["CE06", "CE05", "CE04"]) dynamically derived from
    both 2-digit student_id prefixes (67 -> CE04) and track prefixes in the database.
    """
    conn = get_db()
    cursor = conn.cursor()

    # 1. Distinct student_id prefixes (e.g. '67' from '67200412')
    cursor.execute(
        "SELECT DISTINCT SUBSTR(student_id, 1, 2) AS prefix "
        "FROM students WHERE student_id IS NOT NULL AND LENGTH(student_id) >= 2"
    )
    prefixes = [row["prefix"] for row in cursor.fetchall() if row["prefix"] and row["prefix"].isdigit()]

    # 2. Distinct track prefixes (e.g. 'CE04')
    cursor.execute(
        "SELECT DISTINCT UPPER(SUBSTR(track, 1, 4)) AS cohort "
        "FROM students WHERE UPPER(track) LIKE 'CE%'"
    )
    track_cohorts = [row["cohort"] for row in cursor.fetchall() if row["cohort"]]
    conn.close()

    codes_set = set()

    for p in prefixes:
        num = int(p)
        if num >= 40:
            gen = num - 63
            if gen > 0:
                codes_set.add(f"CE{gen:02d}")

    for tc in track_cohorts:
        if len(tc) == 4 and tc[2:].isdigit():
            codes_set.add(tc)

    # Sort descending by generation number (e.g. CE06, CE05, CE04...)
    sorted_cohorts = sorted(list(codes_set), key=lambda code: int(code[2:]) if code[2:].isdigit() else 0, reverse=True)
    return sorted_cohorts

