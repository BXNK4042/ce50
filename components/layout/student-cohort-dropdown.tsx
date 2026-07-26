"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatCohortLabel, isCohortGraduated } from "@/lib/cohort";

interface StudentCohortDropdownProps {
  cohorts: string[];
  lang: string;
  selectedCohort?: string;
  onChange?: (cohort: string) => void;
  className?: string;
}

export default function StudentCohortDropdown({
  cohorts,
  lang,
  selectedCohort,
  onChange,
  className = "",
}: StudentCohortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTh = lang === "th";

  const defaultCohortList = cohorts.length > 0 ? cohorts : ["CE06", "CE05", "CE04", "CE03", "CE02", "CE01"];
  
  // ponytail: group cohorts into active undergrads vs graduated alumni
  const activeCohorts = defaultCohortList.filter((c) => !isCohortGraduated(c));
  const alumniCohorts = defaultCohortList.filter((c) => isCohortGraduated(c));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = selectedCohort
    ? formatCohortLabel(selectedCohort, lang)
    : (isTh ? "เลือกนักศึกษารายรุ่น" : "Select Student Cohort");

  const renderCohortItem = (cohortCode: string) => {
    const formattedLabel = formatCohortLabel(cohortCode, lang);
    const isSelected = selectedCohort?.toUpperCase() === cohortCode.toUpperCase();

    if (onChange) {
      return (
        <button
          key={cohortCode}
          type="button"
          onClick={() => {
            onChange(cohortCode);
            setIsOpen(false);
          }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
            isSelected
              ? "bg-blue-50 dark:bg-sky-950/40 text-blue-600 dark:text-sky-300 font-bold"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <span>{formattedLabel}</span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{cohortCode}</span>
        </button>
      );
    }

    return (
      <Link
        key={cohortCode}
        href={`/${lang}/people/students/${cohortCode.toLowerCase()}`}
        onClick={() => setIsOpen(false)}
        className={`block px-4 py-2 text-xs flex items-center justify-between transition-colors ${
          isSelected
            ? "bg-blue-50 dark:bg-sky-950/40 text-blue-600 dark:text-sky-300 font-bold"
            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        }`}
      >
        <span>{formattedLabel}</span>
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{cohortCode}</span>
      </Link>
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-between gap-2.5 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white bg-white/90 dark:bg-black/90 border border-blue-200 dark:border-zinc-800 rounded-xl shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-4 h-4 text-blue-600 dark:text-sky-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
            />
          </svg>
          <span>{currentLabel}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 shadow-xl ring-1 ring-black/5 focus:outline-hidden divide-y divide-zinc-100 dark:divide-zinc-900 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1.5 px-3 bg-zinc-50/80 dark:bg-zinc-900/50 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {isTh ? "ทำเนียบนศ. / ศิษย์เก่า" : "Student / Alumni Cohorts"}
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {activeCohorts.length > 0 && (
              <div>
                <div className="py-1 px-3 bg-zinc-50/50 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {isTh ? "นักศึกษาปัจจุบัน (Active)" : "Active Students"}
                </div>
                {activeCohorts.map(renderCohortItem)}
              </div>
            )}

            {alumniCohorts.length > 0 && (
              <div className="mt-1 border-t border-zinc-100 dark:border-zinc-900/80 pt-1">
                <div className="py-1 px-3 bg-purple-50/50 dark:bg-purple-950/20 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{isTh ? "ศิษย์เก่า (Alumni)" : "Alumni / Graduated"}</span>
                  <span className="text-[9px] bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300 font-mono">
                    GRAD
                  </span>
                </div>
                {alumniCohorts.map(renderCohortItem)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
