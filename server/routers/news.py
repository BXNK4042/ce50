from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File
import urllib.request
import json
from urllib.parse import quote
from datetime import datetime, timezone
import uuid
import shutil
from db import get_db
from dependencies import get_current_admin, check_admin_auth
from config import UPLOAD_DIR

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
    url = f"https://gnews.io/api/v4/search?q={safe_query}&lang={lang}&country={country}&max=10&apikey={apikey}"

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


# --- CRUD APIs for Internal News Management ---
from pydantic import BaseModel

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


@router.post("/")
def create_news(payload: NewsCreate, admin: dict = Depends(get_current_admin)):
    """
    เพิ่มข่าวสารชิ้นใหม่เข้าระบบ (ต้องการสิทธิ์ แอดมิน)
    """
    check_admin_auth(admin, min_role="writer")

    if payload.category not in ["competition", "scholarship", "other"]:
        raise HTTPException(status_code=400, detail="Invalid category")

    conn = get_db()
    cursor = conn.cursor()

    pub_at = payload.published_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        cursor.execute(
            "INSERT INTO news_items (title, category, body, link, image, published_at) VALUES (?, ?, ?, ?, ?, ?)",
            (payload.title, payload.category, payload.body, payload.link, payload.image, pub_at)
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
    """
    แก้ไขข่าวสารเดิมตาม ID (ต้องการสิทธิ์ แอดมิน)
    """
    check_admin_auth(admin, min_role="writer")

    if payload.category is not None and payload.category not in ["competition", "scholarship", "other"]:
        raise HTTPException(status_code=400, detail="Invalid category")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM news_items WHERE id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="News article not found")

    update_fields = []
    params = []
    # แปลงเฉพาะฟิลด์ที่มีการส่งค่าเข้ามาแก้ไข
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
    """
    ลบข่าวสารออกจากระบบตาม ID (ต้องการสิทธิ์ แอดมิน)
    """
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
    """
    อัปโหลดรูปภาพประกอบข่าวสารเก็บในระบบหลังบ้าน (ต้องการสิทธิ์ แอดมิน)
    """
    check_admin_auth(admin, min_role="writer")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # ตั้งชื่อไฟล์สุ่มด้วย UUID เพื่อป้องกันชื่อไฟล์ชนกัน
    new_filename = f"{uuid.uuid4()}.{ext}"
    dest_path = UPLOAD_DIR / new_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    # คืนค่า URL Path ที่หน้าบ้าน Next.js สามารถนำไปใช้เรียกดูได้โดยตรง
    return {"url": f"/image/{new_filename}"}
