from fastapi import APIRouter
import sqlite3

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/")
def list_videos():
    conn = sqlite3.connect("ce50.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM videos ORDER BY created_at DESC")
    videos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return videos