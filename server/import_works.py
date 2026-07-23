import csv
import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "ce50.db"
CSV_PATH = BASE_DIR / "Work.csv"


def parse_scope(scope_str: str) -> str:
    s = scope_str.strip()
    if "สาขา" in s or "ชั้นปี" in s:
        return "branch"
    elif "เดี่ยว" in s:
        return "solo"
    return "group"


def import_works_csv(csv_path: Path = CSV_PATH, db_path: Path = DB_PATH, conn=None):
    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        return

    should_close = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        should_close = True

    cursor = conn.cursor()
    cursor.execute("DELETE FROM works")

    inserted_count = 0
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get("ชื่อโปรเจค", "").strip()
            if not title:
                continue

            year = int(row.get("ชั้นปี", 3).strip() or 3)
            scope = parse_scope(row.get("ประเภทผลงาน", "กลุ่ม"))
            description = row.get("รายละเอียด", "").strip()
            presentation = row.get("สไลด์นำเสนอ", "").strip()

            if presentation:
                description += f"\n\nสไลด์นำเสนอ: {presentation}"

            # Parse student IDs from multiline text
            raw_ids = row.get("รหัสนักศึกษาผู้จัดทำ", "").strip().split("\n")
            author_ids_list = [sid.strip() for sid in raw_ids if sid.strip()]
            author_ids_str = json.dumps(author_ids_list)

            cursor.execute(
                """INSERT INTO works (year, scope, title, description, image, author_ids)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (year, scope, title, description, None, author_ids_str),
            )
            inserted_count += 1

    if should_close:
        conn.commit()
        conn.close()

    print(f"Successfully imported {inserted_count} works from {csv_path.name} into DB!")


if __name__ == "__main__":
    import_works_csv()
