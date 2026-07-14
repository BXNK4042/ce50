# CE50 — เว็บไซต์สาขาวิศวกรรมคอมพิวเตอร์

เว็บไซต์ประชาสัมพันธ์และสารสนเทศสาขาวิศวกรรมคอมพิวเตอร์
รองรับ 2 ภาษา (ภาษาไทย / English) สร้างด้วย **Next.js 16** (ส่วนหน้า) +
**FastAPI** (ส่วนหลัง) + **SQLite** (ฐานข้อมูล)

## ✨ ฟีเจอร์

| # | ส่วน | รายละเอียด |
|---|------|-----------|
| 1 | บุคลากร | อาจารย์ (ชื่อ, เป็นที่ปรึกษาปีใด, รูป) และนักศึกษา (ชื่อ, รหัส, รูป, ตำแหน่งในห้อง, สายรหัส, ติดต่อ) |
| 2 | ผลงาน | ผลงานของแต่ละชั้นปี — สาขา / กลุ่ม / เดี่ยว |
| 3 | ข่าวสาร | ข่าวการแข่งขันและทุน แบ่งตามหมวด |
| 4 | ตารางสอน/สอบ | ตารางเรียนและสอบ |
| 5 | ผู้ดูแลระบบ | รหัสแอดมิน 1–3 คนต่อชั้นปี |
| 6 | ห้อง CE | เช่น ห้อง 113, ห้องเซิร์ฟเวอร์ |
| 7 | ฝึกงาน | หัวข้อฝึกงาน จัดกลุ่มตามสาขาที่ไปฝึก |

## 🧱 เทคโนโลยีที่ใช้

- **ส่วนหน้า:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- **ส่วนหลัง:** Python · FastAPI · Uvicorn
- **ฐานข้อมูล:** SQLite
- **ระบบหลายภาษา:** routing `app/[lang]` + ไฟล์พจนานุกรม JSON (ไม่ใช้ไลบรารีเสริม)

## 📁 โครงสร้างโปรเจกต์

```
ce50/
├── app/
│   └── [lang]/                 # segment ภาษา (th | en)
│       ├── dictionaries/       # th.json, en.json
│       ├── people/ works/ news/
│       ├── schedule/ rooms/ internship/
│       └── admin/
├── components/{ui,layout}/
├── lib/{api.ts,types.ts}       # typed client เรียก FastAPI
├── proxy.ts                    # เปลี่ยนเส้นทางตามภาษา (Next.js 16)
├── server/                     # ส่วนหลัง FastAPI
│   ├── main.py  db.py  schema.sql  seed.py
│   ├── routers/                # หนึ่งไฟล์ต่อโดเมน
│   └── static/uploads/         # รูปภาพที่เสิร์ฟ
└── .env.example
```

## 🚀 เริ่มต้นใช้งาน

### สิ่งที่ต้องมี
- Node.js ≥ 20
- Python ≥ 3.12

### ส่วนหน้า
```bash
npm install
cp .env.example .env.local      # ตั้ง NEXT_PUBLIC_API_URL
npm run dev                     # → http://localhost:3000  (/ จะถูกเปลี่ยนเส้นทางไป /th)
```

### ส่วนหลัง
```bash
python3 -m venv .venv
.venv/bin/pip install -r server/requirements.txt
.venv/bin/uvicorn main:app --reload --app-dir server   # → http://localhost:8000/docs
```

## ⚙️ ตัวแปรสภาพแวดล้อม

| ตัวแปร | ฝั่ง | หน้าที่ |
|--------|------|---------|
| `NEXT_PUBLIC_API_URL` | หน้า | URL หลักของ FastAPI (ค่ามาตรฐาน `http://localhost:8000`) |
| `DB_PATH` | หลัง | ตำแหน่งไฟล์ SQLite (ค่ามาตรฐาน `server/ce50.db`) |
| `UPLOAD_DIR` | หลัง | โฟลเดอร์เก็บรูป (ค่ามาตรฐาน `server/static/uploads`) |
| `CORS_ORIGINS` | หลัง | origin ของส่วนหน้าที่อนุญาต |
| `ADMIN_SECRET` | หลัง | secret สำหรับยืนยันตัวแอดมิน |

## 🗄️ ฐานข้อมูล

Schema อยู่ที่ `server/schema.sql` (สร้างอัตโนมัติตอนเริ่มระบบผ่าน `db.init_db()`)
เริ่มตารางใหม่ / ใส่ข้อมูลตัวอย่าง:

```bash
.venv/bin/python --app-dir server db.py    # สร้างตาราง
.venv/bin/python --app-dir server seed.py  # ใส่ข้อมูลตัวอย่าง
```

## 📜 คำสั่ง

**ส่วนหน้า** — `npm run dev` · `npm run build` · `npm run start`
**ส่วนหลัง** — `uvicorn main:app --reload --app-dir server`

## 🔌 ภาพรวม API

| Method | Endpoint |
|--------|----------|
| GET | `/health` |
| GET | `/people/teachers`, `/people/students` |
| GET | `/works`, `/news`, `/schedule`, `/rooms`, `/internship` |
| POST | `/admin/login` |

เอกสาร Swagger UI ที่ `/docs`

## 🗺️ Roadmap

สถานะปัจจุบัน: โครงสร้าง (scaffold) พร้อม ทุกส่วนรอพัฒนาฟีเจอร์

- [ ] 1. บุคลากร — CRUD อาจารย์/นักศึกษา + อัปโหลดรูป
- [ ] 2. ผลงาน — แสดงผลงานแยกตามชั้นปีและประเภท
- [ ] 3. ข่าวสาร — แยกหมวด การแข่งขัน/ทุน
- [ ] 4. ตารางสอน/สอบ — แสดงตารางแยกปี/เทอม
- [ ] 5. ผู้ดูแลระบบ — ล็อกอิน + จัดการแอดมินต่อชั้นปี
- [ ] 6. ห้อง CE — ข้อมูลห้อง 113/เซิร์ฟเวอร์รูม
- [ ] 7. ฝึกงาน — หัวข้อฝึกงานจัดกลุ่มตามสาขา

## ☁️ Deployment

**ส่วนหน้า (Next.js):** แนะนำ Vercel — เชื่อม repo แล้วตั้ง `NEXT_PUBLIC_API_URL`
ใน Environment Variables ของโปรเจกต์

**ส่วนหลัง (FastAPI):** ตัวเลือกที่แนะนำ
- **Render / Railway / Fly.io** — รัน `uvicorn main:app` ได้เลย พร้อม persistent volume ให้ `ce50.db` และ `static/uploads/`
- **VPS (เช่น DigitalOcean Droplet)** — รันผ่าน `systemd` หรือ `docker compose`
- **Docker** — สร้าง image จาก `python:3.12-slim` ติดตั้ง `server/requirements.txt` แล้ว expose port 8000

> หมายเหตุ: เนื่องจากใช้ SQLite ต้องมั่นใจว่าไฟล์ `.db` และ `uploads/` อยู่บน persistent storage มิฉะนั้นข้อมูลจะหายเมื่อ deploy ใหม่

## 🤝 Contributing

1. สร้าง branch ใหม่จาก `main` โดยใช้รูปแบบ `<type>/<scope>` เช่น
   `feature/people`, `fix/schedule-api`, `chore/readme`
2. เขียนโค้ดตามแนวทางที่มีอยู่ (TS strict, Python typing)
3. ตรวจสอบให้ผ่านก่อนเปิด PR:
   ```bash
   npm run build                                                      # ส่วนหน้า: typecheck + build
   .venv/bin/python -c "import sys; sys.path.insert(0,'server'); import main"   # ส่วนหลัง: import check
   ```
4. เปิด Pull Request อธิบายสิ่งที่เปลี่ยนแปลง และลิงก์ issue ที่เกี่ยวข้อง

## 📝 License

TBD
