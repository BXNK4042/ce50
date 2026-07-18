from fastapi import APIRouter, HTTPException, Query
import urllib.request
import json
from urllib.parse import quote
from datetime import datetime, timezone
from db import get_db

router = APIRouter(prefix="/news", tags=["news"])


def should_sync(conn) -> bool:
    """
    ตรวจสอบว่าต้องการซิงค์ข้อมูลใหม่หรือไม่ โดยคำนวณจากเวลาสร้างข้อมูลล่าสุดของข่าวประเภท external (category = 'other')
    """
    from config import GNEWS_SYNC_INTERVAL_HOURS
    cursor = conn.cursor()
    # ค้นหาเวลาสร้างข่าวล่าสุดที่เป็นประเภทข่าวสารภายนอก
    cursor.execute(
        "SELECT created_at FROM news_items WHERE category = 'other' ORDER BY created_at DESC LIMIT 1"
    )
    row = cursor.fetchone()
    if not row:
        return True  # ถ้าฐานข้อมูลว่าง ให้ซิงค์ทันที

    last_sync_str = row["created_at"]  # รูปแบบ: YYYY-MM-DD HH:MM:SS (UTC)
    try:
        # SQLite CURRENT_TIMESTAMP จัดเก็บเป็นเวลา UTC เสมอ
        last_sync_dt = datetime.strptime(last_sync_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        now_dt = datetime.now(timezone.utc)
        diff_hours = (now_dt - last_sync_dt).total_seconds() / 3600.0
        return diff_hours >= GNEWS_SYNC_INTERVAL_HOURS
    except Exception:
        return True  # หากเกิดการผิดพลาดในการแปลงเวลา ให้ซิงค์ไว้ก่อน


def sync_gnews_logic(conn, apikey: str, query: str, lang: str = "th", country: str = "th") -> int:
    """
    ฟังก์ชันแกนหลักในการดึงข้อมูลจาก GNews และบันทึกลง SQLite พร้อมลบข้อมูลเก่า
    """
    safe_query = quote(query)
    url = f"https://gnews.io/api/v4/search?q={safe_query}&lang={lang}&country={country}&max=25&apikey={apikey}"

    import ssl
    context = ssl._create_unverified_context()

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10, context=context) as response:
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

        # ตรวจสอบเพื่อป้องกันการบันทึกข่าวซ้ำจาก URL ลิงก์ข่าว
        cursor.execute("SELECT id FROM news_items WHERE link = ?", (link,))
        if cursor.fetchone():
            continue

        # บันทึกข้อมูลข่าวสารลงฐานข้อมูล
        cursor.execute(
            "INSERT INTO news_items (title, category, body, link, image, published_at) VALUES (?, 'other', ?, ?, ?, ?)",
            (title, body, link, image, published_at)
        )
        inserted_count += 1

    # Auto-cleanup: เก็บข่าวประเภท 'other' ไว้สูงสุดไม่เกิน 50 ข่าว
    cursor.execute(
        "DELETE FROM news_items WHERE category = 'other' AND id NOT IN ("
        "  SELECT id FROM news_items WHERE category = 'other' ORDER BY published_at DESC, id DESC LIMIT 50"
        ")"
    )

    conn.commit()
    return inserted_count


@router.get("/")
def list_news(category: str | None = Query(None)):
    """
    ดึงรายการข่าวทั้งหมดจากฐานข้อมูล SQLite (และจะซิงค์กับ GNews อัตโนมัติเบื้องหลังหากมี API Key และครบกำหนดเวลา)
    """
    from config import GNEWS_API_KEY, GNEWS_QUERY

    conn = get_db()

    # ตรวจสอบและซิงค์ข้อมูลใหม่โดยอัตโนมัติหากตรวจพบ GNEWS_API_KEY และครบชั่วโมงซิงค์
    if GNEWS_API_KEY and should_sync(conn):
        try:
            sync_gnews_logic(conn, GNEWS_API_KEY, GNEWS_QUERY)
        except Exception as e:
            # ข้ามข้อผิดพลาดไป เพื่อให้เว็บยังทำงานได้และโชว์ข่าวสารเดิมที่มีอยู่ในฐานข้อมูลได้ปกติ
            print(f"[Warning] Auto-sync GNews failed: {e}")

    cursor = conn.cursor()
    if category:
        cursor.execute(
            "SELECT * FROM news_items WHERE category = ? ORDER BY published_at DESC, id DESC",
            (category,)
        )
    else:
        cursor.execute("SELECT * FROM news_items ORDER BY published_at DESC, id DESC")
    news = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return news


@router.post("/sync-gnews")
def sync_gnews(apikey: str | None = None, query: str | None = None):
    """
    แมนนวลซิงค์ (Manual Sync) ข่าวสารจาก GNews เข้ามาบันทึกในระบบด้วยตนเอง
    """
    from config import GNEWS_API_KEY, GNEWS_QUERY

    effective_key = apikey or GNEWS_API_KEY
    effective_query = query or GNEWS_QUERY

    if not effective_key:
        raise HTTPException(
            status_code=400,
            detail="GNews API Key is not set in environment and not provided in request."
        )

    try:
        conn = get_db()
        inserted = sync_gnews_logic(conn, effective_key, effective_query)
        conn.close()
        return {
            "status": "success",
            "message": f"Successfully synced and inserted {inserted} new articles.",
            "inserted": inserted
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sync failed: {str(e)}"
        )
