from fastapi import APIRouter, HTTPException, status, File, UploadFile
import sqlite3
from config import DB_PATH, UPLOAD_DIR
from pydantic import BaseModel
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/news", tags=["news"])

class NewsCreate(BaseModel):
    title: str
    category: str
    body: str | None = None
    link: str | None = None
    image: str | None = None

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

@router.post("/upload")
def upload_news_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    ext = Path(file.filename).suffix
    if not ext:
        ext = ".jpg"
    filename = f"upload_{uuid.uuid4().hex}{ext}"
    
    file_path = UPLOAD_DIR / filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    return {"url": f"/image/{filename}"}

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
        "INSERT INTO news_items (title, category, body, link, image, published_at) VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))",
        (payload.title, payload.category, payload.body, payload.link, payload.image)
    )
    
    # Prune oldest items per category group so each section count never exceeds 6
    cursor.execute("SELECT COUNT(*) FROM news_items WHERE category = 'other'")
    other_count = cursor.fetchone()[0]
    if other_count > 6:
        cursor.execute(
            "DELETE FROM news_items WHERE category = 'other' AND id NOT IN (SELECT id FROM news_items WHERE category = 'other' ORDER BY id DESC LIMIT 6)"
        )
        
    # Prune only other category (External News) to limit it to 6 items
    conn.commit()
    conn.close()
    return {"detail": "News item created successfully"}
