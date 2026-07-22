/**
 * Helper to compute cohort edition number (รุ่นที่ X) from a student ID or cohort code.
 * Pattern:
 * 64XXXXXX -> รุ่นที่ 1 (64 - 63 = 1)
 * 65XXXXXX -> รุ่นที่ 2 (65 - 63 = 2)
 * 66XXXXXX -> รุ่นที่ 3 (66 - 63 = 3)
 * 67XXXXXX -> รุ่นที่ 4 (67 - 63 = 4)
 * 68XXXXXX -> รุ่นที่ 5 (68 - 63 = 5)
 * 69XXXXXX -> รุ่นที่ 6 (69 - 63 = 6)
 */
export function getCohortNumber(cohortOrId: string): number | null {
  if (!cohortOrId) return null;
  const str = String(cohortOrId).trim().toUpperCase();

  // If string starts with 2 digits like '67' or '67200412'
  const prefixMatch = str.match(/^(\d{2})/);
  if (prefixMatch) {
    const yearPrefix = parseInt(prefixMatch[1], 10);
    // Year 64 -> Batch 1, Year 67 -> Batch 4
    if (yearPrefix >= 40 && yearPrefix <= 99) {
      return yearPrefix - 63;
    }
  }

  // If string is 'CE04', 'CE05', 'CE06', etc.
  const ceMatch = str.match(/^CE0*(\d+)$/);
  if (ceMatch) {
    return parseInt(ceMatch[1], 10);
  }

  return null;
}

export function formatCohortLabel(cohortOrId: string, lang: string = "th"): string {
  const num = getCohortNumber(cohortOrId);
  const isTh = lang === "th";

  if (num !== null && num > 0) {
    return isTh ? `รุ่นที่ ${num}` : `Cohort ${num}`;
  }

  // Fallback to original string if not matched
  return cohortOrId;
}

export function getCohortCodeFromStudentId(studentId: string): string {
  const num = getCohortNumber(studentId);
  if (num !== null && num > 0) {
    return `CE${String(num).padStart(2, "0")}`;
  }
  return studentId;
}
