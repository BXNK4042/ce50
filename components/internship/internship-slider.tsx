"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { INTERN_STUDENTS, fetchInternshipStudents, InternStudent } from "@/lib/internship-data";

interface InternshipSliderProps {
  lang: string;
}

export default function InternshipSlider({ lang }: InternshipSliderProps) {
  const isTh = lang === "th";
  const [students, setStudents] = useState<InternStudent[]>(INTERN_STUDENTS);

  useEffect(() => {
    fetchInternshipStudents().then((data) => {
      if (data && data.length > 0) {
        setStudents(data);
      }
    });
  }, []);

  return (
    <div className="w-full mt-8">
      {/* Static Responsive Grid (4 Columns Per Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {students.map((person) => {
          const name = isTh ? person.name_th : person.name_en;
          const position = isTh ? person.position_th : person.position_en;

          return (
            <Link
              key={person.id}
              href={`/${lang}/internship/${person.id}`}
              className="w-full h-[420px] bg-zinc-800 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40 cursor-pointer select-none flex flex-col justify-end relative group block"
            >
              {/* Full Background Portrait Image */}
              {person.photo && (
                <img
                  src={person.photo}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                />
              )}
              {/* Premium Dark Gradient Overlay at the bottom for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

              {/* Profile Info - Floated at the bottom-left */}
              <div className="p-6 flex flex-col gap-2 z-20 text-left w-full">
                {/* Single Line Right-to-Left Scrolling Ticker for Company & Position */}
                <div className="w-full overflow-hidden whitespace-nowrap py-0.5">
                  <div className="animate-ticker inline-block">
                    <span className="text-[11px] font-extrabold text-sky-400 dark:text-sky-300 uppercase tracking-wide">
                      {person.company}
                    </span>
                    <span className="mx-2 text-sky-400 font-bold">•</span>
                    <span className="text-[11px] font-bold text-sky-300 dark:text-sky-300 uppercase tracking-wide">
                      {position}
                    </span>
                  </div>
                </div>

                {/* Student Name */}
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
                  {name}
                </h3>

                {/* Action Arrow Footer */}
                <div className="text-xs text-white/80 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-medium">
                    {isTh ? "ดูรายละเอียดการฝึกงาน" : "View Internship Details"}
                  </span>
                  <span className="text-white group-hover:translate-x-1 transition-transform font-bold">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
