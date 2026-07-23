from fastapi import APIRouter, HTTPException, Query
from db import get_db
from config import GNEWS_API_KEY, GNEWS_QUERY
from services import gnews

router = APIRouter(prefix="/news", tags=["news"])


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
