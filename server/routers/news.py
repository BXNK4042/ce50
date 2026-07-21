from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File
from datetime import datetime, timezone
import uuid
import shutil
from db import get_db
from dependencies import get_current_admin, check_admin_auth
from config import UPLOAD_DIR, GNEWS_API_KEY, GNEWS_QUERY
from services import gnews
from pydantic import BaseModel

router = APIRouter(prefix="/news", tags=["news"])


class NewsCreate(BaseModel):
    title: str
    category: str
    body: str | None = None
    link: str | None = None
    image: str | None = None
    published_at: str | None = None


class NewsUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    body: str | None = None
    link: str | None = None
    image: str | None = None
    published_at: str | None = None


VALID_CATEGORIES = ("competition", "scholarship", "other")


@router.get("/")
def list_news(category: str | None = Query(None)):
    """List all news. Auto-syncs from GNews if a key is set and the interval elapsed."""
    conn = get_db()

    if GNEWS_API_KEY and gnews.should_sync(conn):
        try:
            gnews.sync(conn, GNEWS_API_KEY, GNEWS_QUERY)
        except Exception as e:
            # Keep serving cached news if the upstream fetch fails.
            print(f"[Warning] Auto-sync GNews failed: {e}")

    cursor = conn.cursor()
    if category:
        cursor.execute(
            "SELECT * FROM news_items WHERE category = ? ORDER BY published_at DESC, id DESC",
            (category,),
        )
    else:
        cursor.execute("SELECT * FROM news_items ORDER BY published_at DESC, id DESC")
    news = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return news


@router.get("/{id}")
def get_news_item(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news_items WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="News article not found")

    return dict(row)


@router.post("/sync-gnews")
def sync_gnews(apikey: str | None = None, query: str | None = None):
    """Manually sync news from GNews."""
    effective_key = apikey or GNEWS_API_KEY
    effective_query = query or GNEWS_QUERY

    if not effective_key:
        raise HTTPException(
            status_code=400,
            detail="GNews API Key is not set in environment and not provided in request.",
        )

    try:
        conn = get_db()
        inserted = gnews.sync(conn, effective_key, effective_query)
        conn.close()
        return {
            "status": "success",
            "message": f"Successfully synced and inserted {inserted} new articles.",
            "inserted": inserted,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/")
def create_news(payload: NewsCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    if payload.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    conn = get_db()
    cursor = conn.cursor()

    pub_at = payload.published_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        cursor.execute(
            "INSERT INTO news_items (title, category, body, link, image, published_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (payload.title, payload.category, payload.body, payload.link, payload.image, pub_at),
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return {"status": "success", "id": new_id}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_news(id: int, payload: NewsUpdate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    if payload.category is not None and payload.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM news_items WHERE id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="News article not found")

    update_fields = []
    params = []
    for key, val in payload.dict(exclude_unset=True).items():
        update_fields.append(f"{key} = ?")
        params.append(val)

    if not update_fields:
        conn.close()
        return {"status": "success", "message": "No changes made"}

    params.append(id)
    query_str = f"UPDATE news_items SET {', '.join(update_fields)} WHERE id = ?"

    try:
        cursor.execute(query_str, params)
        conn.commit()
        conn.close()
        return {"status": "success", "message": "News article updated successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_news(id: int, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM news_items WHERE id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="News article not found")

    try:
        cursor.execute("DELETE FROM news_items WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "News article deleted successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image")
def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, min_role="writer")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"{uuid.uuid4()}.{ext}"
    dest_path = UPLOAD_DIR / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/{new_filename}"}
