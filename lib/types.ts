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

export interface Schedule {
  id: number;
  kind: "class" | "exam";
  year: number;
  term?: number | null;
  payload: unknown;
}

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
