import sqlite3
from contextlib import contextmanager
from pathlib import Path

from config import DB_PATH, UPLOAD_DIR


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout = 30000")
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def db_cursor():
    conn = get_db()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    schema = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
    with db_cursor() as conn:
        conn.executescript(schema)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(rooms)")
        cols = {row["name"] for row in cursor.fetchall()}
        new_cols = [
            ("slug", "TEXT"),
            ("title_th", "TEXT NOT NULL DEFAULT ''"),
            ("title_en", "TEXT NOT NULL DEFAULT ''"),
            ("location_th", "TEXT"),
            ("location_en", "TEXT"),
            ("tag_th", "TEXT"),
            ("tag_en", "TEXT"),
            ("desc_th", "TEXT"),
            ("desc_en", "TEXT"),
            ("features_th", "TEXT"),
            ("features_en", "TEXT"),
        ]
        for col_name, col_type in new_cols:
            if col_name not in cols:
                cursor.execute(f"ALTER TABLE rooms ADD COLUMN {col_name} {col_type}")


if __name__ == "__main__":
    init_db()
    print(f"initialized {DB_PATH}")
