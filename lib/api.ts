import type {
  ClassCell,
  ExamSlot,
  InternshipTopic,
  NewsCategory,
  Room,
  Student,
  Teacher,
  Video,
  Work,
} from "./types";
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
  dateRaw: string;
  timeRaw: string;
  startTimeRaw: string;
  endTimeRaw: string;
  midtermEn: string;
  midtermTh: string;
  finalsEn: string;
  finalsTh: string;
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

export function slotToExamItem(s: ExamSlot): ExamItem {
  const isOutside = !s.date_raw || s.date_raw === "9999-12-31";
  return {
    code: s.code,
    nameEn: s.name_en ?? "",
    nameTh: s.name_th ?? "",
    dateRaw: s.date_raw ?? "",
    timeRaw: isOutside ? "23:59" : (s.start_time ?? ""),
    startTimeRaw: isOutside ? "" : (s.start_time ?? ""),
    endTimeRaw: isOutside ? "" : (s.end_time ?? ""),
    midtermEn: s.midterm_en ?? "-",
    midtermTh: s.midterm_th ?? "-",
    finalsEn: s.finals_en ?? "-",
    finalsTh: s.finals_th ?? "-",
  };
}

export function examItemToSlot(e: ExamItem): ExamSlot {
  return {
    code: e.code,
    name_en: e.nameEn,
    name_th: e.nameTh,
    date_raw: e.dateRaw,
    start_time: e.startTimeRaw,
    end_time: e.endTimeRaw,
    midterm_en: e.midtermEn,
    midterm_th: e.midtermTh,
    finals_en: e.finalsEn,
    finals_th: e.finalsTh,
  };
}

// ponytail: server-side SSR/route handlers run inside the web container, where
// localhost points at Next (3000), not the API. The API is reachable via Docker
// DNS (http://api:8000). Browser fetches still need the public host URL, so pick
// the base by execution context: server → API_INTERNAL_URL, browser → NEXT_PUBLIC_API_URL.
const BASE =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export const api = {
  teachers: () => get<Teacher[]>("/people/teachers"),
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
  internship: (host_branch?: string) =>
    get<InternshipTopic[]>("/internship", host_branch ? { host_branch } : undefined),
  videos: () => get<Video[]>("/videos"),
};
