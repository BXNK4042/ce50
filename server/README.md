# server/ — คู่มือโครงสร้างส่วนหลัง

เอกสารสำหรับผู้ร่วมพัฒนา เพื่อเข้าใจโครงสร้างส่วนหลัง (FastAPI + SQLite) อย่างรวดเร็ว
ครอบคลุม: หน้าที่ของแต่ละไฟล์ การเชื่อมต่อ นิยาม และวิธีขยายระบบ

> คำสั่งรัน ตัวแปรสภาพแวดล้อม การ deploy ดูที่ [README หลัก](../README.md) ที่หน้านี้จะไม่ซ้ำ

---

## โครงสร้างไฟล์

```
server/
├── main.py            # จุดเข้า FastAPI: สร้าง app, เดินสาย CORS/middleware, เมานต์ static, ลงทะเบียน router
├── config.py          # อ่านค่าจาก env (DB_PATH, UPLOAD_DIR, CORS_ORIGINS, ADMIN_SECRET) + สร้างโฟลเดอร์ uploads
├── db.py              # ตัวช่วยเชื่อม SQLite: get_db / db_cursor / init_db
├── schema.sql         # สคีมาฐานข้อมูล 7 ตาราง (idempotent — ใช้ CREATE TABLE IF NOT EXISTS)
├── seed.py            # ใส่ข้อมูลตัวอย่างสำหรับ dev (rooms)
├── requirements.txt   # dependency ฝั่ง Python
├── routers/           # กลุ่ม endpoint แยกตามโดเมน (หนึ่งไฟล์ต่อโดเมน)
│   ├── __init__.py    # ทำเครื่องหมายเป็น package (ไฟล์ว่าง)
│   ├── auth.py        # /admin — ล็อกอินแอดมิน (stub)
│   ├── people.py      # /people — อาจารย์/นักศึกษา
│   ├── works.py       # /works — ผลงาน
│   ├── news.py        # /news — ข่าวสาร
│   ├── schedule.py    # /schedule — ตารางสอน/สอบ
│   ├── rooms.py       # /rooms — ห้อง CE
│   └── internship.py  # /internship — หัวข้อฝึกงาน
└── static/
    └── uploads/       # เก็บรูปที่อัปโหลด เสิร์ฟผ่าน /uploads
```

---

## ลำดับการทำงานของ request

```
เบราว์เซอร์ / ส่วนหน้า Next.js
      │  fetch (lib/api.ts)
      ▼
FastAPI (main.py: app)
      │  วิ่งผ่าน CORSMiddleware → เท route เข้า router ที่ลงทะเบียนไว้
      ▼
routers/<domain>.py      เช่น routers/people.py
      │  เรียก db.db_cursor() → เปิด SQLite connection
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
- **เดินสาย middleware:** `CORSMiddleware` ใช้ `CORS_ORIGINS` จาก config
- **เมานต์ static:** `app.mount("/uploads", StaticFiles(...))` ที่ `UPLOAD_DIR`
- **ลงทะเบียน router:** ลูป `for r in (people, works, news, schedule, auth, rooms, internship)` เรียก `app.include_router(r.router)`
- **startup hook:** `@app.on_event("startup")` เรียก `init_db()` เพื่อสร้างตารางอัตโนมัติ
- **health check:** `GET /health` คืน `{"status":"ok"}`
- *ผู้เรียก:* uvicorn (`uvicorn main:app --app-dir server`)

### `config.py`
รวมค่าตั้งทั้งหมด อ่านจาก env มี fallback
- `BASE_DIR` — โฟลเดอร์เบสของฝั่งเซิร์ฟเวอร์
- `DB_PATH` — ตำแหน่งไฟล์ SQLite (ค่ามาตรฐาน `server/ce50.db`)
- `UPLOAD_DIR` — โฟลเดอร์รูป (ค่ามาตรฐาน `server/static/uploads`) พร้อม `mkdir(parents=True, exist_ok=True)`
- `CORS_ORIGINS` — list ของ origin ที่อนุญาต แยกด้วยจุลภาค
- `ADMIN_SECRET` — secret สำหรับยืนยันแอดมิน
- *ผู้เรียก:* `main.py`, `db.py`

### `db.py`
ชั้นเชื่อม SQLite ใช้ `sqlite3` มาตรฐาน (ไม่มี ORM)
- `get_db()` — เปิด connection ตั้ง `row_factory = Row` (เข้าถึงคอลัมน์แบบ dict) และเปิด `PRAGMA foreign_keys = ON`
- `db_cursor()` — context manager: เปิด conn → yield → commit → close (พร้อม try/finally)
- `init_db()` — อ่าน `schema.sql` แล้ว `executescript` สร้างตาราง
- `__main__`: รัน `python db.py` ได้ตรงๆ เพื่อสร้างตาราง
- *ผู้เรียก:* `main.py` (startup), `seed.py`, และ router ทุกตัวที่จะใช้งานจริง

### `schema.sql`
สคีมา 7 ตาราง ทำงานร่วมกับ `db.init_db()` ดูรายละเอียดในส่วน **อ้างอิงสคีมา** ด้านล่าง

### `seed.py`
ใส่ข้อมูลตัวอย่างสำหรับ dev ปัจจุบันเฉพาะ `rooms` (113, Server Room)
- ใช้ `INSERT OR IGNORE` ป้องกันซ้ำ
- รัน: `python seed.py` (หลัง `python db.py`)
- *ผู้เรียก:* ผู้พัฒนาเท่านั้น

### `requirements.txt`
- `fastapi`, `uvicorn[standard]` — เฟรมเวิร์ก + เซิร์ฟเวอร์
- `python-multipart` — รองรับ form/upload
- `passlib[bcrypt]`, `pyjwt` — สำหรับ hash รหัสผ่าน + JWT (เตรียมไว้ให้ `auth.py` ใช้)

### `routers/`
แต่ละไฟล์สร้าง `APIRouter(prefix="/<domain>", tags=["<domain>"])` แล้วนิยาม endpoint
- ทุกไฟล์ import โดย `main.py` แล้ว `include_router`
- รูปแบบเดียวกันทุกไฟล์ → ดูตาราง mapping ด้านล่าง

### `static/uploads/`
โฟลเดอร์เก็บรูปที่อัปโหลด `config.py` สร้างให้อัตโนมัติ เสิร์ฟผ่าน `/uploads`

---

## ตาราง mapping: router ↔ ตาราง ↔ type ส่วนหน้า

| Router (ไฟล์) | Endpoint | ตาราง SQLite | Type ฝั่งหน้า (`lib/types.ts`) | query param |
|--------------|----------|--------------|-------------------------------|-------------|
| `people.py` | `GET /people/teachers` | `teachers` | `Teacher` | — |
| `people.py` | `GET /people/students` | `students` | `Student` | `year` ⚠️ |
| `works.py` | `GET /works` | `works` | `Work` | `year` |
| `news.py` | `GET /news` | `news_items` | `NewsItem` | `category` |
| `schedule.py` | `GET /schedule` | `schedules` | `Schedule` | `kind`, `year` |
| `rooms.py` | `GET /rooms` | `rooms` | `Room` | — |
| `internship.py` | `GET /internship` | `internship_topics` | `InternshipTopic` | `host_branch` |
| `auth.py` | `POST /admin/login` | `admins` | (ยังไม่มี) | — |

> กฎทอง: เพิ่ม/แก้คอลัมน์ใน `schema.sql` แล้ว **ต้องอัปเดต** type ฝั่งหน้าให้ตรง ไม่งั้น type drift

---

## อ้างอิงสคีมา (`schema.sql`)

7 ตาราง, ทุกตารางมี `id` (PK auto) + `created_at`/`updated_at` อัตโนมัติ

| ตาราง | คอลัมน์เด่น | หมายเหตุ |
|-------|-----------|---------|
| `teachers` | `name_th`, `name_en`, `photo`, `advise_years` (JSON array), `contact` | `advise_years` เก็บเป็น string JSON เช่น `["1","2"]` |
| `students` | `student_id` (UNIQUE), `name_th`, `year` (1–4), `class_role`, `track`, `contact` | |
| `works` | `year`, `scope` (CHECK: branch/group/solo), `title`, `author_ids` (JSON array) | |
| `news_items` | `category` (CHECK: competition/scholarship/other), `body`, `link`, `published_at` | |
| `schedules` | `kind` (CHECK: class/exam), `year`, `term`, `payload` (JSON) | `payload` เก็บข้อมูลตารางเป็น JSON |
| `admins` | `year`, `username` (UNIQUE), `password_hash`, `role` | 1–3 คนต่อชั้นปี |
| `rooms` | `name`, `description`, `image` | เช่น "113", "Server Room" |
| `internship_topics` | `host_branch`, `title`, `description`, `year` | จัดกลุ่มตามสาขาที่ไปฝึก |

**คอนเวนชันที่ควรรู้:**
- `CHECK` constraint คุม enum ที่ระดับ DB (scope, category, kind)
- ฟิลด์ array (`advise_years`, `author_ids`) เก็บเป็น **string JSON** เพราะ SQLite ไม่มี native array — ฝั่งหน้าต้อง `JSON.parse`
- `CREATE TABLE IF NOT EXISTS` → รันซ้ำปลอดภัย (idempotent)

---

## แผนที่การเชื่อมต่อ (import)

```
main.py
  ├─ config     (CORS_ORIGINS, UPLOAD_DIR)
  ├─ db         (init_db)
  └─ routers.*  (auth, internship, news, people, rooms, schedule, works)

db.py
  └─ config     (DB_PATH)

seed.py
  └─ db         (db_cursor)

routers/<domain>.py   (เมื่อใช้งานจริง)
  └─ db         (db_cursor)
```

---

## เพิ่มโดเมนใหม่ (เช่น `/clubs`)

1. **`schema.sql`** — เพิ่ม `CREATE TABLE IF NOT EXISTS clubs (...)`
2. **`routers/clubs.py`** — สร้าง `router = APIRouter(prefix="/clubs", tags=["clubs"])` พร้อม endpoint
3. **`main.py`** — import ในบรรทัด `from routers import ...` แล้วเพิ่มเข้า tuple ในลูป `include_router`
4. **`lib/types.ts`** (ฝั่งหน้า) — เพิ่ม `interface Club`
5. **`lib/api.ts`** (ฝั่งหน้า) — เพิ่มเมธอด `clubs: () => get<Club[]>("/clubs")`

> หลัก: router หนึ่งไฟล์ = หนึ่งโดเมน อย่ารวมหลายโดเมนในไฟล์เดียว

---

## สถานะปัจจุบันและช่องว่างที่ทราบ

ส่วนหลังอยู่ในขั้น **scaffold** — โครงพร้อม ฟีเจอร์รอพัฒนา:

- **router ทุกตัวคือ stub** — คืน `[]` ยังไม่เชื่อม DB จริง ต้องเติม logic ในแต่ละ endpoint
- **`auth.py` login ยังไม่ implement** — มี `ponytail:` comment ทำเครื่องหมายไว้; dependency `passlib` + `pyjwt` ลงทะเบียนไว้แล้วรอใช้
- **type drift ที่ทราบ:**
  - `lib/api.ts` ส่ง query param `year` ให้ `/people/students` แต่ `routers/people.py:list_students()` ยังไม่รับพารามิเตอร์ → ต้องเพิ่ม `year: int | None = None`
  - `lib/api.ts` กำหนด type ของ news เป็น `never[]` ทั้งที่ควรเป็น `NewsItem[]` (ฝั่งหน้า)
- **ไม่มี upload endpoint จริง** — `UPLOAD_DIR` + mount `/uploads` พร้อม แต่ยังไม่มี router สำหรับอัปโหลดไฟล์
