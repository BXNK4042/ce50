"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  ChalkboardTeacher,
  Door,
  Calendar,
  Video,
  Users,
  SignOut,
  SlidersHorizontal,
  Translate,
  House,
  ShieldCheck,
  BuildingOffice,
} from "@phosphor-icons/react";

export type TabType =
  | "schedules_class"
  | "schedules_exam"
  | "students"
  | "works"
  | "teachers"
  | "rooms"
  | "users"
  | "internship";

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedYear: number;
  onYearChange: (yr: number) => void;
  selectedTerm: number;
  onTermChange: (term: number) => void;
  role: string;
  adminYear: number;
  lang: string;
  isTh: boolean;
}

export default function AdminShell({
  children,
  activeTab,
  onTabChange,
  selectedYear,
  onYearChange,
  selectedTerm,
  onTermChange,
  role,
  adminYear,
  lang,
  isTh,
}: AdminShellProps) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    document.cookie = "admin_role=; path=/; max-age=0";
    document.cookie = "admin_year=; path=/; max-age=0";
    router.push(`/${lang}/admin/login`);
  };

  const navItems = [
    { key: "schedules_class", labelEn: "Class Schedule", labelTh: "ตารางเรียน", icon: Calendar, group: "schedules" },
    { key: "schedules_exam", labelEn: "Exam Schedule", labelTh: "ตารางสอบ", icon: Calendar, group: "schedules" },
    { key: "students", labelEn: "Students", labelTh: "นิสิต", icon: GraduationCap, group: "entities" },
    { key: "works", labelEn: "Student Works", labelTh: "ผลงานนิสิต", icon: Briefcase, group: "entities" },
    { key: "teachers", labelEn: "Teachers", labelTh: "คณาจารย์", icon: ChalkboardTeacher, group: "entities" },
    { key: "rooms", labelEn: "Rooms", labelTh: "ห้องเรียน", icon: Door, group: "entities" },
    { key: "internship", labelEn: "Internships", labelTh: "ฝึกงาน", icon: BuildingOffice, group: "entities" },
    { key: "users", labelEn: "Admin Accounts", labelTh: "ผู้ดูแลระบบ", icon: Users, group: "system" },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Linear Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 flex flex-col justify-between p-4 sticky top-0 h-[100dvh] z-30">
        <div>
          {/* Brand Header 
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60">
            <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs tracking-wider text-white shadow-inner">
                CE
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                  CE50 Admin Suite
                </h1>
                <p className="text-[10px] font-mono text-zinc-500">v2.0 Linear-B2B</p>
              </div>
            </Link>
          </div>*/}

          {/* Nav Links */}
          <nav className="space-y-5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 mb-1.5">
                {isTh ? "ตารางและแผน" : "Schedules"}
              </div>
              <div className="space-y-0.5">
                {navItems
                  .filter((i) => i.group === "schedules")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onTabChange(item.key as TabType)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          isActive
                            ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/80 shadow-xs font-semibold"
                            : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <Icon size={16} weight={isActive ? "fill" : "regular"} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"} />
                        <span>{isTh ? item.labelTh : item.labelEn}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 mb-1.5">
                {isTh ? "การจัดการข้อมูล" : "Entities & Data"}
              </div>
              <div className="space-y-0.5">
                {navItems
                  .filter((i) => i.group === "entities")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onTabChange(item.key as TabType)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          isActive
                            ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/80 shadow-xs font-semibold"
                            : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <Icon size={16} weight={isActive ? "fill" : "regular"} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"} />
                        <span>{isTh ? item.labelTh : item.labelEn}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {role === "superadmin" && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 mb-1.5">
                  {isTh ? "ระบบ" : "System Access"}
                </div>
                <div className="space-y-0.5">
                  {navItems
                    .filter((i) => i.group === "system")
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => onTabChange(item.key as TabType)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            isActive
                              ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/80 shadow-xs font-semibold"
                              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                          }`}
                        >
                          <Icon size={16} weight={isActive ? "fill" : "regular"} className={isActive ? "text-rose-600 dark:text-rose-400" : "text-zinc-400"} />
                          <span>{isTh ? item.labelTh : item.labelEn}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/60 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">{role}</p>
                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Year {adminYear}</p>
              </div>
            </div>
            {/*
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
              title={isTh ? "ออกจากระบบ" : "Sign out"}
            >
              <SignOut size={16} />
            </button>*/}
          </div>
          {/*
          <Link
            href={`/${lang}`}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-all"
          >
            <House size={14} />
            <span>{isTh ? "กลับหน้าหลัก" : "Back to Website"}</span>
          </Link>*/}
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Filter & Context Bar */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between gap-4">
          {/* Year/Term Selector Filters */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <SlidersHorizontal size={14} />
              <span>{isTh ? "กรองตามชั้นปี:" : "Academic Cohort:"}</span>
            </span>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {[1, 2, 3, 4].map((yr) => (
                <button
                  key={yr}
                  onClick={() => onYearChange(yr)}
                  disabled={role !== "superadmin" && yr !== adminYear}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-colors ${
                    selectedYear === yr
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border-zinc-200 dark:border-zinc-700"
                      : role !== "superadmin" && yr !== adminYear
                      ? "border-transparent text-zinc-400 dark:text-zinc-600 opacity-40 cursor-not-allowed"
                      : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  Y{yr}
                </button>
              ))}
            </div>

            {/* Term Switcher for Schedules */}
            {(activeTab === "schedules_class" || activeTab === "schedules_exam") && (
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {[1, 2].map((t) => (
                  <button
                    key={t}
                    onClick={() => onTermChange(t)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-colors ${
                      selectedTerm === t
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border-zinc-200 dark:border-zinc-700"
                        : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    Term {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 flex-1 bg-zinc-50 dark:bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}
