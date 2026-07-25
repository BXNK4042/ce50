import json
import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from config import UPLOAD_DIR
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin

router = APIRouter(prefix="/internship", tags=["internship"])


class StudentInternshipCreate(BaseModel):
    id: str
    student_id: str | None = None
    name_th: str | None = None
    name_en: str | None = None
    company: str
    position_th: str
    position_en: str | None = None
    track: str | None = None
    photo: str | None = None
    bg_image: str | None = None
    logo: str | None = None
    period_th: str | None = None
    period_en: str | None = None
    summary_th: str | None = None
    summary_en: str | None = None
    description_th: str | None = None
    description_en: str | None = None
    tech: list[str] = []
    advice_th: str | None = None
    advice_en: str | None = None
    stipend_th: str | None = None
    stipend_en: str | None = None
    welfare_th: list[str] = []
    welfare_en: list[str] = []
    rating: float = 5.0


class StudentInternshipUpdate(BaseModel):
    student_id: str | None = None
    company: str | None = None
    position_th: str | None = None
    position_en: str | None = None
    period_th: str | None = None
    period_en: str | None = None
    summary_th: str | None = None
    summary_en: str | None = None
    description_th: str | None = None
    description_en: str | None = None
    tech: list[str] | str | None = None
    advice_th: str | None = None
    advice_en: str | None = None
    stipend_th: str | None = None
    stipend_en: str | None = None
    welfare_th: list[str] | str | None = None
    welfare_en: list[str] | str | None = None
    rating: float | None = None
    bg_image: str | None = None
    logo: str | None = None


def _clean_image_url(url: str | None) -> str | None:
    if not url:
        return url
    if "/server/image/" in url:
        url = "/image/" + url.split("/server/image/", 1)[1]
    elif "/image/" in url:
        url = "/image/" + url.split("/image/", 1)[1]

    # ponytail: handle legacy seed paths pointing to <id>.jpg instead of <id>/bg.jpg
    if url.endswith(".jpg"):
        rel_path = url.replace("/image/", "")
        if not (UPLOAD_DIR / rel_path).exists():
            alt_path = url.replace(".jpg", "/bg.jpg")
            if (UPLOAD_DIR / alt_path.replace("/image/", "")).exists():
                return alt_path

    return url


@router.get("/students")
def list_student_internships(year: int | None = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    query = """
        SELECT 
            i.id,
            i.student_id,
            COALESCE(s.name_th, '') AS name_th,
            COALESCE(s.name_en, '') AS name_en,
            COALESCE(s.photo, '') AS photo,
            COALESCE(s.track, '') AS track,
            COALESCE(s.year, 3) AS year,
            i.company,
            i.position_th,
            i.position_en,
            i.period_th,
            i.period_en,
            i.summary_th,
            i.summary_en,
            i.description_th,
            i.description_en,
            i.tech,
            i.advice_th,
            i.advice_en,
            i.stipend_th,
            i.stipend_en,
            i.welfare_th,
            i.welfare_en,
            i.rating,
            i.bg_image,
            i.logo,
            i.created_at
        FROM internship_students i
        LEFT JOIN students s ON i.student_id = s.student_id
    """
    params = []
    if year is not None:
        query += " WHERE s.year = ?"
        params.append(year)

    query += " ORDER BY i.created_at ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    students = []
    for row in rows:
        item = dict(row)
        item["tech"] = json.loads(item["tech"]) if item["tech"] else []
        item["welfare_th"] = json.loads(item["welfare_th"]) if item["welfare_th"] else []
        item["welfare_en"] = json.loads(item["welfare_en"]) if item["welfare_en"] else []
        item["bg_image"] = _clean_image_url(item.get("bg_image"))
        item["logo"] = _clean_image_url(item.get("logo"))
        students.append(item)
    conn.close()
    return students


@router.get("/students/{id}")
def get_student_internship(id: str):
    conn = get_db()
    cursor = conn.cursor()
    # ponytail: flexible id lookup by raw id, intern- prefix, or student_id
    alt_id = id.replace("intern-", "") if id.startswith("intern-") else f"intern-{id}"
    query = """
        SELECT 
            i.id,
            i.student_id,
            COALESCE(s.name_th, '') AS name_th,
            COALESCE(s.name_en, '') AS name_en,
            COALESCE(s.photo, '') AS photo,
            COALESCE(s.track, '') AS track,
            i.company,
            i.position_th,
            i.position_en,
            i.period_th,
            i.period_en,
            i.summary_th,
            i.summary_en,
            i.description_th,
            i.description_en,
            i.tech,
            i.advice_th,
            i.advice_en,
            i.stipend_th,
            i.stipend_en,
            i.welfare_th,
            i.welfare_en,
            i.rating,
            i.bg_image,
            i.logo,
            i.created_at
        FROM internship_students i
        LEFT JOIN students s ON i.student_id = s.student_id
        WHERE i.id = ? OR i.id = ? OR i.student_id = ?
    """
    cursor.execute(query, (id, alt_id, id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student internship record not found")
    item = dict(row)
    item["tech"] = json.loads(item["tech"]) if item["tech"] else []
    item["welfare_th"] = json.loads(item["welfare_th"]) if item["welfare_th"] else []
    item["welfare_en"] = json.loads(item["welfare_en"]) if item["welfare_en"] else []
    item["bg_image"] = _clean_image_url(item.get("bg_image"))
    item["logo"] = _clean_image_url(item.get("logo"))
    return item


@router.post("/students")
def create_student_internship(payload: StudentInternshipCreate, admin: dict = Depends(get_current_admin)):
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO internship_students 
                (id, student_id, company, position_th, position_en, period_th, period_en,
                 summary_th, summary_en, description_th, description_en, tech, advice_th, advice_en,
                 stipend_th, stipend_en, welfare_th, welfare_en, rating, bg_image, logo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    payload.id,
                    payload.student_id,
                    payload.company,
                    payload.position_th,
                    payload.position_en,
                    payload.period_th,
                    payload.period_en,
                    payload.summary_th,
                    payload.summary_en,
                    payload.description_th,
                    payload.description_en,
                    json.dumps(payload.tech, ensure_ascii=False),
                    payload.advice_th,
                    payload.advice_en,
                    payload.stipend_th,
                    payload.stipend_en,
                    json.dumps(payload.welfare_th, ensure_ascii=False),
                    json.dumps(payload.welfare_en, ensure_ascii=False),
                    payload.rating,
                    _clean_image_url(payload.bg_image),
                    _clean_image_url(payload.logo),
                ),
            )
            return {"status": "success", "id": payload.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _format_json_list(val: list[str] | str | None) -> str:
    if not val:
        return "[]"
    if isinstance(val, list):
        return json.dumps(val, ensure_ascii=False)
    if isinstance(val, str):
        val_str = val.strip()
        if val_str.startswith("["):
            return val_str
        if "," in val_str:
            return json.dumps([x.strip() for x in val_str.split(",") if x.strip()], ensure_ascii=False)
        return json.dumps([val_str] if val_str else [], ensure_ascii=False)
    return "[]"


@router.put("/students/{id}")
def update_student_internship(
    id: str,
    payload: StudentInternshipUpdate,
    admin: dict = Depends(get_current_admin)
):
    check_admin_auth(admin, min_role="admin")
    alt_id = id.replace("intern-", "") if id.startswith("intern-") else f"intern-{id}"

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM internship_students WHERE id = ? OR id = ? OR student_id = ?",
                (id, alt_id, id)
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Student internship record not found")

            real_id = dict(row)["id"]
            fields = []
            values = []

            update_dict = payload.model_dump(exclude_unset=True)

            for key, val in update_dict.items():
                if val is not None:
                    if key in ("tech", "welfare_th", "welfare_en"):
                        fields.append(f"{key} = ?")
                        values.append(_format_json_list(val))
                    elif key in ("bg_image", "logo"):
                        fields.append(f"{key} = ?")
                        values.append(_clean_image_url(val))
                    else:
                        fields.append(f"{key} = ?")
                        values.append(val)

            if not fields:
                return {"status": "success", "message": "No fields to update"}

            values.append(real_id)
            sql = f"UPDATE internship_students SET {', '.join(fields)} WHERE id = ?"
            cursor.execute(sql, values)
            return {"status": "success", "message": "Student internship updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/students/{id}")
def delete_student_internship(id: str, admin: dict = Depends(get_current_admin)):
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM internship_students WHERE id = ?", (id,))
            return {"status": "success", "message": "Student internship deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ponytail: add image upload endpoint for internship
@router.post("/upload-image")
def upload_internship_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="admin")
    ext = file.filename.split(".")[-1].lower() if file.filename else "webp"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"intern_{uuid.uuid4()}.{ext}"
    intern_dir = UPLOAD_DIR / "internship"
    intern_dir.mkdir(parents=True, exist_ok=True)
    dest_path = intern_dir / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/internship/{new_filename}"}
