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
  image TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางสอน/สอบ — Schedule (split: class grid + exam list)
CREATE TABLE IF NOT EXISTS class_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  term INTEGER NOT NULL DEFAULT 1,
  day TEXT NOT NULL CHECK (day IN ('monday','tuesday','wednesday','thursday','friday','saturday')),
  time_slot TEXT NOT NULL,            -- e.g. "09:00 - 10:00"
  code TEXT NOT NULL,
  name_en TEXT,
  name_th TEXT,
  room TEXT,
  instructor_en TEXT,
  instructor_th TEXT,
  description_en TEXT,
  description_th TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, term, day, time_slot)
);

CREATE TABLE IF NOT EXISTS exam_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  term INTEGER NOT NULL DEFAULT 1,
  code TEXT NOT NULL,
  name_en TEXT,
  name_th TEXT,
  date_raw TEXT,                      -- ISO yyyy-mm-dd or 9999-12-31 = outside schedule
  start_time TEXT,
  end_time TEXT,
  midterm_en TEXT,
  midterm_th TEXT,
  finals_en TEXT,
  finals_th TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, term, code)
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

-- 7. ฝึกงาน — Student internship records

CREATE TABLE IF NOT EXISTS internship_students (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(student_id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position_th TEXT NOT NULL,
  position_en TEXT,
  period_th TEXT,
  period_en TEXT,
  summary_th TEXT,
  summary_en TEXT,
  description_th TEXT,
  description_en TEXT,
  tech TEXT,
  advice_th TEXT,
  advice_en TEXT,
  stipend_th TEXT,
  stipend_en TEXT,
  welfare_th TEXT,
  welfare_en TEXT,
  rating REAL DEFAULT 5.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

