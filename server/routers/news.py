from fastapi import APIRouter, HTTPException, status
import sqlite3
from config import DB_PATH
from pydantic import BaseModel

router = APIRouter(prefix="/news", tags=["news"])

class NewsCreate(BaseModel):
    title: str
    category: str
    body: str | None = None
    link: str | None = None

@router.get("/")
def list_news(category: str | None = None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if category:
        cursor.execute("SELECT * FROM news_items WHERE category = ? ORDER BY id DESC", (category,))
    else:
        cursor.execute("SELECT * FROM news_items ORDER BY id DESC")
    news = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return news

@router.post("/")
def create_news(payload: NewsCreate):
    if payload.category not in ['competition', 'scholarship', 'other']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category. Must be 'competition', 'scholarship', or 'other'"
        )
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO news_items (title, category, body, link, published_at) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))",
        (payload.title, payload.category, payload.body, payload.link)
    )
    conn.commit()
    conn.close()
    return {"detail": "News item created successfully"}
