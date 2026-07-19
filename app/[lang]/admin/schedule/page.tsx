"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ExamItem {
  code: string;
  nameEn: string;
  nameTh: string;
  dateRaw: string;
  timeRaw: string;
  startTimeRaw: string;
  endTimeRaw: string;
  midtermEn: string;
  midtermTh: string;
  finalsEn: string;
  finalsTh: string;
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    code: "CPE 321",
    nameEn: "Database Systems",
    nameTh: "ระบบฐานข้อมูล",
    dateRaw: "2026-10-12",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 12, 2026 (09:00 - 12:00)",
    midtermTh: "12 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 14, 2026 (09:00 - 12:00)",
    finalsTh: "14 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 322",
    nameEn: "Software Engineering",
    nameTh: "วิศวกรรมซอฟต์แวร์",
    dateRaw: "2026-10-13",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 13, 2026 (13:00 - 16:00)",
    midtermTh: "13 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 15, 2026 (13:00 - 16:00)",
    finalsTh: "15 ธ.ค. 2569 (13:00 - 16:00)",
  },
  {
    code: "CPE 323",
    nameEn: "Computer Networks",
    nameTh: "เครือข่ายคอมพิวเตอร์",
    dateRaw: "2026-10-14",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 14, 2026 (09:00 - 12:00)",
    midtermTh: "14 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 16, 2026 (09:00 - 12:00)",
    finalsTh: "16 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 324",
    nameEn: "Embedded Systems",
    nameTh: "ระบบฝังตัว",
    dateRaw: "2026-10-15",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 15, 2026 (13:00 - 16:00)",
    midtermTh: "15 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 17, 2026 (13:00 - 16:00)",
    finalsTh: "17 ธ.ค. 2569 (13:00 - 16:00)",
  },
  {
    code: "CPE 325",
    nameEn: "Artificial Intelligence",
    nameTh: "ปัญญาประดิษฐ์",
    dateRaw: "2026-10-16",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 16, 2026 (09:00 - 12:00)",
    midtermTh: "16 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 18, 2026 (09:00 - 12:00)",
    finalsTh: "18 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 326",
    nameEn: "Operating Systems",
    nameTh: "ระบบปฏิบัติการ",
    dateRaw: "2026-10-19",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 19, 2026 (13:00 - 16:00)",
    midtermTh: "19 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 21, 2026 (13:00 - 16:00)",
    finalsTh: "21 ธ.ค. 2569 (13:00 - 16:00)",
  },
];

const CLASS_OPTIONS = [
  { code: "CPE 321", nameEn: "Database Systems", nameTh: "ระบบฐานข้อมูล" },
  { code: "CPE 322", nameEn: "Software Engineering", nameTh: "วิศวกรรมซอฟต์แวร์" },
  { code: "CPE 323", nameEn: "Computer Networks", nameTh: "เครือข่ายคอมพิวเตอร์" },
  { code: "CPE 324", nameEn: "Embedded Systems", nameTh: "ระบบฝังตัว" },
  { code: "CPE 325", nameEn: "Artificial Intelligence", nameTh: "ปัญญาประดิษฐ์" },
  { code: "CPE 326", nameEn: "Operating Systems", nameTh: "ระบบปฏิบัติการ" },
  { code: "CPE 381", nameEn: "Comp Eng Lab III", nameTh: "ปฏิบัติการวิศวกรรมคอมพิวเตอร์ 3" },
];

export default function AdminSchedulePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [lang, setLang] = useState("th");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCode = searchParams.get("edit");

  // Data state
  const [exams, setExams] = useState<ExamItem[]>([]);

  useEffect(() => {
    params.then((p) => {
      setLang(p.lang);
    });

    // Check if user is logged in
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_role="))
      ?.split("=")[1];
    setIsLoggedIn(!!role);

    // Load exam items
    const savedExams = localStorage.getItem("exam_schedules");
    if (savedExams) {
      setExams(JSON.parse(savedExams));
    } else {
      localStorage.setItem("exam_schedules", JSON.stringify(DEFAULT_EXAMS));
      setExams(DEFAULT_EXAMS);
    }
  }, [params]);

  // Automatically trigger edit mode if query parameter ?edit=... is present in URL
  useEffect(() => {
    if (editCode && exams.length > 0) {
      const examToEdit = exams.find(
        (x) => x.code.toLowerCase() === editCode.toLowerCase()
      );
      if (examToEdit) {
        const timer = setTimeout(() => {
          handleStartEdit(examToEdit);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [editCode, exams, lang]);

  const isTh = lang === "th";

  // --- EXAM FORM STATES ---
  const [selectedSubjectKey, setSelectedSubjectKey] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [examPeriod, setExamPeriod] = useState<"midterm" | "finals">("midterm");
  const [examType, setExamType] = useState<"schedule" | "outside">("schedule");
  const [examDate, setExamDate] = useState("");
  const [examStartTime, setExamStartTime] = useState("09:00");
  const [examEndTime, setExamEndTime] = useState("12:00");
  const [editingCode, setEditingCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubjectSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedSubjectKey(code);
    const opt = CLASS_OPTIONS.find((x) => x.code === code);
    if (opt) {
      setSubjectCode(opt.code);
      setSubjectName(isTh ? opt.nameTh : opt.nameEn);
    }
  };

  const handleStartEdit = (exam: ExamItem) => {
    setEditingCode(exam.code);
    setSelectedSubjectKey(exam.code);
    setSubjectCode(exam.code);
    setSubjectName(lang === "th" ? exam.nameTh : exam.nameEn);
    
    const isMidterm = exam.midtermTh !== "-";
    setExamPeriod(isMidterm ? "midterm" : "finals");
    
    const isOutside = exam.dateRaw === "9999-12-31";
    setExamType(isOutside ? "outside" : "schedule");
    
    setExamDate(!isOutside ? exam.dateRaw : "");
    setExamStartTime(exam.startTimeRaw || "09:00");
    setExamEndTime(exam.endTimeRaw || "12:00");

    setError("");
    setSuccess(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setSelectedSubjectKey("");
    setSubjectCode("");
    setSubjectName("");
    setExamPeriod("midterm");
    setExamType("schedule");
    setExamDate("");
    setExamStartTime("09:00");
    setExamEndTime("12:00");
    setError("");
    setSuccess(false);
  };

  const handleDelete = (code: string) => {
    if (confirm(isTh ? `คุณต้องการลบวิชา ${code} ใช่หรือไม่?` : `Are you sure you want to delete ${code}?`)) {
      const saved = localStorage.getItem("exam_schedules");
      const list = saved ? JSON.parse(saved) : [...DEFAULT_EXAMS];
      const updatedList = list.filter((x: any) => x.code.toLowerCase() !== code.toLowerCase());
      localStorage.setItem("exam_schedules", JSON.stringify(updatedList));
      setExams(updatedList);
      if (editingCode === code) {
        handleCancelEdit();
      }
    }
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode) {
      setError(isTh ? "กรุณาเลือกวิชาที่ต้องการตั้งค่าตารางสอบ" : "Please select a subject to schedule");
      return;
    }
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const saved = localStorage.getItem("exam_schedules");
      const list = saved ? JSON.parse(saved) : [...DEFAULT_EXAMS];

      let formattedTh = "";
      let formattedEn = "";

      if (examType === "schedule") {
        const dateObj = new Date(examDate);
        const day = dateObj.getDate();
        const monthIndex = dateObj.getMonth();
        const monthsThFull = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const monthTh = monthsThFull[monthIndex];
        const yearTh = dateObj.getFullYear() + 543;
        formattedTh = `${day} ${monthTh} ${yearTh} (${examStartTime} - ${examEndTime})`;

        const monthEn = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const yearEn = dateObj.getFullYear();
        formattedEn = `${monthEn} ${day}, ${yearEn} (${examStartTime} - ${examEndTime})`;
      } else {
        formattedTh = "สอบนอกตาราง";
        formattedEn = "Outside Schedule";
      }

      let listToSave = [...list];
      if (editingCode) {
        listToSave = listToSave.filter(
          (x: any) => x.code.toLowerCase() !== editingCode.toLowerCase()
        );
      }

      const existingIndex = listToSave.findIndex(
        (x: any) => x.code.toLowerCase() === subjectCode.trim().toLowerCase()
      );

      const dateRawVal = examType === "schedule" ? examDate : "9999-12-31";
      const timeRawVal = examType === "schedule" ? examStartTime : "23:59";

      if (existingIndex > -1) {
        const item = listToSave[existingIndex];
        item.nameEn = subjectName;
        item.nameTh = subjectName;
        item.startTimeRaw = examType === "schedule" ? examStartTime : "";
        item.endTimeRaw = examType === "schedule" ? examEndTime : "";
        if (examPeriod === "midterm") {
          item.midtermEn = formattedEn;
          item.midtermTh = formattedTh;
          item.dateRaw = dateRawVal;
          item.timeRaw = timeRawVal;
        } else {
          item.finalsEn = formattedEn;
          item.finalsTh = formattedTh;
          item.dateRaw = dateRawVal;
          item.timeRaw = timeRawVal;
        }
      } else {
        const newItem = {
          code: subjectCode.trim().toUpperCase(),
          nameEn: subjectName,
          nameTh: subjectName,
          dateRaw: dateRawVal,
          timeRaw: timeRawVal,
          startTimeRaw: examType === "schedule" ? examStartTime : "",
          endTimeRaw: examType === "schedule" ? examEndTime : "",
          midtermEn: examPeriod === "midterm" ? formattedEn : "-",
          midtermTh: examPeriod === "midterm" ? formattedTh : "-",
          finalsEn: examPeriod === "finals" ? formattedEn : "-",
          finalsTh: examPeriod === "finals" ? formattedTh : "-",
        };
        listToSave.push(newItem);
      }

      listToSave.sort((a: any, b: any) => {
        if (a.dateRaw < b.dateRaw) return -1;
        if (a.dateRaw > b.dateRaw) return 1;
        if (a.timeRaw < b.timeRaw) return -1;
        if (a.timeRaw > b.timeRaw) return 1;
        return 0;
      });

      localStorage.setItem("exam_schedules", JSON.stringify(listToSave));
      setExams(listToSave);

      setSuccess(true);
      setEditingCode(null);
      handleCancelEdit();

      setTimeout(() => {
        router.push(`/${lang}/schedule?type=exam`);
      }, 1000);
    } catch (err: any) {
      setError(isTh ? "เกิดข้อผิดพลาดในการบันทึกข้อมูล" : "Error saving schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 md:px-8 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/${lang}/schedule?type=exam`}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          ← {isTh ? "กลับไปยังตารางสอบ" : "Back to Exam Schedule"}
        </Link>
      </div>

      <div className="space-y-12">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            {editingCode 
              ? (isTh ? `แก้ไขเวลาสอบวิชา ${editingCode}` : `Edit Exam Time for ${editingCode}`) 
              : (isTh ? "ตั้งค่าเวลาสอบ" : "Set Exam Schedule")}
          </h1>

          {success && (
            <div className="mb-6 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold px-4 py-3 rounded-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isTh ? "บันทึกข้อมูลตารางสอบสำเร็จ!" : "Exam schedule saved successfully!"}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-950/80 border border-red-500 text-red-700 dark:text-red-300 font-semibold px-4 py-3 rounded-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleExamSubmit} className="flex flex-col gap-6">
            {/* Select Subject Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "เลือกวิชาเรียน (จากตารางสอน)" : "Select Subject (from Class schedule)"}
              </label>
              <select
                required
                value={selectedSubjectKey}
                onChange={handleSubjectSelectChange}
                disabled={!!editingCode}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  {isTh ? "-- กรุณาเลือกวิชาเรียน --" : "-- Select a Subject --"}
                </option>
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} - {isTh ? opt.nameTh : opt.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Period Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ช่วงการสอบ" : "Exam Period"}
              </label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all rounded-md">
                  <input
                    type="radio"
                    name="examPeriod"
                    value="midterm"
                    checked={examPeriod === "midterm"}
                    onChange={() => setExamPeriod("midterm")}
                    className="w-4 h-4 text-blue-600 dark:text-sky-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {isTh ? "กลางภาค (Midterm)" : "Midterm"}
                  </span>
                </label>

                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all rounded-md">
                  <input
                    type="radio"
                    name="examPeriod"
                    value="finals"
                    checked={examPeriod === "finals"}
                    onChange={() => setExamPeriod("finals")}
                    className="w-4 h-4 text-blue-600 dark:text-sky-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {isTh ? "ปลายภาค (Finals)" : "Finals"}
                  </span>
                </label>
              </div>
            </div>

            {/* Exam Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ประเภทตารางสอบ" : "Exam Schedule Type"}
              </label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all rounded-md">
                  <input
                    type="radio"
                    name="examType"
                    value="schedule"
                    checked={examType === "schedule"}
                    onChange={() => setExamType("schedule")}
                    className="w-4 h-4 text-blue-600 dark:text-sky-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {isTh ? "สอบตามตาราง" : "In Schedule"}
                  </span>
                </label>

                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all rounded-md">
                  <input
                    type="radio"
                    name="examType"
                    value="outside"
                    checked={examType === "outside"}
                    onChange={() => setExamType("outside")}
                    className="w-4 h-4 text-blue-600 dark:text-sky-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {isTh ? "สอบนอกตาราง" : "Outside Schedule"}
                  </span>
                </label>
              </div>
            </div>

            {/* Exam Date & Time Conditional Inputs */}
            {examType === "schedule" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300">
                {/* Exam Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {isTh ? "วันสอบ" : "Exam Date"}
                  </label>
                  <input
                    type="date"
                    required={examType === "schedule"}
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="px-2 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors text-xs md:text-sm cursor-pointer"
                  />
                </div>

                {/* Exam Time Range */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {isTh ? "เวลาสอบ" : "Exam Time"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      required={examType === "schedule"}
                      value={examStartTime}
                      onChange={(e) => setExamStartTime(e.target.value)}
                      className="flex-1 px-2 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors text-center text-xs md:text-sm cursor-pointer"
                    />
                    <span className="text-zinc-400">—</span>
                    <input
                      type="time"
                      required={examType === "schedule"}
                      value={examEndTime}
                      onChange={(e) => setExamEndTime(e.target.value)}
                      className="flex-1 px-2 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors text-center text-xs md:text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 border border-dashed border-amber-300 dark:border-amber-950/60 bg-amber-50/20 dark:bg-amber-950/10 rounded-md text-amber-600 dark:text-amber-400 text-sm leading-relaxed transition-all duration-300 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {isTh
                    ? "การสอบจะถูกบันทึกว่าเป็นการสอบนอกตาราง (จะติดต่ออาจารย์ผู้สอนโดยตรงสำหรับวันเวลา)"
                    : "The exam will be recorded as outside the schedule (contact instructor directly for details)."}
                </span>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-4 mt-2">
              {editingCode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all rounded-md text-center cursor-pointer"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-bold transition-all rounded-md flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                <span>{editingCode ? (isTh ? "บันทึกการแก้ไข" : "Update Schedule") : (isTh ? "บันทึกตารางสอบ" : "Save Exam Schedule")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Admin Subject List View */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl rounded-lg">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            {isTh ? "รายการเวลาสอบทั้งหมด" : "All Exam Schedules"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500">CODE</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500">SUBJECT</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-sm">
                      {isTh ? "ไม่มีข้อมูลตารางสอบ" : "No exam schedules found"}
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr
                      key={exam.code}
                      className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {exam.code}
                      </td>
                      <td className="py-4 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {lang === "th" ? exam.nameTh : exam.nameEn}
                      </td>
                      <td className="py-4 px-4 text-sm text-right space-x-2">
                        <button
                          onClick={() => handleStartEdit(exam)}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-sky-400 rounded transition-colors cursor-pointer"
                        >
                          {isTh ? "แก้ไข" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(exam.code)}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded transition-colors cursor-pointer"
                        >
                          {isTh ? "ลบ" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
