"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCohortLabel, getCohortStatus } from "@/lib/cohort";

export interface CohortItem {
  code: string;
  descTh: string;
  descEn: string;
  color: string;
  textColor: string;
  yearTh?: string;
  yearEn?: string;
}

interface StudentCohortGridProps {
  cohorts: CohortItem[];
  lang: string;
}

export function StudentCohortGrid({ cohorts, lang }: StudentCohortGridProps) {
  const [filter, setFilter] = useState<"all" | "active" | "alumni">("all");
  const isTh = lang === "th";

  const enrichedCohorts = cohorts.map((cohort) => {
    const status = getCohortStatus(cohort.code);
    return {
      ...cohort,
      status,
    };
  });

  const filteredCohorts = enrichedCohorts.filter((item) => {
    if (filter === "active") return !item.status.isGraduated;
    if (filter === "alumni") return item.status.isGraduated;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ponytail: minimalist filter tab bar for active vs alumni cohorts */}
      <div className="flex items-center gap-2 p-1 bg-white/60 dark:bg-black/40 backdrop-blur-xs border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isTh ? `ทั้งหมด (${cohorts.length})` : `All (${cohorts.length})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "active"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isTh
            ? `นักศึกษาปัจจุบัน (${enrichedCohorts.filter((c) => !c.status.isGraduated).length})`
            : `Active Students (${enrichedCohorts.filter((c) => !c.status.isGraduated).length})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter("alumni")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "alumni"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isTh
            ? `ศิษย์เก่า / จบการศึกษา (${enrichedCohorts.filter((c) => c.status.isGraduated).length})`
            : `Alumni / Graduated (${enrichedCohorts.filter((c) => c.status.isGraduated).length})`}
        </button>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCohorts.map((cohort) => {
          const { status } = cohort;
          const isGraduated = status.isGraduated;

          return (
            <Link
              key={cohort.code}
              href={`/${lang}/people/students/${cohort.code.toLowerCase()}`}
              className="group bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cohort.color} flex items-center justify-center font-bold text-xl ${cohort.textColor} shadow-inner`}
                  >
                    {cohort.code}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      isGraduated
                        ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                        : "bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 border-blue-100 dark:border-sky-900/40"
                    }`}
                  >
                    {isGraduated
                      ? isTh
                        ? "ศิษย์เก่า / Alumni"
                        : "Alumni"
                      : formatCohortLabel(cohort.code, lang)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                  {isTh
                    ? `${status.labelTh} (${formatCohortLabel(cohort.code, "th")})`
                    : `${status.labelEn} (${formatCohortLabel(cohort.code, "en")})`}
                </h2>

                {isGraduated && status.graduationYearBE && (
                  <div className="mt-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                    {isTh
                      ? `ปีที่สำเร็จการศึกษา: พ.ศ. ${status.graduationYearBE}`
                      : `Graduation Year: B.E. ${status.graduationYearBE}`}
                  </div>
                )}

                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isTh ? cohort.descTh : cohort.descEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/30 flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                <span>
                  {isGraduated
                    ? isTh
                      ? "ดูทำเนียบศิษย์เก่า"
                      : "View Alumni Directory"
                    : isTh
                    ? "ดูรายชื่อทั้งหมด"
                    : "View Directory"}
                </span>
                <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
