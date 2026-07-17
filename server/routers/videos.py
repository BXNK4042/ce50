from fastapi import APIRouter
from db import get_db

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/")
def list_videos():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM videos ORDER BY created_at DESC")
    videos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return videos