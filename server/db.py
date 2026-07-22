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


if __name__ == "__main__":
    init_db()
    print(f"initialized {DB_PATH}")
