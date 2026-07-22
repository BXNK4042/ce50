"use client";

import { useState } from "react";
import { Student } from "@/lib/types";

interface StudentGridClientProps {
  students: Student[];
  lang: string;
  dict: any;
}

export function StudentGridClient({ students, lang, dict }: StudentGridClientProps) {
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black/50 border border-blue-100 dark:border-zinc-800 rounded-xl p-8 text-center">
        <svg
          className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          {lang === "th" ? "ไม่พบข้อมูลนักศึกษาในรุ่นนี้" : "No student records found for this cohort."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {students.map((student) => {
          const name = lang === "th" ? student.name_th : (student.name_en || student.name_th);
          const initials = student.name_en 
            ? student.name_en.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : name.slice(0, 2);

          return (
            <div
              key={student.id}
              onClick={() => setActiveStudent(student)}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-black/40 border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-900"
            >
              {/* Photo Background */}
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-zinc-900 dark:to-zinc-950">
                  <div className="w-20 h-20 rounded-full bg-blue-600 dark:bg-sky-500 flex items-center justify-center text-white text-2xl font-bold tracking-wider select-none shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    {initials}
                  </div>
                </div>
              )}

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10 opacity-90 group-hover:opacity-95 transition-opacity" />

              {/* Floating role badge (Top-Right) */}
              {student.class_role && (
                <span className="absolute top-4 right-4 z-20 px-3 py-1 text-xs font-semibold bg-blue-600/90 dark:bg-sky-500/90 text-white rounded-lg backdrop-blur-md shadow-md select-none tracking-wide">
                  {student.class_role}
                </span>
              )}

              {/* Student Details (Bottom-Left) */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-left text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span className="text-[11px] font-bold text-sky-400 tracking-wider block mb-1">
                  ID: {student.student_id}
                </span>
                <h3 className="text-xl font-bold tracking-tight line-clamp-1 leading-tight group-hover:text-sky-300 transition-colors">
                  {name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup for remaining details */}
      {activeStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            onClick={() => setActiveStudent(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 transform scale-100 transition-all duration-300 flex flex-col">
            
            {/* Top Close Button */}
            <button
              onClick={() => setActiveStudent(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Profile Photo */}
            <div className="h-52 relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center overflow-hidden">
              {activeStudent.photo ? (
                <>
                  {/* Blurred background context */}
                  <img
                    src={activeStudent.photo}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 select-none z-0"
                  />
                  {/* Contain-fit front photo to show the entire portrait */}
                  <img
                    src={activeStudent.photo}
                    alt={lang === "th" ? activeStudent.name_th : (activeStudent.name_en || activeStudent.name_th)}
                    className="w-full h-full object-contain relative z-10"
                  />
                </>
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 dark:bg-sky-500 flex items-center justify-center text-white text-2xl font-bold select-none shadow-lg">
                  {activeStudent.name_en 
                    ? activeStudent.name_en.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                    : activeStudent.name_th.slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
              
              {/* Role badge inside photo header */}
              {activeStudent.class_role && (
                <span className="absolute bottom-4 right-6 z-20 px-3 py-1 text-xs font-semibold bg-blue-600 dark:bg-sky-500 text-white rounded-lg shadow-md select-none">
                  {activeStudent.class_role}
                </span>
              )}
            </div>

            {/* Details Content */}
            <div className="p-5 md:p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-sky-400 tracking-wider">
                  ID: {activeStudent.student_id}
                </span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                  {activeStudent.name_th}
                </h2>
                {activeStudent.name_en && (
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {activeStudent.name_en}
                  </p>
                )}
              </div>

              {/* Grid of additional info */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
                {activeStudent.track && (
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {lang === "th" ? "สายรหัส (Track)" : "Track"}
                    </span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {activeStudent.track}
                    </span>
                  </div>
                )}

                {activeStudent.contact && (
                  <div className="flex flex-col gap-1.5 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {lang === "th" ? "ช่องทางติดต่อ (Contact)" : "Contact"}
                    </span>
                    <a
                      href={`mailto:${activeStudent.contact}`}
                      className="text-sm font-bold text-blue-600 dark:text-sky-400 hover:underline truncate"
                    >
                      {activeStudent.contact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
