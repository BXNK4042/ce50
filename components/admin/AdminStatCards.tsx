"use client";

import { Users, GraduationCap, Briefcase, ChalkboardTeacher, Door, Calendar, Video, Buildings } from "@phosphor-icons/react";

interface StatItem {
  key: string;
  labelEn: string;
  labelTh: string;
  count: number;
  icon: React.ElementType;
  accent: string;
}

interface AdminStatCardsProps {
  dataCounts: Record<string, number>;
  activeTab: string;
  isTh: boolean;
  onTabChange: (tab: any) => void;
}

export default function AdminStatCards({
  dataCounts,
  activeTab,
  isTh,
  onTabChange,
}: AdminStatCardsProps) {
  const stats: StatItem[] = [
    { key: "students", labelEn: "Students", labelTh: "นิสิต", count: dataCounts.students || 0, icon: GraduationCap, accent: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { key: "works", labelEn: "Student Works", labelTh: "ผลงานนิสิต", count: dataCounts.works || 0, icon: Briefcase, accent: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { key: "teachers", labelEn: "Faculty & Staff", labelTh: "คณาจารย์/บุคลากร", count: dataCounts.teachers || 0, icon: ChalkboardTeacher, accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { key: "rooms", labelEn: "Rooms", labelTh: "ห้องเรียน", count: dataCounts.rooms || 0, icon: Door, accent: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { key: "schedules_class", labelEn: "Class Schedules", labelTh: "ตารางเรียน", count: dataCounts.schedules_class || 0, icon: Calendar, accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { key: "users", labelEn: "Admin Users", labelTh: "ผู้ดูแลระบบ", count: dataCounts.users || 0, icon: Users, accent: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeTab === stat.key;
        return (
          <button
            key={stat.key}
            onClick={() => onTabChange(stat.key)}
            className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-150 relative overflow-hidden group ${
              isActive
                ? "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 shadow-sm ring-1 ring-zinc-800/50 dark:ring-zinc-700/50"
                : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400 dark:text-zinc-400">
                {isTh ? stat.labelTh : stat.labelEn}
              </span>
              <div className={`p-1.5 rounded-lg border text-sm ${stat.accent}`}>
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight font-mono">
                {stat.count.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400">items</span>
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
