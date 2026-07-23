"use client";

import React from "react";

export interface CohortOption {
  year: number;
  code: string;
  labelTh: string;
  labelEn: string;
}

export const COHORTS: CohortOption[] = [
  { year: 1, code: "CE06", labelTh: "ชั้นปีที่ 1 (CE06)", labelEn: "Year 1 (CE06)" },
  { year: 2, code: "CE05", labelTh: "ชั้นปีที่ 2 (CE05)", labelEn: "Year 2 (CE05)" },
  { year: 3, code: "CE04", labelTh: "ชั้นปีที่ 3 (CE04)", labelEn: "Year 3 (CE04)" },
  { year: 4, code: "CE03", labelTh: "ชั้นปีที่ 4 (CE03)", labelEn: "Year 4 (CE03)" },
];

interface CohortSelectorProps {
  selectedYear: number;
  onSelectYear: (year: number) => void;
  userYear: number; // 0 = superadmin (can edit all), otherwise specific year
  isSuperAdmin: boolean;
  lang: string;
}

export default function CohortSelector({
  selectedYear,
  onSelectYear,
  userYear,
  isSuperAdmin,
  lang,
}: CohortSelectorProps) {
  const isTh = lang === "th";
  const canEditSelected = isSuperAdmin || userYear === selectedYear;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <label htmlFor="cohort-select" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
          {isTh ? "เลือกชั้นปี / Cohort:" : "Select Cohort:"}
        </label>
        <select
          id="cohort-select"
          value={selectedYear}
          onChange={(e) => onSelectYear(Number(e.target.value))}
          className="px-3 py-2 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          {COHORTS.map((c) => (
            <option key={c.year} value={c.year}>
              {isTh ? c.labelTh : c.labelEn}
              {!isSuperAdmin && userYear === c.year ? (isTh ? " (สิทธิ์แก้ไขของคุณ)" : " (Your assigned year)") : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {canEditSelected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isTh ? "มีสิทธิ์แก้ไขข้อมูลชั้นปีนี้" : "Edit mode active for this cohort"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {isTh
              ? `โหมดอ่านอย่างเดียว (คุณมีสิทธิ์แก้ไขชั้นปีที่ ${userYear})`
              : `Read-only mode (You can only edit Year ${userYear})`}
          </span>
        )}
      </div>
    </div>
  );
}
