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
def list_students(year: int = Query(None), cohort: str = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    # ponytail: cohort filter via track LIKE — cohort code lives in track prefix
    # (e.g. "CE05-A"). Promote to own column if track semantics change.
    if cohort is not None:
        cursor.execute(
            "SELECT * FROM students WHERE UPPER(track) LIKE ? ORDER BY student_id ASC",
            (cohort.upper() + "%",),
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
    # ponytail: cohort derived from track prefix (CE04, CE05, ...). Promote to
    # own column when track semantics change.
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT UPPER(SUBSTR(track, 1, 4)) AS cohort "
        "FROM students WHERE track LIKE 'CE%' ORDER BY cohort DESC"
    )
    cohorts = [row["cohort"] for row in cursor.fetchall()]
    conn.close()
    return cohorts
