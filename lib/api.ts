import type {
  InternshipTopic,
  NewsCategory,
  Room,
  Schedule,
  Student,
  Teacher,
  Video,
  Work,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url.toString()}`);
  return res.json() as Promise<T>;
}

export const api = {
  teachers: () => get<Teacher[]>("/people/teachers"),
  students: (year?: number) =>
    get<Student[]>("/people/students", year ? { year: String(year) } : undefined),
  works: (year?: number) =>
    get<Work[]>("/works", year ? { year: String(year) } : undefined),
  news: (category?: NewsCategory) =>
    get<never[]>("/news", category ? { category } : undefined),
  schedule: (kind?: Schedule["kind"], year?: number) =>
    get<Schedule[]>("/schedule", {
      ...(kind ? { kind } : {}),
      ...(year ? { year: String(year) } : {}),
    }),
  rooms: () => get<Room[]>("/rooms"),
  internship: (host_branch?: string) =>
    get<InternshipTopic[]>("/internship", host_branch ? { host_branch } : undefined),
  videos: () => get<Video[]>("/videos"),
};
