from fastapi import APIRouter, Query
from db import get_db

router = APIRouter(prefix="/people", tags=["people"])


@router.get("/teachers")
def list_teachers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teachers ORDER BY id ASC")
    teachers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return teachers


@router.get("/students")
def list_students(year: int = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if year is not None:
        cursor.execute("SELECT * FROM students WHERE year = ? ORDER BY student_id ASC", (year,))
    else:
        cursor.execute("SELECT * FROM students ORDER BY student_id ASC")
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return students
