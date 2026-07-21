# server/ — คู่มือโครงสร้างส่วนหลัง

เอกสารสำหรับผู้ร่วมพัฒนา เพื่อเข้าใจโครงสร้างส่วนหลัง (FastAPI + SQLite) อย่างรวดเร็ว
ครอบคลุม: หน้าที่ของแต่ละไฟล์ การเชื่อมต่อ นิยาม และวิธีขยายระบบ

> คำสั่งรัน ตัวแปรสภาพแวดล้อม การ deploy ดูที่ [README หลัก](../README.md) ที่หน้านี้จะไม่ซ้ำ

---

## โครงสร้างไฟล์

```
server/
├── main.py            # จุดเข้า FastAPI: สร้าง app, lifespan (init_db), mount static, ลงทะเบียน router
├── config.py          # อ่านค่าจาก env (DB_PATH, UPLOAD_DIR, CORS_ORIGINS, JWT_SECRET, GNEWS_*) — ผ่าน python-dotenv
├── db.py              # ตัวช่วยเชื่อม SQLite: get_db / db_cursor / init_db (รวม mkdir UPLOAD_DIR)
├── auth_utils.py      # hash/verify รหัสผ่าน (pbkdf2_hmac) + create/decode JWT
├── dependencies.py    # FastAPI dependency: get_current_admin (จาก JWT) + check_admin_auth (ตรวจ role/year)
├── schema.sql         # สคีมาฐานข้อมูล 9 ตาราง (idempotent — CREATE TABLE IF NOT EXISTS)
├── seed.py            # ใส่ข้อมูลตัวอย่างสำหรับ dev
├── import_students.py # นำเข้านักศึกษาจาก CSV (Google Form export)
├── requirements.txt   # dependency ฝั่ง Python
├── routers/           # endpoint แยกตามโดเมน (หนึ่งไฟล์ต่อโดเมน)
│   ├── __init__.py
│   ├── auth.py        # /admin — login/register แอดมิน
│   ├── people.py      # /people — อาจารย์/นักศึกษา/cohort
│   ├── news.py        # /news — CRUD ข่าว + manual sync
│   ├── schedule.py    # /schedule — ตารางสอน/สอบ (save แบบ replace)
│   └── videos.py      # /videos — รายการวิดีโอ
├── services/
│   ├── __init__.py
│   └── gnews.py       # sync ข่าวจาก GNews API (fetch + dedup + cleanup)
└── image/             # เก็บรูปที่อัปโหลด เสิร์ฟผ่าน /image
```

> tables `works`, `rooms`, `internship_topics` มีอยู่ใน `schema.sql` แต่ยังไม่มี router —
> เพิ่ม router ใน `routers/` เมื่อจะสร้างฟีเจอร์จริง (ดูคำสั่ง "เพิ่มโดเมนใหม่" ด้านล่าง)

---

## ลำดับการทำงานของ request

```
เบราว์เซอร์ / ส่วนหน้า Next.js
      │  fetch (lib/api.ts)
      ▼
FastAPI (main.py: app)
      │  ผ่าน CORSMiddleware → เท route เข้า router ที่ลงทะเบียนไว้
      ▼
routers/<domain>.py      เช่น routers/people.py
      │  เรียก db.get_db() → เปิด SQLite connection
      ▼
SQLite (ce50.db)         อ่าน/เขียนตาม schema.sql
      │
      ▼
คืน JSON → ส่วนหน้าแม็ปเข้า type ใน lib/types.ts
```

---

## อ้างอิงแต่ละไฟล์

### `main.py`
จุดเข้าของแอป สร้าง `FastAPI(title="CE50 API")`
- **lifespan:** `init_db()` รันตอน startup (สร้างตาราง + โฟลเดอร์รูป)
- **middleware:** `CORSMiddleware` ใช้ `CORS_ORIGINS` จาก config
- **mount static:** `/image` → `UPLOAD_DIR`, `/Video` → `server/video`
- **ลงทะเบียน router:** `for r in (people, news, schedule, auth, videos)`
- **health check:** `GET /health` คืน `{"status":"ok"}`
- *ผู้เรียก:* uvicorn (`uvicorn main:app --app-dir server`)

### `config.py`
อ่านค่าจาก env (ผ่าน `python-dotenv` ที่ `.env.local` / `.env`)
- `DB_PATH`, `UPLOAD_DIR`, `CORS_ORIGINS`
- `JWT_SECRET` — **จำเป็นต้อง set**, server จะ refuse ที่จะ start หากใช้ค่า default
- `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `GNEWS_API_KEY`, `GNEWS_QUERY`, `GNEWS_SYNC_INTERVAL_HOURS`

### `db.py`
ชั้นเชื่อม SQLite ใช้ `sqlite3` มาตรฐาน (ไม่มี ORM)
- `get_db()` — เปิด connection ตั้ง `row_factory = Row`, เปิด `PRAGMA foreign_keys = ON` + `journal_mode = WAL`
- `db_cursor()` — context manager: เปิด conn → yield → commit → close
- `init_db()` — `mkdir(UPLOAD_DIR)` + อ่าน `schema.sql` + `executescript`
- *ผู้เรียก:* `main.py` (lifespan), `dependencies.py`, router ทุกตัว, `seed.py`, `import_students.py`

### `auth_utils.py`
hash/verify รหัสผ่านด้วย `hashlib.pbkdf2_hmac` (ไม่ใช้ passlib) + JWT ผ่าน `pyjwt`

### `dependencies.py`
- `get_current_admin(token)` — decode JWT → ดึง user จาก `users` table → คืน dict
- `check_admin_auth(admin, required_year, min_role)` — เช็ค role priority (superadmin > admin > writer) + จำกัดตาม `year`

### `schema.sql`
9 ตาราง — `teachers`, `students`, `works`, `news_items`, `class_schedules`, `exam_schedules`, `users`, `rooms`, `internship_topics`, `videos` (รายละเอียดในไฟล์ + `schema.dbml`)

### `services/gnews.py`
sync ข่าวจาก GNews API ออกมาจาก router เพื่อให้ `news.py` เป็น CRUD ล้วน
- `should_sync(conn)` — เช็คช่วงเวลา sync ล่าสุด
- `sync(conn, apikey, query)` — fetch + dedup (by URL) + trim `category='other'` ไว้ 50 รายการ

---

## ตาราง mapping: router ↔ ตาราง ↔ type ส่วนหน้า

| Router | Endpoint | ตาราง SQLite | Type ฝั่งหน้า |
|--------|----------|--------------|--------------|
| `people.py` | `GET /people/teachers` | `teachers` | `Teacher` |
| `people.py` | `GET /people/students` | `students` | `Student` (`year`, `cohort`) |
| `people.py` | `GET /people/cohorts` | `students` | — |
| `news.py` | `GET /news` | `news_items` | `NewsItem` (`category`) |
| `schedule.py` | `GET /schedule/class` | `class_schedules` | `WeeklyClassRow` |
| `schedule.py` | `GET /schedule/exam` | `exam_schedules` | `ExamItem` |
| `auth.py` | `POST /admin/login` | `users` | — |
| `videos.py` | `GET /videos` | `videos` | `Video` |

> กฎทอง: เพิ่ม/แก้คอลัมน์ใน `schema.sql` แล้ว **ต้องอัปเดต** type ฝั่งหน้าให้ตรง ไม่งั้น type drift

---

## เพิ่มโดเมนใหม่ (เช่น `/works`, `/rooms`)

1. **`routers/<name>.py`** — สร้าง `router = APIRouter(prefix="/<name>", tags=["<name>"])` พร้อม endpoint (ตารางมีอยู่แล้วใน `schema.sql`)
2. **`main.py`** — import ใน `from routers import ...` แล้วเพิ่มเข้า tuple ในลูป `include_router`
3. **`lib/types.ts`** (ฝั่งหน้า) — เพิ่ม `interface`
4. **`lib/api.ts`** (ฝั่งหน้า) — เพิ่มเมธอดเรียก endpoint

> หลัก: router หนึ่งไฟล์ = หนึ่งโดเมน อย่ารวมหลายโดเมนในไฟล์เดียว
