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
  if (isNaN(num) || num < 40) return null;
  const gen = num - 63;
  return gen > 0 ? gen : null;
}

/**
 * Helper to compute cohort edition number (รุ่นที่ X) from a student ID or cohort code.
 */
export function getCohortNumber(cohortOrId: string): number | null {
  if (!cohortOrId) return null;
  const str = String(cohortOrId).trim().toUpperCase();

  const prefixMatch = str.match(/^(\d{2})/);
  if (prefixMatch) {
    const yearPrefix = parseInt(prefixMatch[1], 10);
    if (yearPrefix >= 40 && yearPrefix <= 99) {
      return yearPrefix - 63;
    }
  }

  const ceMatch = str.match(/^CE[-_]?0*(\d+)$/);
  if (ceMatch) {
    return parseInt(ceMatch[1], 10);
  }

  const genMatch = str.match(/^0*(\d{1,2})$/);
  if (genMatch) {
    const genNum = parseInt(genMatch[1], 10);
    if (genNum > 0 && genNum < 40) {
      return genNum;
    }
  }

  return null;
}

export function getCohortCodeFromStudentId(studentId: string): string {
  const num = getCohortNumber(studentId);
  if (num !== null && num > 0) {
    return `CE${String(num).padStart(2, "0")}`;
  }
  return studentId;
}

/**
 * Formats student ID prefix or cohort code into localized generation label
 * e.g. "67200412" -> "รุ่นที่ 4" (th) / "CE04" (en)
 * e.g. "CE04" -> "รุ่นที่ 4" (th) / "CE04" (en)
 */
export function formatCohortLabel(input: string | null | undefined, lang: string = "th"): string {
  if (!input) return "";

  let gen: number | null = getCohortNumber(input);
  if (gen === null) {
    const str = input.trim();
    if (/^\d{8}$/.test(str)) {
      gen = getGenerationFromPrefix(str.slice(0, 2));
    } else if (/^\d{2}$/.test(str)) {
      gen = getGenerationFromPrefix(str);
    } else if (/^CE\d{1,2}$/i.test(str)) {
      const num = parseInt(str.slice(2), 10);
      if (!isNaN(num)) gen = num;
    }
  }

  if (gen !== null && gen > 0) {
    const formattedGen = gen < 10 ? `0${gen}` : `${gen}`;
    return lang === "th" ? `รุ่นที่ ${gen}` : `CE${formattedGen}`;
  }

  return String(input);
}

export interface CohortHeroData {
  titleEn: string;
  titleTh: string;
  subTitleEn: string;
  subTitleTh: string;
  bgImage: string;
}

export function getCohortHeroData(cohortCode: string): CohortHeroData {
  const code = cohortCode.toUpperCase();
  const gen = getCohortNumber(code);
  const codeLower = code.toLowerCase();

  let info: Omit<CohortHeroData, "bgImage">;

  if (gen) {
    // ponytail: compute academic year level dynamically (Thai academic year starts June)
    const now = new Date();
    const currentAcademicBE = (now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1) + 543;
    const currentAcademicPrefix = currentAcademicBE % 100;
    const entryPrefix = gen + 63;
    const yearLevel = currentAcademicPrefix - entryPrefix + 1;

    const yearNames: Record<number, { titleEn: string; titleTh: string; subTitleEn: string }> = {
      1: { titleEn: "FIRST YEAR", titleTh: "นักศึกษาชั้นปีที่ 1", subTitleEn: "FRESHMAN" },
      2: { titleEn: "SECOND YEAR", titleTh: "นักศึกษาชั้นปีที่ 2", subTitleEn: "SOPHOMORE" },
      3: { titleEn: "THIRD YEAR", titleTh: "นักศึกษาชั้นปีที่ 3", subTitleEn: "JUNIOR" },
      4: { titleEn: "FOURTH YEAR", titleTh: "นักศึกษาชั้นปีที่ 4", subTitleEn: "SENIOR" },
    };

    if (yearLevel in yearNames) {
      info = {
        ...yearNames[yearLevel],
        subTitleTh: `รุ่นที่ ${gen} (${code})`,
      };
    } else if (yearLevel > 4) {
      info = {
        titleEn: "ALUMNI",
        titleTh: "ศิษย์เก่า",
        subTitleEn: "GRADUATED",
        subTitleTh: `รุ่นที่ ${gen} (${code})`,
      };
    } else {
      info = {
        titleEn: `COHORT ${code}`,
        titleTh: `นักศึกษา ${code}`,
        subTitleEn: `CE GENERATION ${gen}`,
        subTitleTh: `รุ่นที่ ${gen} (${code})`,
      };
    }
  } else {
    info = {
      titleEn: `COHORT ${code}`,
      titleTh: `นักศึกษา ${code}`,
      subTitleEn: code,
      subTitleTh: code,
    };
  }

  return {
    ...info,
    bgImage: `/image/students/${codeLower}/backgrounds/${codeLower}.webp`,
  };
}

/**
 * ponytail: dynamic year level calculation relative to Thai academic calendar (starts June)
 */
export function getCohortYearLevel(cohortCode: string): number | null {
  const gen = getCohortNumber(cohortCode);
  if (!gen) return null;
  const now = new Date();
  const currentAcademicBE = (now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1) + 543;
  const currentAcademicPrefix = currentAcademicBE % 100;
  const entryPrefix = gen + 63;
  return currentAcademicPrefix - entryPrefix + 1;
}

/**
 * ponytail: boolean check if cohort completed 4 academic years
 */
export function isCohortGraduated(cohortCode: string): boolean {
  const yearLevel = getCohortYearLevel(cohortCode);
  return yearLevel !== null && yearLevel > 4;
}

export interface CohortStatus {
  isGraduated: boolean;
  yearLevel: number | null;
  generation: number | null;
  graduationYearBE: number | null;
  labelTh: string;
  labelEn: string;
}

/**
 * ponytail: unified status object for cohort badge tags & alumni filtering
 */
export function getCohortStatus(cohortCode: string): CohortStatus {
  const gen = getCohortNumber(cohortCode);
  const yearLevel = getCohortYearLevel(cohortCode);
  const isGraduated = yearLevel !== null && yearLevel > 4;
  const entryBE = gen ? gen + 63 + 2500 : null;
  const graduationYearBE = entryBE ? entryBE + 4 : null;

  let labelTh = "";
  let labelEn = "";

  if (isGraduated) {
    labelTh = "ศิษย์เก่า (จบการศึกษา)";
    labelEn = "Alumni (Graduated)";
  } else if (yearLevel && yearLevel >= 1 && yearLevel <= 4) {
    labelTh = `ชั้นปีที่ ${yearLevel}`;
    labelEn = `Year ${yearLevel}`;
  } else {
    labelTh = formatCohortLabel(cohortCode, "th");
    labelEn = formatCohortLabel(cohortCode, "en");
  }

  return {
    isGraduated,
    yearLevel,
    generation: gen,
    graduationYearBE,
    labelTh,
    labelEn,
  };
}


