export interface CohortInfo {
  code: string;       // e.g. "CE04"
  prefix: string;     // e.g. "67"
  generation: number; // e.g. 4
  labelTh: string;    // "รุ่นที่ 4"
  labelEn: string;    // "CE04"
}

/**
 * Calculates generation number from 2-digit student ID prefix (e.g. "67" -> 4)
 * 64 -> 1, 65 -> 2, 66 -> 3, 67 -> 4, 68 -> 5, 69 -> 6
 */
export function getGenerationFromPrefix(prefix: string | number): number | null {
  const num = typeof prefix === "number" ? prefix : parseInt(prefix, 10);
  if (isNaN(num) || num < 50) return null;
  const gen = num - 63;
  return gen > 0 ? gen : null;
}

/**
 * Formats student ID prefix or cohort code into localized generation label
 * e.g. "67200412" -> "รุ่นที่ 4" (th) / "CE04" (en)
 * e.g. "CE04" -> "รุ่นที่ 4" (th) / "CE04" (en)
 */
export function formatCohortLabel(input: string | null | undefined, lang: string = "th"): string {
  if (!input) return "";

  let gen: number | null = null;
  const str = input.trim();

  if (/^\d{8}$/.test(str)) {
    gen = getGenerationFromPrefix(str.slice(0, 2));
  } else if (/^\d{2}$/.test(str)) {
    gen = getGenerationFromPrefix(str);
  } else if (/^CE\d{1,2}$/i.test(str)) {
    const num = parseInt(str.slice(2), 10);
    if (!isNaN(num)) gen = num;
  }

  if (gen !== null && gen > 0) {
    const formattedGen = gen < 10 ? `0${gen}` : `${gen}`;
    return lang === "th" ? `รุ่นที่ ${gen}` : `CE${formattedGen}`;
  }

  return str;
}
