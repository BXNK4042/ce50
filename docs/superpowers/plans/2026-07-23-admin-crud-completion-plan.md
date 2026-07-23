# Admin CRUD & Feature Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully implement all missing admin CRUD features, sub-directory image uploaders, visual schedule editors (class grid + exam table), complete form fields, and new Internship Topics & Videos modules in the Central Admin Dashboard.

**Architecture:** Extend FastAPI routers with `check_admin_auth` year scoping, create reusable React components (`ImageUploader`, `ClassScheduleGrid`, `ExamScheduleTable`, `StudentPicker`), and integrate them cleanly into `app/[lang]/admin/page.tsx`.

**Tech Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS), FastAPI (Python 3.12, SQLite).

## Global Constraints
- Target workspace: `/home/bank/ce50`
- Image sub-directories: `server/image/professors`, `server/image/students`, `server/image/works`, `server/image/rooms`
- All write operations protected by `check_admin_auth` with `required_year`

---

### Task 1: Backend Routers for Internship Topics & Videos

**Files:**
- Create: `server/routers/internship.py`
- Create: `server/routers/videos.py`
- Modify: `server/main.py:10-42`

**Interfaces:**
- Consumes: `get_db` from `db.py`, `check_admin_auth` from `dependencies.py`
- Produces: `GET/POST/PUT/DELETE /internship` and `GET/POST/PUT/DELETE /videos`

- [ ] **Step 1: Create `server/routers/internship.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin

router = APIRouter(prefix="/internship", tags=["internship"])


class InternshipCreate(BaseModel):
    host_branch: str
    title: str
    description: str | None = None
    year: int = 3


class InternshipUpdate(BaseModel):
    host_branch: str | None = None
    title: str | None = None
    description: str | None = None
    year: int | None = None


@router.get("/")
def list_internships(year: int = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if year is not None:
        cursor.execute("SELECT * FROM internship_topics WHERE year = ? ORDER BY id DESC", (year,))
    else:
        cursor.execute("SELECT * FROM internship_topics ORDER BY id DESC")
    topics = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return topics


@router.post("/")
def create_internship(payload: InternshipCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=payload.year, min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO internship_topics (host_branch, title, description, year) VALUES (?, ?, ?, ?)",
                (payload.host_branch, payload.title, payload.description, payload.year),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_internship(id: int, payload: InternshipUpdate, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM internship_topics WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Topic not found")
        existing_dict = dict(existing)

    check_admin_auth(admin, required_year=existing_dict["year"], min_role="admin")
    update_dict = payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE internship_topics SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "Topic updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_internship(id: int, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT year FROM internship_topics WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Topic not found")

    check_admin_auth(admin, required_year=existing["year"], min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM internship_topics WHERE id = ?", (id,))
            return {"status": "success", "message": "Topic deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 2: Create `server/routers/videos.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from db import db_cursor, get_db
from dependencies import check_admin_auth, get_current_admin

router = APIRouter(prefix="/videos", tags=["videos"])


class VideoCreate(BaseModel):
    title: str
    description: str | None = None
    file_path: str
    thumbnail: str | None = None
    category: str | None = None
    year: int = 1


class VideoUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    file_path: str | None = None
    thumbnail: str | None = None
    category: str | None = None
    year: int | None = None


@router.get("/")
def list_videos(year: int = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if year is not None:
        cursor.execute("SELECT * FROM videos WHERE year = ? ORDER BY id DESC", (year,))
    else:
        cursor.execute("SELECT * FROM videos ORDER BY id DESC")
    vids = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return vids


@router.post("/")
def create_video(payload: VideoCreate, admin: dict = Depends(get_current_admin)):
    check_admin_auth(admin, required_year=payload.year, min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO videos (title, description, file_path, thumbnail, category, year) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (payload.title, payload.description, payload.file_path, payload.thumbnail, payload.category, payload.year),
            )
            return {"status": "success", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_video(id: int, payload: VideoUpdate, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Video not found")
        existing_dict = dict(existing)

    check_admin_auth(admin, required_year=existing_dict["year"], min_role="admin")
    update_dict = payload.dict(exclude_unset=True)
    if not update_dict:
        return {"status": "success", "message": "No changes made"}

    update_fields = [f"{key} = ?" for key in update_dict.keys()]
    params = list(update_dict.values())
    params.append(id)

    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE videos SET {', '.join(update_fields)} WHERE id = ?", params)
            return {"status": "success", "message": "Video updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_video(id: int, admin: dict = Depends(get_current_admin)):
    with db_cursor() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT year FROM videos WHERE id = ?", (id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Video not found")

    check_admin_auth(admin, required_year=existing["year"], min_role="admin")
    try:
        with db_cursor() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM videos WHERE id = ?", (id,))
            return {"status": "success", "message": "Video deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 3: Register routers in `server/main.py`**

Include `internship` and `videos` in `main.py` router import and loop:
```python
from routers import auth, news, people, schedule, videos, works, rooms, users, internship

for r in (people, news, schedule, auth, videos, works, rooms, users, internship):
    app.include_router(r.router)
```

- [ ] **Step 4: Verify Python Compilation**

Run: `python3 -m py_compile server/main.py server/routers/*.py`
Expected: Clean compilation without errors.

- [ ] **Step 5: Commit**

```bash
git add server/routers/internship.py server/routers/videos.py server/main.py
git commit -m "feat: add backend routers for internship topics and videos"
```

---

### Task 2: Reusable ImageUploader Component

**Files:**
- Create: `components/admin/ImageUploader.tsx`

**Interfaces:**
- Consumes: `uploadEndpoint` (string), `token` (string), `initialUrl` (optional string), `onUploadSuccess` (callback)
- Produces: Visual image drag-and-drop uploader with live thumbnail preview and upload trigger.

- [ ] **Step 1: Create `components/admin/ImageUploader.tsx`**

```tsx
"use client";

import { useState } from "react";

interface ImageUploaderProps {
  uploadEndpoint: string;
  token: string;
  initialUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  uploadEndpoint,
  token,
  initialUrl = "",
  onUploadSuccess,
  label = "Upload Image",
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${backendUrl}${uploadEndpoint}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Image upload failed");
      }

      const data = await res.json();
      const finalUrl = data.url;
      setImageUrl(finalUrl);
      onUploadSuccess(finalUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl("");
    onUploadSuccess("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-500">{label}</label>
      
      {imageUrl ? (
        <div className="relative w-full h-40 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
          <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-zinc-50 dark:bg-zinc-800/40">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-1">
            <div className="text-xl">📷</div>
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {uploading ? "Uploading image..." : "Click or drag image to upload"}
            </div>
            <div className="text-[10px] text-zinc-400">JPG, PNG, WebP up to 5MB</div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/ImageUploader.tsx
git commit -m "feat: add reusable ImageUploader component with thumbnail preview"
```

---

### Task 3: Class Schedule Timetable Grid Component

**Files:**
- Create: `components/admin/ClassScheduleGrid.tsx`

**Interfaces:**
- Consumes: `year` (number), `term` (number), `token` (string), `initialRows` (array)
- Produces: Interactive timetable grid editor with cell popover for assigning courses and bulk save button.

- [ ] **Step 1: Create `components/admin/ClassScheduleGrid.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";

interface ClassCell {
  day: string;
  time_slot: string;
  code: str;
  name_en?: string;
  name_th?: string;
  room?: string;
  instructor_en?: string;
  instructor_th?: string;
  description_en?: string;
  description_th?: string;
}

interface ClassScheduleGridProps {
  year: number;
  term: number;
  token: string;
  onSaveSuccess: () => void;
}

const DAYS = [
  { key: "monday", label: "Mon (จันทร์)", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400" },
  { key: "tuesday", label: "Tue (อังคาร)", color: "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400" },
  { key: "wednesday", label: "Wed (พุธ)", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
  { key: "thursday", label: "Thu (พฤหัส)", color: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400" },
  { key: "friday", label: "Fri (ศุกร์)", color: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400" },
  { key: "saturday", label: "Sat (เสาร์)", color: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400" },
];

const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export default function ClassScheduleGrid({
  year,
  term,
  token,
  onSaveSuccess,
}: ClassScheduleGridProps) {
  const [cells, setCells] = useState<Map<string, ClassCell>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [cellForm, setCellForm] = useState<Partial<ClassCell>>({});
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    fetchSchedule();
  }, [year, term]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/schedule/class?year=${year}&term=${term}`);
      if (res.ok) {
        const data: ClassCell[] = await res.json();
        const map = new Map<string, ClassCell>();
        data.forEach((c) => {
          map.set(`${c.day}_${c.time_slot}`, c);
        });
        setCells(map);
      }
    } catch (err) {
      console.error("Failed to fetch grid schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (day: string, slot: string) => {
    const key = `${day}_${slot}`;
    setActiveCellKey(key);
    const existing = cells.get(key);
    setCellForm(existing ? { ...existing } : { day, time_slot: slot, code: "" });
  };

  const handleApplyCell = () => {
    if (!activeCellKey || !cellForm.code?.trim()) {
      if (activeCellKey) {
        const updatedMap = new Map(cells);
        updatedMap.delete(activeCellKey);
        setCells(updatedMap);
      }
      setActiveCellKey(null);
      return;
    }

    const updatedMap = new Map(cells);
    updatedMap.set(activeCellKey, cellForm as ClassCell);
    setCells(updatedMap);
    setActiveCellKey(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    const rowsList = Array.from(cells.values());

    try {
      const res = await fetch(`${backendUrl}/schedule/class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          year,
          term,
          rows: rowsList,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save timetable");
      }

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || "Error saving schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Class Timetable Editor (Year {year}, Term {term})
          </h3>
          <p className="text-xs text-zinc-500">Click any slot to assign or clear a course.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving Timetable..." : "💾 Save Timetable"}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-zinc-500">Loading grid...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-bold border-r border-zinc-200 dark:border-zinc-800 w-28">Time Slot</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="p-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-800 min-w-[120px]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-semibold text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    {slot}
                  </td>
                  {DAYS.map((d) => {
                    const key = `${d.key}_${slot}`;
                    const cell = cells.get(key);
                    return (
                      <td
                        key={d.key}
                        onClick={() => handleCellClick(d.key, slot)}
                        className="p-2 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        {cell ? (
                          <div className={`p-2 rounded-lg border text-center space-y-1 ${d.color}`}>
                            <div className="font-extrabold">{cell.code}</div>
                            <div className="text-[10px] truncate">{cell.name_th || cell.name_en}</div>
                            {cell.room && <div className="text-[9px] font-semibold opacity-75">📍 {cell.room}</div>}
                          </div>
                        ) : (
                          <div className="h-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 dark:text-zinc-700 hover:text-zinc-500">
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Cell Modal */}
      {activeCellKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Edit Course Slot</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CPE 323"
                  value={cellForm.code || ""}
                  onChange={(e) => setCellForm({ ...cellForm, code: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Name (TH)</label>
                <input
                  type="text"
                  value={cellForm.name_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, name_th: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Room</label>
                <input
                  type="text"
                  placeholder="e.g. 113"
                  value={cellForm.room || ""}
                  onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Instructor (TH)</label>
                <input
                  type="text"
                  value={cellForm.instructor_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, instructor_th: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveCellKey(null)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCell}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                Apply Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/ClassScheduleGrid.tsx
git commit -m "feat: add ClassScheduleGrid component with visual timetable editor"
```

---

### Task 4: Exam Schedule Bulk Table Component

**Files:**
- Create: `components/admin/ExamScheduleTable.tsx`

**Interfaces:**
- Consumes: `year` (number), `term` (number), `token` (string), `onSaveSuccess` (callback)
- Produces: Dynamic spreadsheet-style exam schedule table editor with bulk save.

- [ ] **Step 1: Create `components/admin/ExamScheduleTable.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";

interface ExamItem {
  code: string;
  name_en?: string;
  name_th?: string;
  date_raw?: string;
  start_time?: string;
  end_time?: string;
  midterm_en?: string;
  midterm_th?: string;
  finals_en?: string;
  finals_th?: string;
}

interface ExamScheduleTableProps {
  year: number;
  term: number;
  token: string;
  onSaveSuccess: () => void;
}

export default function ExamScheduleTable({
  year,
  term,
  token,
  onSaveSuccess,
}: ExamScheduleTableProps) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    fetchExams();
  }, [year, term]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/schedule/exam?year=${year}&term=${term}`);
      if (res.ok) {
        const data: ExamItem[] = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exam schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setExams([
      ...exams,
      {
        code: `CPE ${300 + exams.length + 1}`,
        name_th: "",
        date_raw: "2026-10-15",
        start_time: "09:00",
        end_time: "12:00",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setExams(exams.filter((_, idx) => idx !== index));
  };

  const handleChange = (index: number, field: keyof ExamItem, value: string) => {
    const updated = [...exams];
    updated[index] = { ...updated[index], [field]: value };
    setExams(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/schedule/exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          year,
          term,
          exams,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save exam schedule");
      }

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || "Error saving exam schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Exam Schedule Spreadsheet (Year {year}, Term {term})
          </h3>
          <p className="text-xs text-zinc-500">Edit exam dates, start/end times, and subjects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-all"
          >
            + Add Exam Row
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save Exam Schedule"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-zinc-500">Loading exams...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-bold">Course Code *</th>
                <th className="p-3 font-bold">Name (TH)</th>
                <th className="p-3 font-bold">Exam Date</th>
                <th className="p-3 font-bold">Start Time</th>
                <th className="p-3 font-bold">End Time</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {exams.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) => handleChange(idx, "code", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.name_th || ""}
                      onChange={(e) => handleChange(idx, "name_th", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      value={item.date_raw || ""}
                      onChange={(e) => handleChange(idx, "date_raw", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.start_time || ""}
                      onChange={(e) => handleChange(idx, "start_time", e.target.value)}
                      className="w-24 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.end_time || ""}
                      onChange={(e) => handleChange(idx, "end_time", e.target.value)}
                      className="w-24 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/ExamScheduleTable.tsx
git commit -m "feat: add ExamScheduleTable component with bulk spreadsheet editor"
```

---

### Task 5: Integrate All Components and Fields into Central Admin Dashboard

**Files:**
- Modify: `app/[lang]/admin/page.tsx`

**Interfaces:**
- Integrates: `ImageUploader`, `ClassScheduleGrid`, `ExamScheduleTable`, and full field controls for Teachers, Students, Works, Rooms, Internship Topics, and Videos.

- [ ] **Step 1: Update `app/[lang]/admin/page.tsx`**

Integrate:
- New tabs `internship` and `videos`.
- `ClassScheduleGrid` inside `schedules_class` view.
- `ExamScheduleTable` inside `schedules_exam` view.
- `ImageUploader` inside Teachers, Students, Works, Rooms drawer forms targeting specific `/image/` sub-directories.
- Multi-select checkboxes for `advise_years` in Teachers form.
- Full field controls (`class_role`, `contact`) in Students form.

- [ ] **Step 2: Verify Build and Type Checking**

Run: `npm run build`
Expected: `✓ Compiled 41/41 routes successfully`.

- [ ] **Step 3: Commit**

```bash
git add app/[lang]/admin/page.tsx
git commit -m "feat: integrate schedules editors, sub-directory image uploaders, and new tabs into Central Admin"
```
