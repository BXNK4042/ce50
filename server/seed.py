# Dev sample data. Run: python seed.py  (after `python db.py`)
from db import db_cursor


def main() -> None:
    with db_cursor() as conn:
        conn.executemany(
            "INSERT OR IGNORE INTO rooms(name, description) VALUES (?,?)",
            [("113", "ห้องเรียน CE"), ("Server Room", "ห้องเซิร์ฟเวอร์สาขา")],
        )
    print("seeded")


if __name__ == "__main__":
    main()
