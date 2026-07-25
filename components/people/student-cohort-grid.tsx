import Link from "next/link";
import { formatCohortLabel } from "@/lib/cohort";

interface CohortItem {
  code: string;
  yearTh: string;
  yearEn: string;
  descTh: string;
  descEn: string;
  color: string;
  textColor: string;
}

interface StudentCohortGridProps {
  cohorts: CohortItem[];
  lang: string;
}

export function StudentCohortGrid({ cohorts, lang }: StudentCohortGridProps) {
  const isTh = lang === "th";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cohorts.map((cohort) => (
        <Link
          key={cohort.code}
          href={`/${lang}/people/students/${cohort.code.toLowerCase()}`}
          className="group bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cohort.color} flex items-center justify-center font-bold text-xl ${cohort.textColor} shadow-inner`}>
                {cohort.code}
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-sky-900/40">
                {formatCohortLabel(cohort.code, lang)}
              </span>
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
              {isTh ? `${cohort.yearTh} (${formatCohortLabel(cohort.code, "th")})` : `${cohort.yearEn} (${formatCohortLabel(cohort.code, "en")})`}
            </h2>
            
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isTh ? cohort.descTh : cohort.descEn}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/30 flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
            <span>{isTh ? "ดูรายชื่อทั้งหมด" : "View Directory"}</span>
            <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
