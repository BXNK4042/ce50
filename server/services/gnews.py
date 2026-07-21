import json
import urllib.request
from datetime import datetime, timezone
from urllib.parse import quote

from config import GNEWS_QUERY, GNEWS_SYNC_INTERVAL_HOURS

# External news sync from the GNews API.
# Router (news.py) owns HTTP endpoints; this module owns the fetch + dedup +
# cleanup logic so the router stays pure CRUD.


def should_sync(conn) -> bool:
    """True if the last 'other'-category news was synced longer ago than the interval."""
    cursor = conn.cursor()
    cursor.execute(
        "SELECT created_at FROM news_items WHERE category = 'other' "
        "ORDER BY created_at DESC LIMIT 1"
    )
    row = cursor.fetchone()
    if not row:
        return True  # empty → sync now

    last_sync_str = row["created_at"]  # SQLite CURRENT_TIMESTAMP is UTC
    try:
        last_sync_dt = datetime.strptime(
            last_sync_str, "%Y-%m-%d %H:%M:%S"
        ).replace(tzinfo=timezone.utc)
        diff_hours = (datetime.now(timezone.utc) - last_sync_dt).total_seconds() / 3600.0
        return diff_hours >= GNEWS_SYNC_INTERVAL_HOURS
    except Exception:
        return True


def sync(conn, apikey: str, query: str = GNEWS_QUERY, lang: str = "th", country: str = "th") -> int:
    """Fetch from GNews, insert new articles (deduped by URL), trim 'other' to 50. Returns insert count."""
    safe_query = quote(query)
    url = (
        f"https://gnews.io/api/v4/search?q={safe_query}"
        f"&lang={lang}&country={country}&max=10&apikey={apikey}"
    )

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))

    articles = res_data.get("articles", [])
    cursor = conn.cursor()

    inserted_count = 0
    for art in articles:
        title = art.get("title")
        link = art.get("url")
        body = art.get("description") or art.get("content")
        image = art.get("image")
        published_at = art.get("publishedAt")

        if not title or not link:
            continue

        cursor.execute("SELECT id FROM news_items WHERE link = ?", (link,))
        if cursor.fetchone():
            continue

        cursor.execute(
            "INSERT INTO news_items (title, category, body, link, image, published_at) "
            "VALUES (?, 'other', ?, ?, ?, ?)",
            (title, body, link, image, published_at),
        )
        inserted_count += 1

    # Keep at most 50 'other' articles.
    cursor.execute(
        "DELETE FROM news_items WHERE category = 'other' AND id NOT IN ("
        "  SELECT id FROM news_items WHERE category = 'other' "
        "  ORDER BY published_at DESC, id DESC LIMIT 50"
        ")"
    )

    conn.commit()
    return inserted_count
