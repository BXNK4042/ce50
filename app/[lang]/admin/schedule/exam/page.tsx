"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ExamSlot } from "@/lib/api";
import CohortSelector from "@/components/admin/cohort-selector";

export default function AdminExamSchedulePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "th";
  const isTh = lang === "th";

  const [selectedYear, setSelectedYear] = useState<number>(3);
  const [userRole, setUserRole] = useState<string>("");
  const [userYear, setUserYear] = useState<number>(0);

  const [exams, setExams] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [examType, setExamType] = useState<"schedule" | "outside">("schedule");
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [dateRaw, setDateRaw] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [midtermTh, setMidtermTh] = useState("");
  const [midtermEn, setMidtermEn] = useState("");
  const [finalsTh, setFinalsTh] = useState("");
  const [finalsEn, setFinalsEn] = useState("");

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

    if (roleCookie !== "superadmin" && yearCookie && Number(yearCookie) > 0) {
      setSelectedYear(Number(yearCookie));
    }
  }, []);

  useEffect(() => {
    fetchExams(selectedYear);
  }, [selectedYear]);

  const fetchExams = async (year: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.examSchedule(year, 1);
      setExams(data || []);
    } catch (e: any) {
      console.error(e);
      setError(isTh ? "ไม่สามารถโหลดตารางสอบได้" : "Failed to load exam schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setExamType("schedule");
    setCode("");
    setNameTh("");
    setNameEn("");
    setDateRaw("");
    setStartTime("09:00");
    setEndTime("12:00");
    setMidtermTh("");
    setMidtermEn("");
    setFinalsTh("");
    setFinalsEn("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const item = exams[index];
    setEditingIndex(index);
    setCode(item.code || "");
    setNameTh(item.name_th || "");
    setNameEn(item.name_en || "");

    const isOutside = item.date_raw === "9999-12-31";
    setExamType(isOutside ? "outside" : "schedule");
    setDateRaw(isOutside ? "" : item.date_raw || "");
    setStartTime(item.start_time || "09:00");
    setEndTime(item.end_time || "12:00");
    setMidtermTh(item.midterm_th || "");
    setMidtermEn(item.midterm_en || "");
    setFinalsTh(item.finals_th || "");
    setFinalsEn(item.finals_en || "");
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!code.trim()) return;

    const isOutside = examType === "outside";
    const newItem: ExamSlot = {
      code: code.trim(),
      name_th: nameTh.trim(),
      name_en: nameEn.trim(),
      date_raw: isOutside ? "9999-12-31" : dateRaw,
      start_time: isOutside ? "23:59" : startTime,
      end_time: isOutside ? "23:59" : endTime,
      midterm_th: isOutside ? "สอบนอกตาราง" : midtermTh.trim(),
      midterm_en: isOutside ? "Outside Schedule" : midtermEn.trim(),
      finals_th: isOutside ? "สอบนอกตาราง" : finalsTh.trim(),
      finals_en: isOutside ? "Outside Schedule" : finalsEn.trim(),
    };

    if (editingIndex !== null) {
      const copy = [...exams];
      copy[editingIndex] = newItem;
      setExams(copy);
    } else {
      setExams([...exams, newItem]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (index: number) => {
    setExams(exams.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (!canEditSelected) return;
    setSaving(true);
    setError(null);
    try {
      await api.saveExamSchedule(selectedYear, exams, 1);
      setToast(isTh ? "บันทึกตารางสอบสำเร็จ!" : "Exam schedule saved successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || (isTh ? "เกิดข้อผิดพลาดในการบันทึก" : "Failed to save exam schedule"));
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
                href={`/${lang}/schedule?type=exam`}
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
              >
                ← {isTh ? "ดูตารางสอบหน้าเว็บ" : "View Public Exam Schedule"}
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
              {isTh ? "จัดการตารางสอบ (Exam Schedule CRUD)" : "Manage Exam Schedule"}
            </h1>
          </div>

          {canEditSelected && (
            <div className="flex gap-3 self-start md:self-auto">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold text-sm transition-all cursor-pointer"
              >
                + {isTh ? "เพิ่มวิชาสอบ" : "Add Exam"}
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                {saving ? (isTh ? "กำลังบันทึก..." : "Saving...") : isTh ? "บันทึกตารางสอบ" : "Save Schedule"}
              </button>
            </div>
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
            {isTh ? "กำลังโหลดข้อมูลตารางสอบ..." : "Loading exam schedule..."}
          </div>
        ) : (
          /* Exam List Table */
          <div className="overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  <th className="p-4 w-28">CODE</th>
                  <th className="p-4">SUBJECT</th>
                  <th className="p-4">TYPE</th>
                  <th className="p-4">DATE & TIME</th>
                  {canEditSelected && <th className="p-4 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 text-sm">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400">
                      {isTh ? "ยังไม่มีข้อมูลรายวิชาสอบสำหรับชั้นปีนี้" : "No exam schedules found for this cohort."}
                    </td>
                  </tr>
                ) : (
                  exams.map((item, idx) => {
                    const isOutside = item.date_raw === "9999-12-31";
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-sky-400">{item.code}</td>
                        <td className="p-4">
                          <div className="font-bold">{isTh ? item.name_th : item.name_en}</div>
                          <div className="text-xs text-zinc-400">{isTh ? item.name_en : item.name_th}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isOutside
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                : "bg-blue-100 dark:bg-sky-950/40 text-blue-800 dark:text-sky-300 border border-blue-300 dark:border-sky-800"
                            }`}
                          >
                            {isOutside ? (isTh ? "นอกตาราง" : "Outside") : isTh ? "ตามตาราง" : "In Schedule"}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                          {isOutside ? "-" : `${item.date_raw} (${item.start_time} - ${item.end_time})`}
                        </td>
                        {canEditSelected && (
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEdit(idx)}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                              {isTh ? "แก้ไข" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20"
                            >
                              {isTh ? "ลบ" : "Delete"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <h3 className="text-lg font-bold">
                {editingIndex !== null
                  ? isTh ? "แก้ไขตารางสอบ" : "Edit Exam Slot"
                  : isTh ? "เพิ่มวิชาสอบใหม่" : "Add New Exam Slot"}
              </h3>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="schedule"
                      checked={examType === "schedule"}
                      onChange={() => setExamType("schedule")}
                    />
                    {isTh ? "สอบตามตาราง" : "In Schedule"}
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="outside"
                      checked={examType === "outside"}
                      onChange={() => setExamType("outside")}
                    />
                    {isTh ? "สอบนอกตาราง" : "Outside Schedule"}
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "รหัสวิชา" : "Course Code"}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CPE 321"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ชื่อวิชา (TH)" : "Subject (TH)"}</label>
                    <input
                      type="text"
                      value={nameTh}
                      onChange={(e) => setNameTh(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "ชื่อวิชา (EN)" : "Subject (EN)"}</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                {examType === "schedule" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "วันที่สอบ" : "Date"}</label>
                      <input
                        type="date"
                        value={dateRaw}
                        onChange={(e) => setDateRaw(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "เริ่ม" : "Start"}</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">{isTh ? "สิ้นสุด" : "End"}</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white"
                >
                  {isTh ? "บันทึก" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
