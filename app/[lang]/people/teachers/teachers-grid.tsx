"use client";

import { useState } from "react";
import { Teacher } from "@/lib/types";

interface TeachersGridProps {
  teachers: Teacher[];
  lang: string;
}

export default function TeachersGrid({ teachers, lang }: TeachersGridProps) {
  const isTh = lang === "th";
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-none">
      {teachers.map((teacher) => {
        const name = isTh ? teacher.name_th : (teacher.name_en || teacher.name_th);
        const initials = teacher.name_en
          ? teacher.name_en
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : name.slice(0, 2);

        const isAthasart = teacher.id === 1;
        const isOverlayActive = activeOverlayId === teacher.id;

        return (
          <div
            key={teacher.id}
            className="relative group w-full h-[300px]"
            onMouseEnter={() => {
              if (isAthasart) {
                setActiveOverlayId(teacher.id);
              }
            }}
            onMouseLeave={() => {
              if (isAthasart) {
                setActiveOverlayId(null);
              }
            }}
          >
            {/* Actual Card Container (with overflow-hidden) */}
            <div
              className={`w-full h-full border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer select-none flex flex-col justify-end relative bg-gradient-to-b from-[#a7c7f2] to-[#2b5c9e] dark:from-[#3b7cd4] dark:to-[#12294a] ${
                isAthasart
                  ? "hover:from-[#fbc6a9] hover:to-[#e06e30] dark:hover:from-[#ff7b30] dark:hover:to-[#9c3100] hover:shadow-orange-500/20"
                  : "hover:shadow-blue-500/20"
              }`}
            >
              {/* Full Background Portrait Image */}
              {teacher.photo ? (
                <img
                  src={`${teacher.photo}?v=8`}
                  alt={name}
                  className="absolute right-0 bottom-0 h-full w-auto object-contain object-right translate-x-[15%] z-0"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold z-0">
                  {initials}
                </div>
              )}

              {/* Profile Info - Floated at the bottom-left */}
              <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 backdrop-blur-md text-white rounded-md border border-white/20 uppercase tracking-wider select-none">
                    {teacher.id === 6
                      ? (isTh ? "นักวิชาการคอมพิวเตอร์" : "Computer Technical Officer")
                      : (isTh ? "อาจารย์ประจำสาขา" : "Faculty Member")}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 group-hover:text-sky-300 transition-colors line-clamp-1">
                    {name}
                  </h3>
                  {teacher.advise_years && teacher.advise_years.length > 0 && (
                    <p className="text-xs text-white/60 mt-1 font-medium">
                      {isTh ? "ชั้นปีที่ดูแล: " : "Advise: "}
                      {teacher.advise_years.map((y: string) => `${isTh ? "ปี " : "Year "}${y}`).join(", ")}
                    </p>
                  )}
                </div>
                {teacher.contact && (
                  <div className="text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="truncate">{teacher.contact}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                )}
              </div>
            </div>

            {/* Viewport Overlay for Athasart (outside overflow-hidden) */}
            {isAthasart && teacher.photo && (
              <div
                onClick={() => setActiveOverlayId(null)}
                className={`fixed inset-0 bg-black/75 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500 z-[9999] ${
                  isOverlayActive
                    ? "opacity-100 pointer-events-auto cursor-pointer"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="flex flex-col items-center justify-center max-h-screen p-4 text-center">
                  <div
                    className={`relative h-[65vh] aspect-[350/263] transition-all duration-1000 ease-out transform ${
                      isOverlayActive ? "scale-100 rotate-[-1080deg]" : "scale-0 rotate-0"
                    }`}
                  >
                    <img
                      src={`${teacher.photo}?v=8`}
                      alt={name}
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(245,148,92,0.4)] pointer-events-none"
                    />
                    
                    {/* Left Eye Red Glow */}
                    <div
                      className={`absolute top-[28.5%] left-[45.2%] w-[1.5%] h-[1.5%] bg-red-500 rounded-full shadow-[0_0_12px_6px_#ff0000,0_0_24px_12px_#ff0000] opacity-0 scale-0 transition-all ease-out ${
                        isOverlayActive
                          ? "opacity-100 scale-100 delay-[1000ms] duration-500"
                          : "opacity-0 scale-0 duration-300"
                      }`}
                    />

                    {/* Right Eye Red Glow */}
                    <div
                      className={`absolute top-[28.5%] left-[54.8%] w-[1.5%] h-[1.5%] bg-red-500 rounded-full shadow-[0_0_12px_6px_#ff0000,0_0_24px_12px_#ff0000] opacity-0 scale-0 transition-all ease-out ${
                        isOverlayActive
                          ? "opacity-100 scale-100 delay-[1000ms] duration-500"
                          : "opacity-0 scale-0 duration-300"
                      }`}
                    />
                  </div>

                  <h2
                    className={`text-2xl md:text-4xl font-extrabold text-white mt-8 tracking-wider drop-shadow-[0_4px_12px_rgba(245,148,92,0.6)] transition-all duration-700 delay-300 ease-out transform ${
                      isOverlayActive ? "scale-100" : "scale-0"
                    }`}
                  >
                    {isTh ? "ประธานสาขาวิศวกรรมคอมพิวเตอร์" : "Head of Computer Engineering Department"}
                  </h2>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
