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
