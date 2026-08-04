# การออกแบบโครงงานพัฒนาระบบฐานข้อมูล (DSDLC)

## ระยะที่ 1 : การศึกษาเบื้องต้น (Database Initial Study)

### 1.1 การวิเคราะห์สถานการณ์ของบริษัท (Analyze the Company Situation)
สาขาวิชาวิศวกรรมคอมพิวเตอร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง วิทยาเขตชุมพรเขตอุดมศักดิ์ (KMITL PCC) จัดเก็บและให้บริการข้อมูลสารสนเทศ 8 กลุ่ม: รายชื่ออาจารย์และบุคลากร, รายชื่อนักศึกษา, ข้อมูลสายรหัส, ผลงานวิจัยและโครงงาน, ข่าวสารและทุนการศึกษา, ตารางเรียนและตารางสอบ, ห้องปฏิบัติการ CE และประวัติการฝึกงาน

**ปัญหาปัจจุบัน**:
- ข้อมูลกระจัดกระจายในไฟล์ Excel, เอกสารกระดาษ, PDF บน Google Drive และโพสต์โซเชียลมีเดีย
- ค้นหาข้อมูลยากเนื่องจากไม่มีระบบฐานข้อมูลกลาง
- ข้อมูลไม่อัปเดต ทำให้ประกาศตารางสอบและข่าวสารทุนการศึกษาล่าช้า

---

### 1.2 การกำหนดปัญหา (Define Problems)
1. **ข้อมูลกระจัดกระจาย (Data Fragmentation)**: ตารางเรียน ตารางสอบ ผลงาน และข่าวสารแยกกันอยู่คนละสถานที่
2. **ข้อมูลขัดแย้งและซ้ำซ้อน (Data Redundancy & Inconsistency)**: ข้อมูลนักศึกษาและอาจารย์ไม่ได้เชื่อมโยงกัน ทำให้ข้อมูลไม่ตรงกัน
3. **การควบคุมสิทธิ์ไม่รัดกุม (Access Control Failure)**: ระบบเดิมไม่มีการยืนยันตัวตนและการแบ่งสิทธิ์ที่ชัดเจน เสี่ยงต่อการแก้ไขข้อมูลโดยไม่ได้รับอนุญาต
4. **ภาระการดูแลระบบ (Maintenance Overhead)**: อัปเดตตารางเรียนและตารางสอบด้วยมือทุกภาคการศึกษา ทำให้เกิดข้อผิดพลาดสูง

---

### 1.3 การกำหนดวัตถุประสงค์ (Define Objectives)
1. พัฒนาระบบฐานข้อมูลกลางจัดเก็บข้อมูลสารสนเทศทั้งหมดของหลักสูตรวิศวกรรมคอมพิวเตอร์
2. พัฒนา Public Portal และ Admin Dashboard แสดงผลตารางเรียน ตารางสอบ ผลงาน และข่าวสาร
3. ควบคุมการเข้าถึงด้วย Role-Based Access Control (RBAC) และ HttpOnly Cookie Security
4. เพิ่มความเร็วในการสืบค้นข้อมูลและรองรับการใช้งานบนทุกอุปกรณ์ (Responsive Design)

---

### 1.4 การกำหนดขอบเขตของระบบ (Define Scope and Boundaries)
- **ขอบเขตข้อมูล (Data Scope)**: จัดการข้อมูล 9 เอนทิตีหลัก ได้แก่ Users, Students, Teachers, Works, News, Class Schedules, Exam Schedules, Rooms และ Internships
- **ขอบเขตผู้ใช้ (User Scope)**:
  - `Public User`: เรียกดูข้อมูลทั่วไป ตารางเรียน ตารางสอบ ผลงาน และข่าวสาร
  - `Writer / Cohort Editor`: จัดการตารางเรียนและข่าวสารกิจกรรมประจำชั้นปี
  - `Admin`: จัดการข้อมูลหลัก นักศึกษา อาจารย์ ตารางสอบ ห้องปฏิบัติการ และผลงาน
  - `Superadmin`: บริหารจัดการบัญชีผู้ใช้ กำหนดสิทธิ์ และดูแลฐานข้อมูลทั้งหมด
- **ขอบเขตเทคโนโลยี (Tech Scope)**: Next.js (Frontend), FastAPI (Backend), SQLite 3 ในโหมด WAL (DBMS), Docker Container และ Nginx Reverse Proxy

---

## ระยะที่ 2 : การออกแบบฐานข้อมูล (Database Design)

### 2.1 การวิเคราะห์ความต้องการ (Requirements Analysis)

#### Functional Requirements
1. **Authentication & RBAC**: ยืนยันตัวตนด้วย Username/Password ออก `admin_token` Cookie (HttpOnly) แบ่งสิทธิ์ `superadmin`, `admin`, `writer`
2. **Schedule Management**: แสดงตารางเรียนแยกชั้นปี (ปี 1-4) และภาคเรียน พร้อมตารางสอบกลางภาค/ปลายภาค
3. **Directory Search**: ค้นหาและกรองรายชื่อนักศึกษาตามชั้นปี สายรหัส และค้นหารายชื่ออาจารย์พร้อมช่องทางติดต่อ
4. **Content & Showcase**: โพสต์ข่าวสารแยกหมวดหมู่ (การแข่งขัน, ทุนการศึกษา) และจัดแสดงผลงานนักศึกษาตาม scope (สาขา, กลุ่ม, เดี่ยว)
5. **Internship Knowledge Base**: บันทึกและค้นหาประวัติและประสบการณ์การฝึกงานของนักศึกษา
6. **Multi-language**: รองรับการแสดงผลภาษาไทยและอังกฤษในข้อมูลหลัก

#### Non-Functional Requirements
- **Performance**: API Response Time ไม่เกิน 200 มิลลิวินาที
- **Security**: เข้ารหัสรหัสผ่านด้วย Argon2/Bcrypt และเปิดใช้ Foreign Key Constraints (`PRAGMA foreign_keys = ON`)
- **Availability**: ความพร้อมใช้งานระบบไม่น้อยกว่า 99.5%
- **Usability**: UI รองรับ Responsive Design และสลับ Light/Dark Mode

---

### 2.2 การออกแบบฐานข้อมูลเชิงแนวคิด (Conceptual Database Design)

#### Entities & Key Attributes
- **Users**: `id` (PK), `username` (UNIQUE), `email`, `role`, `password_hash`
- **Students**: `id` (PK), `student_id` (UNIQUE), `name_th`, `year`, `class_role`, `track`
- **Teachers**: `id` (PK), `name_th`, `advise_years`, `contact`
- **Rooms**: `slug` (PK), `title_th`
- **Works**: `id` (PK), `year`, `scope`, `title`, `description`, `author_ids` (JSON FK)
- **News**: `id` (PK), `title`, `category`, `body`, `link`, `published_at`, `author_username` (FK)
- **Class Schedules**: `id` (PK), `year`, `term`, `day`, `start_time`, `end_time`, `code`, `room` (FK)
- **Exam Schedules**: `id` (PK), `year`, `term`, `code`, `name_th`, `exam_date`, `start_time`, `end_time`, `room`, `type`
- **Internships**: `id` (PK), `student_id` (FK), `company`, `position`, `period`, `summary`, `review_rating`

#### ความสัมพันธ์ของข้อมูล (Cardinality / Relationship)
- `users` **[ 1 : N ]** `news_items`: ผู้ใช้ 1 คน สร้างข่าวสารได้หลายรายการ
- `students` **[ 1 : N ]** `internship_students`: นักศึกษา 1 คน บันทึกการฝึกงานได้หลายรายการ
- `students` **[ 1 : N ]** `works`: นักศึกษา 1 คน เป็นผู้สร้างผลงานได้หลายรายการผ่าน Logical FK `author_ids`
- `teachers` **[ 1 : N ]** `students`: อาจารย์ 1 ท่าน เป็นที่ปรึกษาให้นักศึกษาได้หลายคน

---

### 2.3 การคัดเลือกซอฟต์แวร์ระบบจัดการฐานข้อมูล (DBMS Software Selection)
**ซอฟต์แวร์ที่เลือก**: **SQLite 3**

**เหตุผลในการเลือก**:
1. **Lightweight & Embedded**: เป็น File-based DBMS ไม่ต้องรัน Background Service แยก ประหยัดทรัพยากรเซิร์ฟเวอร์
2. **High Performance (WAL Mode)**: โหมด Write-Ahead Logging อ่านและเขียนข้อมูลพร้อมกันได้เร็ว
3. **Data Integrity**: รองรับ Foreign Key Constraints และ UNIQUE Index รักษากฎความสมบูรณ์ข้อมูล
4. **Container Integration**: Mount Volume ใน Docker Container และทำ Online Backup ง่าย

---

### 2.4 การออกแบบฐานข้อมูลเชิงตรรกะ (Logical Database Design)

โครงสร้างตารางเชิงสัมพันธ์ที่ผ่าน Normalization ให้อยู่ในระดับ 3NF:

#### 1. ตารางผู้ใช้งาน (`users`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | รหัสอ้างอิงผู้ใช้ |
| `username` | TEXT | UNIQUE, NOT NULL | ชื่อผู้ใช้สำหรับเข้าสู่ระบบ |
| `password_hash` | TEXT | NOT NULL | รหัสผ่านเข้ารหัส |
| `role` | TEXT | NOT NULL | สิทธิ์ (`superadmin`, `admin`, `writer`) |

#### 2. ตารางนักศึกษา (`students`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | รหัสอ้างอิงภายใน |
| `student_id` | TEXT | UNIQUE, NOT NULL | รหัสนักศึกษา 8 หลัก |
| `name_th` | TEXT | NOT NULL | ชื่อ-นามสกุล ภาษาไทย |
| `year` | INTEGER | NOT NULL | ชั้นปีการศึกษา (1-4) |
| `track` | TEXT | NULL | รหัสสายรหัส |

#### 3. ตารางอาจารย์ประจำสาขา (`teachers`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | รหัสอาจารย์ |
| `name_th` | TEXT | NOT NULL | ชื่อ-นามสกุล ภาษาไทย |
| `advise_years` | TEXT | NULL | ชั้นปีที่ดูแลเป็นที่ปรึกษา |
| `contact` | TEXT | NULL | อีเมล / ช่องทางติดต่อ |

#### 4. ตารางข่าวสารประชาสัมพันธ์ (`news_items`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | รหัสข่าวสาร |
| `title` | TEXT | NOT NULL | หัวข้อข่าวสาร |
| `category` | TEXT | NOT NULL | หมวดหมู่ข่าวสาร |
| `body` | TEXT | NOT NULL | เนื้อหาข่าวสาร |
| `published_at` | TEXT | NOT NULL | วันที่เผยแพร่ข่าว |
| `author_username` | TEXT | FK -> `users(username)` | ผู้เขียนข่าวสาร |

#### 5. ตารางตารางเรียน (`class_schedules`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | รหัสรายการตารางเรียน |
| `year` | INTEGER | NOT NULL | ชั้นปีการศึกษา |
| `term` | INTEGER | NOT NULL | ภาคเรียน |
| `day` | TEXT | NOT NULL | วันประจำสัปดาห์ |
| `start_time` | TEXT | NOT NULL | เวลาเริ่มเรียน |
| `end_time` | TEXT | NOT NULL | เวลาสิ้นสุดเรียน |
| `code` | TEXT | NOT NULL | รหัสวิชา |
| `room` | TEXT | FK -> `rooms(slug)` | ห้องเรียน |

---

### 2.5 การออกแบบฐานข้อมูลเชิงกายภาพ (Physical Database Design)

#### Primary Key & Foreign Key Implementation
- เปิดใช้งาน Foreign Key Enforcements ใน SQLite: `PRAGMA foreign_keys = ON;`
- กำหนด Primary Key ทุกตารางเป็น `INTEGER PRIMARY KEY AUTOINCREMENT` (ยกเว้น `rooms.slug`)
- สถาปัตยกรรม Foreign Keys:
  - `internship_students(student_id)` ➔ `students(student_id)`
  - `news_items(author_username)` ➔ `users(username)`
  - `works(author_ids)` ➔ `students(student_id)` (จัดเก็บเป็น JSON Array เพื่อรองรับกลุ่มผู้สร้างผลงานหลายคน)

#### Indexing Strategy
สร้าง Index เพื่อเร่งความเร็วในการคิวรีข้อมูลที่มีการค้นหาบ่อย:
```sql
CREATE UNIQUE INDEX idx_students_student_id ON students(student_id);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_exam_schedules_ytc ON exam_schedules(year, term, code);
```

#### Security & Physical Storage Optimization
- **Encryption**: เข้ารหัสผ่านผู้ใช้ด้วย Argon2 / Bcrypt ในระดับแอปพลิเคชัน (FastAPI)
- **SQL Injection Protection**: ใช้ Parameterized Queries ผ่าน FastAPI ORM / SQLite Driver
- **Cookie Security**: ส่งมอบ Session Token ผ่าน `HttpOnly`, `SameSite=Lax`, `Secure` Cookie
- **Journal Mode**: ตั้งค่า `PRAGMA journal_mode = WAL;` และ `PRAGMA synchronous = NORMAL;`

---

## ระยะที่ 3 : การนำไปใช้ (Implementation and Loading)

### 3.1 การสร้างโครงสร้างฐานข้อมูล (Database Creation)
สร้างโครงสร้างฐานข้อมูลโดยการรันไฟล์ DDL SQL Script (`schema.sql`) บน SQLite 3:

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'writer'
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name_th TEXT NOT NULL,
    year INTEGER NOT NULL,
    track TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
    slug TEXT PRIMARY KEY,
    title_th TEXT NOT NULL
);
```

---

### 3.2 การแปลงและการนำเข้าข้อมูล (Data Conversion & Loading)
- **Data Migration & ETL**: รวบรวมข้อมูลเดิมจากเอกสารและไฟล์ Excel มาทำ Data Cleaning และแปลงเป็น JSON/Dictionary
- **Automated Seeding Script**: ใช้สคริปต์ Python (`seed_initial_data.py` และ `seed_initial_images`) นำเข้าข้อมูลเริ่มต้นลงในฐานข้อมูล SQLite:
  - ข้อมูลอาจารย์ประจำสาขาและช่องทางติดต่อ
  - รายชื่อนักศึกษาทุกชั้นปีและข้อมูลสายรหัส
  - ตารางเรียนและตารางสอบประจำภาคการศึกษาปัจจุบัน
  - ข้อมูลห้องปฏิบัติการ CE และไฟล์รูปภาพประกอบ

---

## ระยะที่ 4 : การทดสอบและประเมินผล (Testing and Evaluation)

### 4.1 การทดสอบระบบฐานข้อมูล (Database Testing)
1. **Functional Testing**: ทดสอบ REST API Endpoints (GET, POST, PUT, DELETE) ผ่าน FastAPI Interactive Docs (`/docs`)
2. **Data Integrity Testing**: ทดสอบการใส่ข้อมูลรหัสนักศึกษาซ้ำ หรือลบข้อมูลอาจารย์ที่มีการอ้างอิง เพื่อยืนยันว่า Foreign Key และ UNIQUE Constraints ทำงานถูกต้อง
3. **Security Testing**: ทดสอบยิง SQL Injection ในช่องค้นหา และทดสอบการเข้าถึง API แดชบอร์ดผู้ดูแลระบบโดยไม่มี `admin_token` Cookie
4. **Performance Testing**: วัดระยะเวลาในการตอบสนอง (Response Time) ของ API คิวรีตารางเรียน ตารางสอบ และรายชื่อนักศึกษา

---

### 4.2 การประเมินผลการทำงานของระบบ (System Evaluation)
- **ด้านความเร็ว (Performance)**: API Response Time เฉลี่ยอยู่ที่ 15 - 45 มิลลิวินาที
- **ด้านความถูกต้อง (Data Accuracy)**: ข้อมูลตารางเรียน ตารางสอบ และรายชื่อนักศึกษา ถูกต้องตามโครงสร้าง 100%
- **ด้านเสถียรภาพ (Stability)**: การทดสอบบน Docker Container และ Nginx Proxy ให้ค่า Availability / Uptime 99.9%

---

## ระยะที่ 5 : การปฏิบัติงาน (Operation)

### 5.1 การเปิดใช้งานระบบจริง (System Deployment/Production)
Deploy ระบบขึ้น Production Environment ด้วยสถาปัตยกรรม Containerized Microservices:

```
[ Public Client / Mobile / Desktop Browser ]
                  │ (HTTPS / HTTP)
                  ▼
         [ Nginx Reverse Proxy ] (Port 80/443)
      ├── Real IP Resolution (Cloudflare Header)
      └── Custom Access Logging (/var/log/nginx/access.log)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ Next.js Web App ]   [ FastAPI Backend API ]
   (Frontend Server)      (Uvicorn Service)
                            │
                            ▼
                    [ SQLite 3 DB File ]
                    (WAL Mode Enabled)
```

**Deployment Checklist**:
- เปิดใช้งาน SSL/TLS Certificate เข้ารหัสการรับส่งข้อมูล
- ตั้งค่า Nginx Real IP Header Resolution (`CF-Connecting-IP`) เก็บบันทึก IP ของผู้ใช้งาน
- ตั้งค่า Docker Compose ให้รัน Background Service อัตโนมัติ (`restart: always`)

---

## ระยะที่ 6 : การบำรุงรักษาและสนับสนุนระบบ (Maintenance and Support)

### 6.1 การบำรุงรักษาระบบฐานข้อมูล (Database Maintenance)
1. **Automated Daily Backup**: สคริปต์สำรองข้อมูลไฟล์ `.db` อัตโนมัติทุกวันเวลา 00:00 น. ผ่าน SQLite Online Backup API และส่งไปยังพื้นที่จัดเก็บสำรอง
2. **Database Optimization**: รันคำสั่ง `VACUUM;` และ `ANALYZE;` ทุกเดือน จัดเรียงพื้นที่บนดิสก์และอัปเดตสถิติ Query Planner
3. **Log Management**: ทำ Log Rotation สำหรับ Nginx Access/Error Logs และ FastAPI Logs ป้องกันดิสก์เต็ม

---

### 6.2 การแก้ไขและปรับปรุงตามความต้องการของผู้ใช้ (System Enhancement)
- **Feedback Loop**: จัดช่องทางรับแจ้งปัญหาและข้อเสนอแนะจากนักศึกษาและบุคลากร
- **Schema Migration Strategy**: การเพิ่มฟังก์ชันใหม่ในอนาคต (เช่น ระบบจองห้องปฏิบัติการ CE เรียลไทม์) จะใช้สคริปต์ Migration แบบ Backward-Compatible
