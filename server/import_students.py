import csv
import re
import sys
from pathlib import Path

# Add the server directory to python path if it isn't already
sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import db_cursor


def extract_gdrive_image_url(url: str) -> str:
    """Converts Google Drive sharing link to direct viewable image link."""
    if not url:
        return ""
    url = url.strip()
    match = re.search(r"id=([a-zA-Z0-9_-]+)", url) or re.search(r"/d/([a-zA-Z0-9_-]+)", url)
    if match:
        file_id = match.group(1)
        return f"https://lh3.googleusercontent.com/d/{file_id}"
    return url


def calculate_year(student_id: str) -> int:
    """Calculates academic year based on student_id prefix (e.g. 67... -> Year 2 in B.E. 2569)."""
    match = re.match(r"^(\d{2})", student_id)
    if match:
        batch_year = int(match.group(1))  # e.g. 67
        current_be_short = 69  # B.E. 2569 -> 69
        year = current_be_short - batch_year + 1
        return max(1, min(4, year))
    return 1


def clean_val(val: str) -> str:
    if not val:
        return ""
    val = val.strip()
    return "" if val == "-" else val


def import_students_csv(csv_path: Path) -> bool:
    if not csv_path.exists():
        print(f"Error: CSV file not found at: {csv_path.resolve()}")
        print("Please place your students.csv file in the server/ directory and try again.")
        return False

    print(f"Reading CSV file from: {csv_path.resolve()}...")

    students = []

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 5:
                continue

            # Identify data rows (Column 0 or 1 contains student ID like 67200412)
            student_id = ""
            row_offset = 0

            if re.match(r"^\d{8,10}$", row[0].strip()):
                student_id = row[0].strip()
                row_offset = 0
            elif len(row) > 1 and re.match(r"^\d{8,10}$", row[1].strip()):
                student_id = row[1].strip()
                row_offset = 1
            else:
                continue

            # Fields mapping:
            # offset + 0: Student ID
            # offset + 1: Gender
            # offset + 2: Prefix TH
            # offset + 3: Name TH
            # offset + 4: Surname TH
            # offset + 5: Prefix EN
            # offset + 6: Name EN
            # offset + 7: Surname EN
            # offset + 8: Class Role
            # offset + 9: Track
            # offset + 10: Phone
            # offset + 11: IG
            # offset + 12: Photo URL

            prefix_th = clean_val(row[row_offset + 2]) if len(row) > row_offset + 2 else ""
            fname_th = clean_val(row[row_offset + 3]) if len(row) > row_offset + 3 else ""
            lname_th = clean_val(row[row_offset + 4]) if len(row) > row_offset + 4 else ""

            name_th = f"{prefix_th}{fname_th} {lname_th}".strip()

            prefix_en = clean_val(row[row_offset + 5]) if len(row) > row_offset + 5 else ""
            fname_en = clean_val(row[row_offset + 6]) if len(row) > row_offset + 6 else ""
            lname_en = clean_val(row[row_offset + 7]) if len(row) > row_offset + 7 else ""

            name_en_full = f"{fname_en} {lname_en}".strip()
            name_en = f"{prefix_en} {name_en_full}".strip() if prefix_en else name_en_full

            class_role = clean_val(row[row_offset + 8]) if len(row) > row_offset + 8 else ""
            track = clean_val(row[row_offset + 9]) if len(row) > row_offset + 9 else ""

            tel = clean_val(row[row_offset + 10]) if len(row) > row_offset + 10 else ""
            ig = clean_val(row[row_offset + 11]) if len(row) > row_offset + 11 else ""

            contacts = []
            if tel:
                contacts.append(f"Tel: {tel}")
            if ig:
                contacts.append(f"IG: @{ig.lstrip('@')}")
            contact = " | ".join(contacts)

            raw_photo = row[row_offset + 12] if len(row) > row_offset + 12 else ""
            photo = extract_gdrive_image_url(raw_photo)

            year = calculate_year(student_id)

            students.append(
                (student_id, name_th, name_en, photo, year, class_role, track, contact)
            )

    if not students:
        print("No valid student records found in CSV.")
        return False

    print(f"Found {len(students)} student records. Clearing old data and importing into database...")

    with db_cursor() as conn:
        # Clear old student records and reset AUTOINCREMENT ID sequence to start from 1
        conn.execute("DELETE FROM students")
        conn.execute("DELETE FROM sqlite_sequence WHERE name = 'students'")

        for std in students:
            conn.execute(
                """
                INSERT INTO students (student_id, name_th, name_en, photo, year, class_role, track, contact)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id) DO UPDATE SET
                    name_th=excluded.name_th,
                    name_en=excluded.name_en,
                    photo=CASE WHEN excluded.photo != '' THEN excluded.photo ELSE students.photo END,
                    year=excluded.year,
                    class_role=excluded.class_role,
                    track=excluded.track,
                    contact=excluded.contact
                """,
                std,
            )

    print(f"Successfully imported {len(students)} students!")
    return True


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    csv_file = base_dir / "students.csv"
    if len(sys.argv) > 1:
        csv_file = Path(sys.argv[1])
    import_students_csv(csv_file)
