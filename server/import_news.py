import csv
import re
import ssl
import sqlite3
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "ce50.db"
CSV_PATH = BASE_DIR / "News-CE.csv"
NEWS_IMG_DIR = BASE_DIR / "image" / "news"


def process_image(title: str, url: str) -> str:
    title_lower = title.lower()

    # Check local image files in server/image/news
    if "cabling" in title_lower and (NEWS_IMG_DIR / "Cabling-Contest.jpg").exists():
        return "/image/news/Cabling-Contest.jpg"
    if ("tgr" in title_lower or "topgun" in title_lower) and (NEWS_IMG_DIR / "TopGun-Rally.png").exists():
        return "/image/news/TopGun-Rally.png"

    if not url:
        return ""
    url = url.strip()

    # Extract Google Drive File ID if present
    match = re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    if match:
        file_id = match.group(1)
        NEWS_IMG_DIR.mkdir(parents=True, exist_ok=True)
        local_file = NEWS_IMG_DIR / f"{file_id}.jpg"

        # Download if not already downloaded
        if not local_file.exists():
            lh3_url = f"https://lh3.googleusercontent.com/d/{file_id}"
            try:
                ctx = ssl._create_unverified_context()
                req = urllib.request.Request(lh3_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, context=ctx, timeout=10) as resp, open(local_file, "wb") as f:
                    f.write(resp.read())
            except Exception as e:
                print(f"[Warning] Failed to download news image {file_id}: {e}")
                return f"https://lh3.googleusercontent.com/d/{file_id}"

        return f"/image/news/{file_id}.jpg"

    return url


def import_news_csv(csv_path: Path = CSV_PATH, db_path: Path = DB_PATH, conn=None):
    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        return

    should_close = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        should_close = True

    cursor = conn.cursor()
    cursor.execute("DELETE FROM news_items")

    inserted_count = 0
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get("หัวข้อข่าว Title", "").strip()
            if not title:
                continue

            category = row.get("Category", "other").strip().lower()
            if category not in ("competition", "scholarship", "other"):
                category = "other"

            body = row.get("เนื้อหา body", "").strip()
            link = row.get("ลิงก์อ้างอิงภายนอก (Link)", "").strip()
            raw_image = row.get("Image Upload", "").strip()
            image = process_image(title, raw_image)
            timestamp = row.get("Timestamp", "").strip()

            cursor.execute(
                """INSERT INTO news_items (title, category, body, link, image, published_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (title, category, body, link, image, timestamp),
            )
            inserted_count += 1

    if should_close:
        conn.commit()
        conn.close()

    print(f"Successfully imported {inserted_count} news items from {csv_path.name} into DB!")


if __name__ == "__main__":
    import_news_csv()
