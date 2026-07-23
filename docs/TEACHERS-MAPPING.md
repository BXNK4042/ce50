# Teacher Database & UI Mapping Architecture

## Overview
This document describes how teacher/faculty records map from the SQLite database to the API, Next.js page components, and UI components (`PeopleSlider` and `TeachersGrid`).

```
[SQLite DB: teachers] ──(FastAPI: /people/teachers)──> [lib/api.ts] ──> [Page Components] ──> [UI Components]
```

---

## 1. Database Schema (`teachers` Table)

Defined in `server/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_th TEXT NOT NULL,
  name_en TEXT,
  photo TEXT,
  advise_years TEXT,            -- JSON array e.g. '["1","2"]'
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Backend & API Layer

- **FastAPI Endpoint**: `GET /people/teachers` in `server/routers/people.py`
  - Queries `SELECT * FROM teachers ORDER BY id ASC`
- **Frontend API Client**: `api.teachers()` in `lib/api.ts`
  - Returns `Promise<Teacher[]>` defined in `lib/types.ts`
- **Data Transformation**:
  - `app/[lang]/people/teachers/page.tsx` parses `advise_years` JSON string into `string[]` before passing data to `TeachersGrid`.

---

## 3. Seeded Database Records (`server/seed.py`)

| `id` | `name_th` | `name_en` | `photo` | `advise_years` | `contact` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | อาจารย์อรรถศาสตร์ นาคเทวัญ | Athasart Narkthewan | `/image/professors/athasart.webp` | `["1"]` | `athasart.n@ce.ac.th` |
| **2** | ดร.รัตติกร สมบัติแก้ว | Rattikorn Sombutkaew | `/image/professors/rattikorn.webp` | `["2"]` | `rattikorn.s@ce.ac.th` |
| **3** | อาจารย์นภัสรพี สิทธิวัจน์ | Pisakorn Sittiwatjana | `/image/professors/pisakorn.webp` | `["3"]` | `pisakorn.s@ce.ac.th` |
| **4** | ว่าที่ร้อยตรี ศิลา ศิริมาสกุล | Silar Sirimasakul | `/image/professors/silar.webp` | `["4"]` | `silar.s@ce.ac.th` |
| **5** | อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช | Sakawkarn Piyawitwanich | `/image/professors/sakawkarn.webp` | `["1", "2"]` | `sakawkarn.p@ce.ac.th` |
| **6** | นายจตุรงค์ เกตุนิมิต | Jaturong Katenimit | `/image/professors/jaturong.webp` | `[]` | `jaturong.k@ce.ac.th` |

---

## 4. UI Component Mapping

### A. `components/layout/people-slider.tsx` (Homepage Carousel)
Used in `app/[lang]/page.tsx` via `<PeopleSlider people={teachers} />`.

- `person.photo` ➔ Background portrait (`<img>` src)
- `person.name_th` / `person.name_en` ➔ Card title (`<h3>`)
- `person.contact` ➔ Footer text

### B. `app/[lang]/people/teachers/teachers-grid.tsx` (Faculty Page Grid)
Used in `app/[lang]/people/teachers/page.tsx`. Maps `teacher.id` to custom interactive behaviors:

- **ID 1 (Athasart)**: Click triggers 3D spinning modal overlay with glowing red eye effect.
- **ID 2 (Rattikorn)**: Click triggers interactive card flip modal between Rattikorn & "ป้าจุ๋ม" (`/image/professors/rattikorn-alt.webp`).
- **IDs 3, 4, 5 (Pisakorn, Silar, Sakawkarn)**: Hover cross-fades default portrait with alternative image (`*-alt.webp`).
- **ID 6 (Jaturong)**: Hover changes badge from "Computer Technical Officer" to 'ผู้บริหารร้าน "นิยมชา"' with background `/backgrounds/niyomcha.webp`.
