from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from db import get_db
from dependencies import get_current_admin, check_admin_auth

router = APIRouter(prefix="/schedule", tags=["schedule"])

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday")


class ClassCell(BaseModel):
    day: str
    time_slot: str
    code: str
    name_en: Optional[str] = None
    name_th: Optional[str] = None
    room: Optional[str] = None
    instructor_en: Optional[str] = None
    instructor_th: Optional[str] = None
    description_en: Optional[str] = None
    description_th: Optional[str] = None


class ClassSaveBody(BaseModel):
    year: int
    term: int = 1
    rows: List[ClassCell]


class ExamItem(BaseModel):
    code: str
    name_en: Optional[str] = None
    name_th: Optional[str] = None
    date_raw: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    midterm_en: Optional[str] = None
    midterm_th: Optional[str] = None
    finals_en: Optional[str] = None
    finals_th: Optional[str] = None


class ExamSaveBody(BaseModel):
    year: int
    term: int = 1
    exams: List[ExamItem]


@router.get("/class")
def list_class(year: int = Query(...), term: int = Query(1)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT day, time_slot, code, name_en, name_th, room, instructor_en, instructor_th, description_en, description_th "
        "FROM class_schedules WHERE year=? AND term=? ORDER BY id",
        (year, term),
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@router.get("/exam")
def list_exam(year: int = Query(...), term: int = Query(1)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT code, name_en, name_th, date_raw, start_time, end_time, midterm_en, midterm_th, finals_en, finals_th "
        "FROM exam_schedules WHERE year=? AND term=? ORDER BY date_raw, start_time",
        (year, term),
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@router.post("/class")
def save_class(body: ClassSaveBody, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=body.year, min_role="admin")
    if any(c.day not in DAYS for c in body.rows):
        raise HTTPException(status_code=400, detail="Invalid day")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM class_schedules WHERE year=? AND term=?",
        (body.year, body.term),
    )
    for c in body.rows:
        cur.execute(
            "INSERT INTO class_schedules "
            "(year, term, day, time_slot, code, name_en, name_th, room, instructor_en, instructor_th, description_en, description_th) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (body.year, body.term, c.day, c.time_slot, c.code, c.name_en, c.name_th,
             c.room, c.instructor_en, c.instructor_th, c.description_en, c.description_th),
        )
    conn.commit()
    conn.close()
    return {"status": "success", "count": len(body.rows)}


@router.post("/exam")
def save_exam(body: ExamSaveBody, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=body.year, min_role="admin")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM exam_schedules WHERE year=? AND term=?",
        (body.year, body.term),
    )
    for e in body.exams:
        cur.execute(
            "INSERT INTO exam_schedules "
            "(year, term, code, name_en, name_th, date_raw, start_time, end_time, midterm_en, midterm_th, finals_en, finals_th) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (body.year, body.term, e.code, e.name_en, e.name_th, e.date_raw,
             e.start_time, e.end_time, e.midterm_en, e.midterm_th, e.finals_en, e.finals_th),
        )
    conn.commit()
    conn.close()
    return {"status": "success", "count": len(body.exams)}
