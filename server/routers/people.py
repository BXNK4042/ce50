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
        c_upper = cohort.upper().strip()
        # Extract numeric batch if CE04 format (04 -> 4 -> 67 in student_id)
        student_id_prefix = None
        if c_upper.startswith("CE"):
            try:
                batch_num = int(c_upper[2:])
                student_id_prefix = str(63 + batch_num)  # batch 4 -> '67'
            except ValueError:
                pass
        elif c_upper.isdigit():
            # if 67 is passed directly
            if len(c_upper) == 2:
                student_id_prefix = c_upper
            else:
                try:
                    batch_num = int(c_upper)
                    student_id_prefix = str(63 + batch_num)
                except ValueError:
                    pass

        if student_id_prefix:
            cursor.execute(
                "SELECT * FROM students WHERE UPPER(track) LIKE ? OR student_id LIKE ? ORDER BY student_id ASC",
                (c_upper + "%", student_id_prefix + "%"),
            )
        else:
            cursor.execute(
                "SELECT * FROM students WHERE UPPER(track) LIKE ? ORDER BY student_id ASC",
                (c_upper + "%",),
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
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT student_id, track FROM students")
    rows = cursor.fetchall()
    conn.close()

    cohort_set = set()
    for row in rows:
        track = row["track"]
        std_id = row["student_id"]
        # Check track prefix e.g. CE04
        if track and track.upper().startswith("CE"):
            cohort_code = track.upper()[:4]
            cohort_set.add(cohort_code)
        # Check student_id prefix e.g. 67XXXXXX -> batch 4 -> CE04
        if std_id and len(std_id) >= 2 and std_id[:2].isdigit():
            yr = int(std_id[:2])
            if 40 <= yr <= 99:
                batch = yr - 63
                if batch > 0:
                    cohort_code = f"CE{batch:02d}"
                    cohort_set.add(cohort_code)

    return sorted(list(cohort_set), reverse=True)

