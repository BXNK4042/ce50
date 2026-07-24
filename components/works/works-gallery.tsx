"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, FolderKanban, X, Users, Cpu, ArrowUpRight, Award } from "lucide-react";

export interface WorkItem {
  id: string;
  type: "competition" | "project";
  title_en: string;
  title_th: string;
  image: string;
  year: string;
  badge_en: string;
  badge_th: string;
  summary_en: string;
  summary_th: string;
  description_en: string;
  description_th: string;
  team: string[];
  tech: string[];
}

interface WorksGalleryProps {
  lang: string;
  dict: {
    tagCompetition?: string;
    tagProject?: string;
    viewDetails?: string;
    close?: string;
    yearLabel?: string;
    teamLabel?: string;
    techLabel?: string;
    achievementLabel?: string;
  };
  dbItems?: WorkItem[];
}

export default function WorksGallery({ lang, dict, dbItems }: WorksGalleryProps) {
  const isTh = lang === "th";
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);

  // Temporarily hide Header & Footer when modal is open
  useEffect(() => {
    if (selectedWork) {
      document.body.classList.add("hide-header-footer");
    } else {
      document.body.classList.remove("hide-header-footer");
    }
    return () => {
      document.body.classList.remove("hide-header-footer");
    };
  }, [selectedWork]);

  const works = dbItems ?? [];

  if (works.length === 0) {
    return (
      <div className="w-full mt-10 flex items-center justify-center bg-white/50 dark:bg-black/30 border border-dashed border-blue-200 dark:border-zinc-800 rounded-xl p-12 text-zinc-500 dark:text-zinc-400">
        {isTh ? "ยังไม่มีผลงานในขณะนี้" : "No projects found."}
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      {/* Max 3 Cards Per Row Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {works.map((item) => {
          const isComp = item.type === "competition";
          const title = isTh ? item.title_th : item.title_en;
          const summary = isTh ? item.summary_th : item.summary_en;
          const badge = isTh ? item.badge_th : item.badge_en;
          const tagLabel = isComp
            ? dict.tagCompetition || (isTh ? "การแข่งขัน" : "Competition")
            : dict.tagProject || (isTh ? "โปรเจกต์" : "Project");

          return (
            <div
              key={item.id}
              onClick={() => setSelectedWork(item)}
              className="group relative h-72 lg:h-[22rem] w-full overflow-hidden rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-900 shadow-[0_6px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 cursor-pointer select-none"
            >
              {/* Full Background Cover Image */}
              <Image
                src={item.image}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient Overlay for Readable Floating Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 group-hover:to-black/30 transition-colors duration-300" />

              {/* Floating Content Container */}
              <div className="relative h-full flex flex-col justify-between p-6 z-10 text-white">
                {/* Top Floating Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-md ${
                      isComp
                        ? "bg-purple-600/90 text-purple-50 border border-purple-400/30"
                        : "bg-blue-600/90 text-blue-50 border border-blue-400/30"
                    }`}
                  >
                    {isComp ? (
                      <Trophy className="w-3.5 h-3.5" />
                    ) : (
                      <FolderKanban className="w-3.5 h-3.5" />
                    )}
                    {tagLabel}
                  </span>

                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 text-zinc-200 backdrop-blur-md border border-white/10">
                    {item.year}
                  </span>
                </div>

                {/* Bottom Floating Info */}
                <div className="space-y-2.5">
                  {/* Award / Achievement Badge */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30 backdrop-blur-sm">
                    <Award className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="line-clamp-1">{badge}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">
                    {title}
                  </h3>

                  {/* Short Summary */}
                  <p className="text-xs md:text-sm text-zinc-300/90 drop-shadow-sm line-clamp-2 leading-relaxed font-normal">
                    {summary}
                  </p>

                  {/* View Details Link */}
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-sky-300 group-hover:text-white transition-colors">
                    <span>{dict.viewDetails || (isTh ? "ดูรายละเอียดเพิ่มเติม" : "View Details")}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal Dialog */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-2xl animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors shadow-md"
              aria-label={dict.close || "Close"}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Image */}
            <div className="relative aspect-[21/9] w-full bg-zinc-800 overflow-hidden">
              <Image
                src={selectedWork.image}
                alt={isTh ? selectedWork.title_th : selectedWork.title_en}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full text-white shadow-md ${
                    selectedWork.type === "competition"
                      ? "bg-purple-600"
                      : "bg-blue-600"
                  }`}
                >
                  {selectedWork.type === "competition" ? (
                    <Trophy className="w-3.5 h-3.5" />
                  ) : (
                    <FolderKanban className="w-3.5 h-3.5" />
                  )}
                  {selectedWork.type === "competition"
                    ? dict.tagCompetition || (isTh ? "การแข่งขัน" : "Competition")
                    : dict.tagProject || (isTh ? "โปรเจกต์" : "Project")}
                </span>
                <span className="text-xs font-semibold text-zinc-200 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  {dict.yearLabel || (isTh ? "ปีการศึกษา" : "Academic Year")}: {selectedWork.year}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
                  {isTh ? selectedWork.title_th : selectedWork.title_en}
                </h2>

                {/* Achievement Badge */}
                <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-sm font-semibold">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>{isTh ? selectedWork.badge_th : selectedWork.badge_en}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-2">
                  {isTh ? "รายละเอียดโครงงาน" : "Overview & Description"}
                </h4>
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {isTh ? selectedWork.description_th : selectedWork.description_en}
                </p>
              </div>

              {/* Technologies Used */}
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  {dict.techLabel || (isTh ? "เทคโนโลยีที่ใช้" : "Technologies Used")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWork.tech.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  {dict.teamLabel || (isTh ? "ผู้จัดทำ / ทีมงาน" : "Team Members")}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {selectedWork.team.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Close Button */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setSelectedWork(null)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors shadow-sm"
                >
                  {dict.close || (isTh ? "ปิดหน้าต่าง" : "Close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
