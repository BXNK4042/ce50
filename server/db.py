import sqlite3
from contextlib import contextmanager
from pathlib import Path

from config import DB_PATH


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
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
    schema = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
    with db_cursor() as conn:
        conn.executescript(schema)


if __name__ == "__main__":
    init_db()
    print(f"initialized {DB_PATH}")
