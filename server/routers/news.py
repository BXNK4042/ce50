import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from db import db_cursor, get_db
from config import GNEWS_API_KEY, GNEWS_QUERY, UPLOAD_DIR
from dependencies import check_admin_auth, get_current_admin
from services import gnews

router = APIRouter(prefix="/news", tags=["news"])


class NewsCreate(BaseModel):
    title: str
    category: str = "other"
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


@router.post("/")
def create_news(payload: NewsCreate, admin: dict = Depends(get_current_admin)):
    if payload.category not in ("competition", "scholarship", "other"):
        payload.category = "other"

    author = admin.get("username")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO news_items (title, category, body, link, image, published_at, author_username) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (payload.title, payload.category, payload.body, payload.link, payload.image, payload.published_at, author),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_news(id: int, payload: NewsUpdate, admin: dict = Depends(get_current_admin)):
    update_dict = payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    if "category" in update_dict and update_dict["category"] not in ("competition", "scholarship", "other"):
        update_dict["category"] = "other"

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT author_username FROM news_items WHERE id = ?", (id,))
            item = cursor.fetchone()
            if not item:
                raise HTTPException(status_code=404, detail="News article not found")

            # Ownership check: superadmin OR article author
            if admin.get("role") != "superadmin" and item["author_username"] != admin.get("username"):
                raise HTTPException(
                    status_code=403,
                    detail="You can only edit your own news articles",
                )

            update_fields = [f"{key} = ?" for key in update_dict.keys()]
            params = list(update_dict.values())
            params.append(id)

            cursor.execute(f"UPDATE news_items SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "News article updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_news(id: int, admin: dict = Depends(get_current_admin)):
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT author_username FROM news_items WHERE id = ?", (id,))
            item = cursor.fetchone()
            if not item:
                raise HTTPException(status_code=404, detail="News article not found")

            # Ownership check: superadmin OR article author
            if admin.get("role") != "superadmin" and item["author_username"] != admin.get("username"):
                raise HTTPException(
                    status_code=403,
                    detail="You can only delete your own news articles",
                )

            cursor.execute("DELETE FROM news_items WHERE id = ?", (id,))
            return {"status": "success", "message": "News article deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image")
def upload_news_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = file.filename.split(".")[-1].lower() if file.filename else "webp"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    new_filename = f"news_{uuid.uuid4()}.{ext}"
    news_dir = UPLOAD_DIR / "news"
    news_dir.mkdir(parents=True, exist_ok=True)
    dest_path = news_dir / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"url": f"/image/news/{new_filename}"}


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
