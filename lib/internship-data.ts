export interface InternStudent {
  id: string;
  name_th: string;
  name_en: string;
  company: string;
  position_th: string;
  position_en: string;
  track: string;
  photo: string;
  bg_image?: string;
  logo?: string;
  period_th: string;
  period_en: string;
  summary_th: string;
  summary_en: string;
  description_th: string;
  description_en: string;
  tech: string[];
  advice_th: string;
  advice_en: string;
  stipend_th: string;
  stipend_en: string;
  welfare_th: string[];
  welfare_en: string[];
  rating: number;
}

import { api } from "./api";

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
