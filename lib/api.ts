import type {
  ClassCell,
  ExamSlot,
  InternStudent,
  NewsCategory,
  Room,
  Student,
  Teacher,
  Video,
  Work,
} from "./types";

export type {
  ClassCell,
  ExamSlot,
  InternStudent,
  NewsCategory,
  Room,
  Student,
  Teacher,
  Video,
  Work,
};
import { CLASS_DAYS, CLASS_TIME_SLOTS } from "./types";

// Frontend-facing shapes (kept stable to minimize churn in 3 schedule TSX files).
export interface ClassItem {
  code: string;
  nameEn: string;
  nameTh: string;
  room?: string;
  instructorEn?: string;
  instructorTh?: string;
  descriptionEn?: string;
  descriptionTh?: string;
}

export interface WeeklyClassRow {
  time: string;
  monday: ClassItem | null;
  tuesday: ClassItem | null;
  wednesday: ClassItem | null;
  thursday: ClassItem | null;
  friday: ClassItem | null;
  saturday: ClassItem | null;
}

export interface ExamItem {
  code: string;
  nameEn: string;
  nameTh: string;
  midtermType: "scheduled" | "arranged" | "none";
  midtermDate: string;
  midtermStartTime: string;
  midtermEndTime: string;
  midtermRoom: string;
  midtermNoteTh: string;
  midtermNoteEn: string;
  finalsType: "scheduled" | "arranged" | "none";
  finalsDate: string;
  finalsStartTime: string;
  finalsEndTime: string;
  finalsRoom: string;
  finalsNoteTh: string;
  finalsNoteEn: string;

  // Computed helper fields for display
  midtermTh?: string;
  midtermEn?: string;
  finalsTh?: string;
  finalsEn?: string;
}

// flat DB cell → grid row
export function cellsToGrid(cells: ClassCell[]): WeeklyClassRow[] {
  const grid: WeeklyClassRow[] = CLASS_TIME_SLOTS.map((time) => ({
    time,
    monday: null, tuesday: null, wednesday: null,
    thursday: null, friday: null, saturday: null,
  }));
  for (const c of cells) {
    const row = grid.find((r) => r.time === c.time_slot);
    if (!row) continue;
    const cell: ClassItem = {
      code: c.code,
      nameEn: c.name_en ?? "",
      nameTh: c.name_th ?? "",
      room: c.room ?? undefined,
      instructorEn: c.instructor_en ?? undefined,
      instructorTh: c.instructor_th ?? undefined,
      descriptionEn: c.description_en ?? undefined,
      descriptionTh: c.description_th ?? undefined,
    };
    (row as any)[c.day] = cell;
  }
  return grid;
}

export function gridToCells(grid: WeeklyClassRow[]): ClassCell[] {
  const cells: ClassCell[] = [];
  for (const row of grid) {
    for (const day of CLASS_DAYS) {
      const item = row[day];
      if (!item) continue;
      cells.push({
        day,
        time_slot: row.time,
        code: item.code,
        name_en: item.nameEn,
        name_th: item.nameTh,
        room: item.room ?? null,
        instructor_en: item.instructorEn ?? null,
        instructor_th: item.instructorTh ?? null,
        description_en: item.descriptionEn ?? null,
        description_th: item.descriptionTh ?? null,
      });
    }
  }
  return cells;
}

export function formatExamPeriod(
  type?: string | null,
  date?: string | null,
  startTime?: string | null,
  endTime?: string | null,
  noteTh?: string | null,
  noteEn?: string | null,
  lang: "th" | "en" = "th"
): string {
  if (type === "arranged") {
    return lang === "th" ? "จัดสอบเอง" : "Arranged by Lecturer";
  }
  if (type === "none") {
    return "-";
  }
  if (date) {
    try {
      const d = new Date(date + "T00:00:00");
      const dayNamesTh = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
      const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const dayStr = lang === "th" ? dayNamesTh[d.getDay()] : dayNamesEn[d.getDay()];
      const dayNum = d.getDate();
      const monthStr = lang === "th" ? monthNamesTh[d.getMonth()] : monthNamesEn[d.getMonth()];
      const yearNum = lang === "th" ? d.getFullYear() + 543 : d.getFullYear();

      let dateFormatted = `${dayStr} ${dayNum} ${monthStr} ${yearNum}`;
      if (startTime && endTime) {
        dateFormatted += ` (${startTime} - ${endTime})`;
      } else if (startTime) {
        dateFormatted += ` (${startTime})`;
      }
      return dateFormatted;
    } catch {
      return date;
    }
  }

  return (lang === "th" ? noteTh : noteEn) || noteTh || noteEn || "-";
}

// flat DB cell → ExamItem
export function slotToExamItem(s: ExamSlot): ExamItem {
  return {
    code: s.code,
    nameTh: s.name_th ?? "",
    nameEn: s.name_en ?? "",
    midtermType: s.midterm_type ?? "scheduled",
    midtermDate: s.midterm_date ?? "",
    midtermStartTime: s.midterm_start_time ?? "",
    midtermEndTime: s.midterm_end_time ?? "",
    midtermRoom: s.midterm_room ?? "",
    midtermNoteTh: s.midterm_note_th ?? "",
    midtermNoteEn: s.midterm_note_en ?? "",
    finalsType: s.finals_type ?? "scheduled",
    finalsDate: s.finals_date ?? "",
    finalsStartTime: s.finals_start_time ?? "",
    finalsEndTime: s.finals_end_time ?? "",
    finalsRoom: s.finals_room ?? "",
    finalsNoteTh: s.finals_note_th ?? "",
    finalsNoteEn: s.finals_note_en ?? "",
    midtermTh: formatExamPeriod(s.midterm_type, s.midterm_date, s.midterm_start_time, s.midterm_end_time, s.midterm_note_th, s.midterm_note_en, "th"),
    midtermEn: formatExamPeriod(s.midterm_type, s.midterm_date, s.midterm_start_time, s.midterm_end_time, s.midterm_note_th, s.midterm_note_en, "en"),
    finalsTh: formatExamPeriod(s.finals_type, s.finals_date, s.finals_start_time, s.finals_end_time, s.finals_note_th, s.finals_note_en, "th"),
    finalsEn: formatExamPeriod(s.finals_type, s.finals_date, s.finals_start_time, s.finals_end_time, s.finals_note_th, s.finals_note_en, "en"),
  };
}

export function examItemToSlot(e: ExamItem): ExamSlot {
  return {
    code: e.code,
    name_th: e.nameTh,
    name_en: e.nameEn,
    midterm_type: e.midtermType,
    midterm_date: e.midtermDate || null,
    midterm_start_time: e.midtermStartTime || null,
    midterm_end_time: e.midtermEndTime || null,
    midterm_room: e.midtermRoom || null,
    midterm_note_th: e.midtermNoteTh || null,
    midterm_note_en: e.midtermNoteEn || null,
    finals_type: e.finalsType,
    finals_date: e.finalsDate || null,
    finals_start_time: e.finalsStartTime || null,
    finals_end_time: e.finalsEndTime || null,
    finals_room: e.finalsRoom || null,
    finals_note_th: e.finalsNoteTh || null,
    finals_note_en: e.finalsNoteEn || null,
  };
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: any): Promise<T> {
  const url = new URL(path, BASE);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

function adminToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1] ?? null
  );
}

async function postAuth<T>(path: string, body: any): Promise<T> {
  const url = new URL(path, BASE);
  const token = adminToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

async function putAuth<T>(path: string, body: any): Promise<T> {
  const url = new URL(path, BASE);
  const token = adminToken();
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

async function deleteAuth<T>(path: string): Promise<T> {
  const url = new URL(path, BASE);
  const token = adminToken();
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

async function uploadFileAuth<T>(path: string, file: File): Promise<T> {
  const url = new URL(path, BASE);
  const token = adminToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

export const api = {
  teachers: () => get<Teacher[]>("/people/teachers"),
  createTeacher: (data: Partial<Teacher>) =>
    postAuth<{ status: string; id: number }>("/people/teachers", data),
  updateTeacher: (id: number, data: Partial<Teacher>) =>
    putAuth<{ status: string }>("/people/teachers/" + id, data),
  deleteTeacher: (id: number) =>
    deleteAuth<{ status: string }>("/people/teachers/" + id),
  uploadTeacherImage: (file: File) =>
    uploadFileAuth<{ url: string }>("/people/teachers/upload-image", file),
  cohorts: () => get<string[]>("/people/cohorts"),
  students: (cohort?: string) =>
    get<Student[]>("/people/students", cohort ? { cohort } : undefined),
  works: (year?: number) =>
    get<Work[]>("/works", year ? { year: String(year) } : undefined),
  news: (category?: NewsCategory) =>
    get<never[]>("/news", category ? { category } : undefined),
  classSchedule: (year: number, term: number = 1) =>
    get<ClassCell[]>("/schedule/class", { year: String(year), term: String(term) }),
  examSchedule: (year: number, term: number = 1) =>
    get<ExamSlot[]>("/schedule/exam", { year: String(year), term: String(term) }),
  saveClassSchedule: (year: number, rows: ClassCell[], term: number = 1) =>
    postAuth<{ status: string }>("/schedule/class", { year, term, rows }),
  saveExamSchedule: (year: number, exams: ExamSlot[], term: number = 1) =>
    postAuth<{ status: string }>("/schedule/exam", { year, term, exams }),
  rooms: () => get<Room[]>("/rooms"),
  internshipStudents: (year?: number) =>
    get<any[]>("/internship/students" + (year ? `?year=${year}` : "")),
  getInternshipStudent: (id: string) => get<any>("/internship/students/" + id),
  videos: () => get<Video[]>("/videos"),
};

export async function fetchInternshipStudents(): Promise<InternStudent[]> {
  try {
    const data = await api.internshipStudents();
    if (Array.isArray(data) && data.length > 0) {
      return data as InternStudent[];
    }
  } catch (err) {
    // ponytail: return empty array on API failure
  }
  return [];
}

export async function fetchInternshipStudentById(id: string): Promise<InternStudent | undefined> {
  try {
    const item = await api.getInternshipStudent(id);
    if (item && item.id) {
      return item as InternStudent;
    }
  } catch (err) {
    // ponytail: return undefined on API failure
  }
  return undefined;
}

export async function fetchRooms(): Promise<Room[]> {
  try {
    const data = await api.rooms();
    if (Array.isArray(data)) {
      return data as Room[];
    }
  } catch (err) {
    // ponytail: return empty array on API failure
  }
  return [];
}

