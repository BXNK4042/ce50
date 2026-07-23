"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ClassCell } from "@/lib/api";
import CohortSelector from "@/components/admin/cohort-selector";

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
];

const DAYS = [
  { id: "monday", labelTh: "จันทร์", labelEn: "Mon" },
  { id: "tuesday", labelTh: "อังคาร", labelEn: "Tue" },
  { id: "wednesday", labelTh: "พุธ", labelEn: "Wed" },
  { id: "thursday", labelTh: "พฤหัสบดี", labelEn: "Thu" },
  { id: "friday", labelTh: "ศุกร์", labelEn: "Fri" },
];

export default function AdminClassSchedulePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "th";
  const isTh = lang === "th";

  const [selectedYear, setSelectedYear] = useState<number>(3);
  const [userRole, setUserRole] = useState<string>("");
  const [userYear, setUserYear] = useState<number>(0);

  const [scheduleList, setScheduleList] = useState<ClassCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingSlot, setEditingSlot] = useState<{ day: string; time_slot: string } | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formInstrTh, setFormInstrTh] = useState("");
  const [formInstrEn, setFormInstrEn] = useState("");
  const [formDescTh, setFormDescTh] = useState("");
  const [formDescEn, setFormDescEn] = useState("");

  const isSuperAdmin = userRole === "superadmin";
  const canEditSelected = isSuperAdmin || userYear === selectedYear;

  useEffect(() => {
    const roleCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_role="))
      ?.split("=")[1];
    const yearCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_year="))
      ?.split("=")[1];

    if (roleCookie) setUserRole(roleCookie);
    if (yearCookie) setUserYear(Number(yearCookie));

    // Default to user's year if not superadmin and valid year
    if (roleCookie !== "superadmin" && yearCookie && Number(yearCookie) > 0) {
      setSelectedYear(Number(yearCookie));
    }
  }, []);

  useEffect(() => {
    fetchSchedule(selectedYear);
  }, [selectedYear]);

  const fetchSchedule = async (year: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.classSchedule(year, 1);
      setScheduleList(data || []);
    } catch (e: any) {
      console.error(e);
      setError(isTh ? "ไม่สามารถโหลดตารางเรียนได้" : "Failed to load class schedule");
    } finally {
      setLoading(false);
    }
  };

  const getCell = (day: string, time_slot: string) => {
    return scheduleList.find((c) => c.day === day && c.time_slot === time_slot);
  };

  const handleOpenEdit = (day: string, time_slot: string) => {
    if (!canEditSelected) return;
    const existing = getCell(day, time_slot);
    setEditingSlot({ day, time_slot });
    setFormCode(existing?.code || "");
    setFormNameTh(existing?.name_th || "");
    setFormNameEn(existing?.name_en || "");
    setFormRoom(existing?.room || "");
    setFormInstrTh(existing?.instructor_th || "");
    setFormInstrEn(existing?.instructor_en || "");
    setFormDescTh(existing?.description_th || "");
    setFormDescEn(existing?.description_en || "");
  };

  const handleSaveCell = () => {
    if (!editingSlot) return;
    const updated = scheduleList.filter(
      (c) => !(c.day === editingSlot.day && c.time_slot === editingSlot.time_slot)
    );

    if (formCode.trim()) {
      updated.push({
        day: editingSlot.day as any,
        time_slot: editingSlot.time_slot,
        code: formCode.trim(),
        name_th: formNameTh.trim(),
        name_en: formNameEn.trim(),
        room: formRoom.trim(),
        instructor_th: formInstrTh.trim(),
        instructor_en: formInstrEn.trim(),
        description_th: formDescTh.trim(),
        description_en: formDescEn.trim(),
      });
    }

    setScheduleList(updated);
    setEditingSlot(null);
  };

  const handleSaveAll = async () => {
    if (!canEditSelected) return;
    setSaving(true);
    setError(null);
    try {
      await api.saveClassSchedule(selectedYear, scheduleList, 1);
      setToast(isTh ? "บันทึกตารางเรียนสำเร็จ!" : "Class schedule saved successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || (isTh ? "เกิดข้อผิดพลาดในการบันทึก" : "Failed to save class schedule"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={`/${lang}/schedule?type=class`}
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
              >
                ← {isTh ? "ดูตารางเรียนหน้าเว็บ" : "View Public Timetable"}
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
              {isTh ? "จัดการตารางเรียน (Class Schedule CRUD)" : "Manage Class Schedule"}
            </h1>
          </div>

          {canEditSelected && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer self-start md:self-auto"
            >
              {saving ? (isTh ? "กำลังบันทึก..." : "Saving...") : isTh ? "บันทึกตารางเรียน" : "Save Schedule"}
            </button>
          )}
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className="p-4 mb-6 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg animate-bounce">
            ✅ {toast}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Cohort Selector */}
        <CohortSelector
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          userYear={userYear}
          isSuperAdmin={isSuperAdmin}
          lang={lang}
        />

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-zinc-500 animate-pulse">
            {isTh ? "กำลังโหลดข้อมูลตารางเรียน..." : "Loading class schedule..."}
          </div>
        ) : (
          /* Weekly Grid Editor */
          <div className="overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase w-32">
                    TIME / DAY
                  </th>
                  {DAYS.map((d) => (
                    <th key={d.id} className="p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                      {isTh ? d.labelTh : d.labelEn}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="p-3 font-mono text-xs text-zinc-500 font-bold bg-zinc-50/50 dark:bg-zinc-900/40">
                      {slot}
                    </td>
                    {DAYS.map((d) => {
                      const cell = getCell(d.id, slot);
                      return (
                        <td
                          key={d.id}
                          onClick={() => handleOpenEdit(d.id, slot)}
                          className={`p-3 text-xs border-l border-zinc-100 dark:border-zinc-800/40 transition-all ${
                            canEditSelected ? "cursor-pointer hover:bg-blue-500/10" : "cursor-default"
                          }`}
                        >
                          {cell ? (
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-800/40 text-blue-900 dark:text-sky-200">
                              <div className="font-bold text-sm">{cell.code}</div>
                              <div className="line-clamp-1 font-medium">{isTh ? cell.name_th : cell.name_en}</div>
                              {cell.room && (
                                <div className="text-[10px] opacity-75 mt-0.5">📍 {cell.room}</div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                              {canEditSelected ? "+" : "-"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingSlot && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold mb-4">
                {isTh ? `แก้ไขคาบเรียน (${editingSlot.day} @ ${editingSlot.time_slot})` : `Edit Class Slot (${editingSlot.day} @ ${editingSlot.time_slot})`}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "รหัสวิชา" : "Course Code"}</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CPE 321"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ชื่อวิชา (TH)" : "Subject Name (TH)"}</label>
                    <input
                      type="text"
                      value={formNameTh}
                      onChange={(e) => setFormNameTh(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ชื่อวิชา (EN)" : "Subject Name (EN)"}</label>
                    <input
                      type="text"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ห้องเรียน" : "Room"}</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. CPE-401"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ผู้สอน (TH)" : "Instructor (TH)"}</label>
                    <input
                      type="text"
                      value={formInstrTh}
                      onChange={(e) => setFormInstrTh(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ผู้สอน (EN)" : "Instructor (EN)"}</label>
                    <input
                      type="text"
                      value={formInstrEn}
                      onChange={(e) => setFormInstrEn(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setFormCode("");
                    handleSaveCell();
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-500/10 rounded-lg"
                >
                  {isTh ? "ลบวิชานี้ออก" : "Clear Slot"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800"
                  >
                    {isTh ? "ยกเลิก" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCell}
                    className="px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white"
                  >
                    {isTh ? "ตกลง" : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
