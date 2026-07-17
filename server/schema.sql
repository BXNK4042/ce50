-- CE department site schema. SQLite. Run via db.init_db().

-- 1. บุคลากร — Personnel
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_th TEXT NOT NULL,
  name_en TEXT,
  photo TEXT,
  advise_years TEXT,            -- JSON array e.g. ["1","2","3"]
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT,
  photo TEXT,
  year INTEGER NOT NULL,         -- 1..4
  class_role TEXT,               -- ตำแหน่งในห้อง
  track TEXT,                    -- สายรหัส
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. ผลงาน — Works (branch / group / solo)
CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('branch','group','solo')),
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  author_ids TEXT,               -- JSON array of student ids
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. ข่าวสาร — News (competition / scholarship)
CREATE TABLE IF NOT EXISTS news_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('competition','scholarship','other')),
  body TEXT,
  link TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางสอน/สอบ — Schedule
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('class','exam')),
  year INTEGER NOT NULL,
  term INTEGER,
  payload TEXT NOT NULL,         -- JSON table data
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. ผู้ใช้งานระบบ — Users (including Admins & Writers)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'writer',    -- 'superadmin', 'admin', 'writer'
  year INTEGER NOT NULL DEFAULT 1, -- which year this user manages
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. ห้อง CE — Rooms (113, server room)
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,            -- e.g. "113", "Server Room"
  description TEXT,
  image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. ฝึกงาน — Internship topics (by host branch)
CREATE TABLE IF NOT EXISTS internship_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_branch TEXT NOT NULL,     -- สาขาที่ไปฝึก
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. วิดีโอ — Videos
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  year INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
