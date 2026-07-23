# Design Spec: Complete Admin CRUD & Feature Enhancements

## 1. Overview
This specification details the full completion of the **Centralized Admin Dashboard** (`/[lang]/admin`). It fills in all missing administrative CRUD capabilities, integrates interactive schedule grid/table editors, adds drag-and-drop image uploading targeting specific sub-directories under `server/image/`, completes missing field controls across all entity forms, and introduces new backend routers and admin tabs for Internship Topics and Videos.

---

## 2. Schedule Editors Architecture

### 2.1 Class Schedule (Visual Weekly Timetable Grid Editor)
- **UI Location**: `/[lang]/admin?tab=schedules_class`
- **Behavior**:
  - Displays a visual weekly timetable matrix (Columns: Monday to Saturday; Rows: Hourly time slots from 08:00 to 17:00).
  - Clicking any empty or populated cell opens an inline Course Cell Modal to edit:
    - `code` (Course Code e.g. CPE 323)
    - `name_th` & `name_en` (Course Title)
    - `room` (Laboratory or lecture room name)
    - `instructor_th` & `instructor_en` (Instructor Name)
    - `description_th` & `description_en`
  - Drag / Clear cell actions.
  - Global **"Save Timetable"** action posting all non-empty cell rows to `POST /schedule/class` with body `{ year, term, rows }`.

### 2.2 Exam Schedule (Bulk Spreadsheet-Style Table Editor)
- **UI Location**: `/[lang]/admin?tab=schedules_exam`
- **Behavior**:
  - Displays a dynamic spreadsheet table for all exam items for the selected `year` and `term`.
  - Columns: Course Code, Course Name (TH/EN), Exam Date (`date_raw`), Start Time, End Time, Midterm Info (TH/EN), Finals Info (TH/EN).
  - Actions: **"+ Add Exam Row"**, **"Duplicate Row"**, **"Remove Row"**.
  - Global **"Save Exam Schedule"** action posting all rows to `POST /schedule/exam` with body `{ year, term, exams }`.

---

## 3. Sub-Directory Image Upload System

### 3.1 Backend Endpoints & Sub-Directories
Image uploads post to specific FastAPI endpoints that write directly into sub-directories of `server/image/`:
- **Teachers**: `POST /people/teachers/upload-image` → saves to `server/image/professors/<uuid>.<ext>`
- **Students**: `POST /people/students/upload-image` → saves to `server/image/students/<uuid>.<ext>`
- **Student Works**: `POST /works/upload-image` → saves to `server/image/works/<uuid>.<ext>`
- **CE Rooms**: `POST /rooms/upload-image` → saves to `server/image/rooms/<uuid>.<ext>`

### 3.2 Frontend Reusable ImageUploader Component
- **Path**: `components/admin/ImageUploader.tsx`
- **Features**:
  - Drag-and-drop zone + file picker button.
  - Live thumbnail image preview with "Remove / Replace Image" button.
  - Upload progress bar and error handling (validates file types `.jpg, .jpeg, .png, .webp`).
  - Passes the resulting static image URL string (e.g. `/image/professors/...`) back to the parent form.

---

## 4. Entity Form Field Completions

### 4.1 Teachers Form
- `name_th` (Required Text)
- `name_en` (Optional Text)
- `photo` (Integrated `ImageUploader` targeting `/people/teachers/upload-image`)
- `advise_years` (Multi-select checkboxes for Years 1, 2, 3, 4; saved as JSON array e.g. `["1", "2"]`)
- `contact` (Optional Text / Phone / Email)

### 4.2 Students Form
- `student_id` (Required Text, unique)
- `name_th` (Required Text)
- `name_en` (Optional Text)
- `photo` (Integrated `ImageUploader` targeting `/people/students/upload-image`)
- `year` (Required Select 1–4)
- `track` / Cohort (Optional Text e.g. `CE04` or track number)
- `class_role` (Optional Text e.g. `ประธานชั้นปี`, `เหรัญญิก`, `เลขา`)
- `contact` (Optional Text / Socials / Tel)

### 4.3 Student Works Form
- `title` (Required Text)
- `scope` (Required Select: `branch`, `group`, `solo`)
- `year` (Required Select 1–4)
- `description` (Optional Textarea)
- `image` (Integrated `ImageUploader` targeting `/works/upload-image`)
- `author_ids` (Interactive Student Picker multi-select with search by student ID or name)

### 4.4 CE Rooms Form
- `name` (Required Text e.g. `113`, `Server Room`)
- `description` (Optional Textarea)
- `image` (Integrated `ImageUploader` targeting `/rooms/upload-image`)

---

## 5. New Modules: Internship Topics & Videos

### 5.1 Internship Topics Module
- **Database Table**: `internship_topics` (`id`, `host_branch`, `title`, `description`, `year`, `created_at`)
- **Backend Router**: `server/routers/internship.py`
  - `GET /internship` (Query by `year` or `host_branch`)
  - `POST /internship` (`check_admin_auth` year-scoped)
  - `PUT /internship/{id}` (`check_admin_auth` year-scoped)
  - `DELETE /internship/{id}` (`check_admin_auth` year-scoped)
- **Admin Tab**: `/[lang]/admin?tab=internship`

### 5.2 Videos Module
- **Database Table**: `videos` (`id`, `title`, `description`, `file_path`, `thumbnail`, `category`, `year`, `created_at`)
- **Backend Router**: `server/routers/videos.py`
  - `GET /videos` (Query by `year` or `category`)
  - `POST /videos` (`check_admin_auth` year-scoped)
  - `PUT /videos/{id}` (`check_admin_auth` year-scoped)
  - `DELETE /videos/{id}` (`check_admin_auth` year-scoped)
- **Admin Tab**: `/[lang]/admin?tab=videos`

---

## 6. Verification Plan
- **Class Schedule Grid**: Add and edit classes on weekly grid, save, verify persistence in DB and public `/schedule` page.
- **Exam Schedule Table**: Add exam rows, save, verify persistence in DB and public `/schedule?type=exam` page.
- **Image Uploads**: Upload photos for Teachers, Students, Works, and Rooms; verify files are saved under `server/image/{professors,students,works,rooms}` and render on public pages.
- **Internship & Videos**: Create, update, and delete topics and videos from admin dashboard; verify endpoints return 200 OK and valid JSON.
- **Build Verification**: Execute `npm run build` and `python3 -m py_compile server/main.py server/routers/*.py`.
