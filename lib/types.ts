// Shared frontend types — mirror server/schema.sql
export type Locale = "th" | "en";

export interface Teacher {
  id: number;
  name_th: string;
  name_en?: string | null;
  photo?: string | null;
  advise_years?: string[]; // JSON array from API
  contact?: string | null;
}

export interface Student {
  id: number;
  student_id: string;
  name_th: string;
  name_en?: string | null;
  photo?: string | null;
  year: number;
  class_role?: string | null;
  track?: string | null;
  contact?: string | null;
}

export type WorkScope = "branch" | "group" | "solo";
export interface Work {
  id: number;
  year: number;
  scope: WorkScope;
  title: string;
  description?: string | null;
  image?: string | null;
  author_ids?: number[];
}

export type NewsCategory = "competition" | "scholarship" | "other";
export interface NewsItem {
  id: number;
  title: string;
  category: NewsCategory;
  body?: string | null;
  link?: string | null;
  published_at?: string | null;
}

// Flat class cell stored in DB; frontend converts to/from WeeklyClassRow grid.
export interface ClassCell {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  time_slot: string;
  code: string;
  name_en?: string | null;
  name_th?: string | null;
  room?: string | null;
  instructor_en?: string | null;
  instructor_th?: string | null;
  description_en?: string | null;
  description_th?: string | null;
}

// Flat exam row stored in DB.
export interface ExamSlot {
  code: string;
  name_en?: string | null;
  name_th?: string | null;
  date_raw?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  midterm_en?: string | null;
  midterm_th?: string | null;
  finals_en?: string | null;
  finals_th?: string | null;
}

// Fixed weekly time slots used to rebuild the class grid from flat cells.
export const CLASS_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
];

export const CLASS_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export interface Room {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface InternshipTopic {
  id: number;
  host_branch: string;
  title: string;
  description?: string | null;
  year?: number | null;
}

export interface Video {
  id: number;
  title: string;
  description?: string | null;
  file_path: string;
  thumbnail?: string | null;
  category?: string | null;
  year?: number | null;
}
