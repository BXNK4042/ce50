import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
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


@router.get("/students")
def list_student_internships():
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
            i.created_at
        FROM internship_students i
        LEFT JOIN students s ON i.student_id = s.student_id
        ORDER BY i.created_at ASC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    students = []
    for row in rows:
        item = dict(row)
        item["tech"] = json.loads(item["tech"]) if item["tech"] else []
        item["welfare_th"] = json.loads(item["welfare_th"]) if item["welfare_th"] else []
        item["welfare_en"] = json.loads(item["welfare_en"]) if item["welfare_en"] else []
        students.append(item)
    conn.close()
    return students


@router.get("/students/{id}")
def get_student_internship(id: str):
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
            i.created_at
        FROM internship_students i
        LEFT JOIN students s ON i.student_id = s.student_id
        WHERE i.id = ?
    """
    cursor.execute(query, (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student internship record not found")
    item = dict(row)
    item["tech"] = json.loads(item["tech"]) if item["tech"] else []
    item["welfare_th"] = json.loads(item["welfare_th"]) if item["welfare_th"] else []
    item["welfare_en"] = json.loads(item["welfare_en"]) if item["welfare_en"] else []
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
                 stipend_th, stipend_en, welfare_th, welfare_en, rating) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
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
                ),
            )
            return {"status": "success", "id": payload.id}
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
