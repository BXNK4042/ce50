"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  api,
  cellsToGrid,
  gridToCells,
  type WeeklyClassRow,
  type ClassItem,
} from "@/lib/api";

// ponytail: year/term hardcoded — add cohort selector when multiple years exist
const SCHEDULE_YEAR = 3;
const SCHEDULE_TERM = 1;


// --- TIME OPTIONS ---
const START_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const END_TIMES = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export default function AdminClassSchedulePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [lang, setLang] = useState("th");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Data state
  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClassRow[]>([]);

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

    // Load class items
    api
      .classSchedule(SCHEDULE_YEAR, SCHEDULE_TERM)
      .then((cells) => setWeeklyClasses(cellsToGrid(cells)))
      .catch((e) => console.error("Failed to load class schedule:", e));
  }, [params]);

  const isTh = lang === "th";

  // --- CLASS FORM STATES ---
  const [classDay, setClassDay] = useState("monday");
  const [classStartTime, setClassStartTime] = useState("09:00");
  const [classEndTime, setClassEndTime] = useState("10:00");
  const [classCode, setClassCode] = useState("");
  const [classNameEn, setClassNameEn] = useState("");
  const [classNameTh, setClassNameTh] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [classInstructorEn, setClassInstructorEn] = useState("");
  const [classInstructorTh, setClassInstructorTh] = useState("");
  const [classDescriptionEn, setClassDescriptionEn] = useState("");
  const [classDescriptionTh, setClassDescriptionTh] = useState("");
  const [editingClassSlot, setEditingClassSlot] = useState<{ day: string; startTime: string; endTime: string; code: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // --- CLASS HANDLERS ---
  const isRowInTimeRange = (rowTime: string, startSelected: string, endSelected: string) => {
    const [rowStart, rowEnd] = rowTime.split(" - ");
    return rowStart >= startSelected && rowEnd <= endSelected;
  };

  const handleStartChange = (value: string) => {
    setClassStartTime(value);
    const startIdx = START_TIMES.indexOf(value);
    const endIdx = END_TIMES.indexOf(classEndTime);
    if (endIdx <= startIdx) {
      setClassEndTime(END_TIMES[Math.min(startIdx, END_TIMES.length - 1)]);
    }
  };

  const handleEndChange = (value: string) => {
    setClassEndTime(value);
    const startIdx = START_TIMES.indexOf(classStartTime);
    const endIdx = END_TIMES.indexOf(value);
    if (startIdx >= endIdx) {
      setClassStartTime(START_TIMES[Math.max(endIdx, 0)]);
    }
  };

  // --- OCCUPIED TIME FILTERS ---
  const occupiedRows = weeklyClasses.filter((row) => {
    const classItem = row[classDay as keyof Omit<WeeklyClassRow, "time">];
    if (!classItem) return false;
    if (editingClassSlot && classItem.code === editingClassSlot.code) {
      return false;
    }
    return true;
  });

  const isStartTimeValid = (start: string) => {
    return !occupiedRows.some((row) => row.time.startsWith(start));
  };

  const isEndTimeValid = (end: string) => {
    const startIdx = START_TIMES.indexOf(classStartTime);
    const endIdx = END_TIMES.indexOf(end);
    if (endIdx <= startIdx) return false;
    
    for (let i = startIdx; i < endIdx; i++) {
      const slotTime = `${START_TIMES[i]} - ${END_TIMES[i]}`;
      if (occupiedRows.some((row) => row.time === slotTime)) return false;
    }
    return true;
  };

  // Adjust start time if current becomes invalid
  useEffect(() => {
    const isCurrentValid = isStartTimeValid(classStartTime);
    if (!isCurrentValid) {
      const firstValid = START_TIMES.find((time) => isStartTimeValid(time));
      if (firstValid) {
        setClassStartTime(firstValid);
        const startIdx = START_TIMES.indexOf(firstValid);
        const endIdx = END_TIMES.indexOf(classEndTime);
        if (endIdx <= startIdx) {
          setClassEndTime(END_TIMES[startIdx]);
        }
      }
    }
  }, [classDay, weeklyClasses, editingClassSlot]);

  // Adjust end time if current becomes invalid
  useEffect(() => {
    const isEndValid = isEndTimeValid(classEndTime);
    if (!isEndValid) {
      const startIdx = START_TIMES.indexOf(classStartTime);
      let firstValidEnd = "";
      for (let idx = startIdx; idx < END_TIMES.length; idx++) {
        const tempEnd = END_TIMES[idx];
        let ok = true;
        for (let i = startIdx; i <= idx; i++) {
          const slotTime = `${START_TIMES[i]} - ${END_TIMES[i]}`;
          if (occupiedRows.some((row) => row.time === slotTime)) {
            ok = false;
            break;
          }
        }
        if (ok) {
          firstValidEnd = tempEnd;
        } else {
          break;
        }
      }
      if (firstValidEnd) {
        setClassEndTime(firstValidEnd);
      }
    }
  }, [classStartTime, classDay, weeklyClasses, editingClassSlot]);

  const handleStartClassEdit = (dayKey: string, timeSlot: string, classItem: ClassItem) => {
    const list = weeklyClasses;

    let start = timeSlot.split(" - ")[0];
    let end = timeSlot.split(" - ")[1];

    const currentIndex = list.findIndex((row: WeeklyClassRow) => row.time === timeSlot);
    if (currentIndex > -1 && classItem.code) {
      const code = classItem.code;
      // Look back to find contiguous start
      let firstIndex = currentIndex;
      while (firstIndex > 0) {
        const prevRow = list[firstIndex - 1];
        const prevItem = prevRow[dayKey as keyof Omit<WeeklyClassRow, "time">];
        if (prevItem && prevItem.code === code) {
          firstIndex--;
        } else {
          break;
        }
      }
      // Look forward to find contiguous end
      let lastIndex = currentIndex;
      while (lastIndex < list.length - 1) {
        const nextRow = list[lastIndex + 1];
        const nextItem = nextRow[dayKey as keyof Omit<WeeklyClassRow, "time">];
        if (nextItem && nextItem.code === code) {
          lastIndex++;
        } else {
          break;
        }
      }

      start = list[firstIndex].time.split(" - ")[0];
      end = list[lastIndex].time.split(" - ")[1];
    }

    setEditingClassSlot({ day: dayKey, startTime: start, endTime: end, code: classItem.code });
    setClassDay(dayKey);
    setClassStartTime(start);
    setClassEndTime(end);
    setClassCode(classItem.code);
    setClassNameEn(classItem.nameEn);
    setClassNameTh(classItem.nameTh);
    setClassRoom(classItem.room || "");
    setClassInstructorEn(classItem.instructorEn || "");
    setClassInstructorTh(classItem.instructorTh || "");
    setClassDescriptionEn(classItem.descriptionEn || "");
    setClassDescriptionTh(classItem.descriptionTh || "");
    setError("");
    setSuccess(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelClassEdit = () => {
    setEditingClassSlot(null);
    setClassDay("monday");
    setClassStartTime("09:00");
    setClassEndTime("10:00");
    setClassCode("");
    setClassNameEn("");
    setClassNameTh("");
    setClassRoom("");
    setClassInstructorEn("");
    setClassInstructorTh("");
    setClassDescriptionEn("");
    setClassDescriptionTh("");
    setError("");
    setSuccess(false);
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // deep clone current grid so we don't mutate React state directly
      const list: WeeklyClassRow[] = weeklyClasses.map((row) => ({
        ...row,
        monday: row.monday ? { ...row.monday } : null,
        tuesday: row.tuesday ? { ...row.tuesday } : null,
        wednesday: row.wednesday ? { ...row.wednesday } : null,
        thursday: row.thursday ? { ...row.thursday } : null,
        friday: row.friday ? { ...row.friday } : null,
        saturday: row.saturday ? { ...row.saturday } : null,
      }));

      // 1. If we were editing, clear the old range first
      if (editingClassSlot) {
        list.forEach((row: WeeklyClassRow) => {
          if (isRowInTimeRange(row.time, editingClassSlot.startTime, editingClassSlot.endTime)) {
            row[editingClassSlot.day as keyof Omit<WeeklyClassRow, "time">] = null;
          }
        });
      }

      // 2. Set the details for all rows in the new range
      list.forEach((row: WeeklyClassRow) => {
        if (isRowInTimeRange(row.time, classStartTime, classEndTime)) {
          if (classCode.trim() === "") {
            row[classDay as keyof Omit<WeeklyClassRow, "time">] = null;
          } else {
            row[classDay as keyof Omit<WeeklyClassRow, "time">] = {
              code: classCode.trim().toUpperCase(),
              nameEn: classNameEn.trim(),
              nameTh: classNameTh.trim(),
              room: classRoom.trim(),
              instructorEn: classInstructorEn.trim(),
              instructorTh: classInstructorTh.trim(),
              descriptionEn: classDescriptionEn.trim(),
              descriptionTh: classDescriptionTh.trim(),
            };
          }
        }
      });

      await api.saveClassSchedule(SCHEDULE_YEAR, gridToCells(list));
      setWeeklyClasses(list);

      setSuccess(true);
      handleCancelClassEdit();

      setTimeout(() => {
        router.push(`/${lang}/schedule?type=class`);
      }, 1000);
    } catch (err: any) {
      setError(isTh ? "เกิดข้อผิดพลาดในการบันทึกตารางเรียน" : "Error saving class timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleClassDelete = (dayKey: string, timeSlot: string) => {
    if (confirm(isTh ? "คุณต้องการลบวิชาในคาบเวลานี้ใช่หรือไม่?" : "Are you sure you want to clear this class slot?")) {
      // deep clone so we don't mutate React state directly
      const list: WeeklyClassRow[] = weeklyClasses.map((row) => ({
        ...row,
        monday: row.monday ? { ...row.monday } : null,
        tuesday: row.tuesday ? { ...row.tuesday } : null,
        wednesday: row.wednesday ? { ...row.wednesday } : null,
        thursday: row.thursday ? { ...row.thursday } : null,
        friday: row.friday ? { ...row.friday } : null,
        saturday: row.saturday ? { ...row.saturday } : null,
      }));

      const rowIndex = list.findIndex((row: WeeklyClassRow) => row.time === timeSlot);
      if (rowIndex > -1) {
        const classItem = list[rowIndex][dayKey as keyof Omit<WeeklyClassRow, "time">];
        if (classItem) {
          const code = classItem.code;

          // Find contiguous range for the same class code on the same day
          let firstIndex = rowIndex;
          while (firstIndex > 0) {
            const prevItem = list[firstIndex - 1][dayKey as keyof Omit<WeeklyClassRow, "time">];
            if (prevItem && prevItem.code === code) {
              firstIndex--;
            } else {
              break;
            }
          }
          let lastIndex = rowIndex;
          while (lastIndex < list.length - 1) {
            const nextItem = list[lastIndex + 1][dayKey as keyof Omit<WeeklyClassRow, "time">];
            if (nextItem && nextItem.code === code) {
              lastIndex++;
            } else {
              break;
            }
          }

          // Clear all rows in this range
          for (let i = firstIndex; i <= lastIndex; i++) {
            list[i][dayKey as keyof Omit<WeeklyClassRow, "time">] = null;
          }
        } else {
          list[rowIndex][dayKey as keyof Omit<WeeklyClassRow, "time">] = null;
        }
      }

      setWeeklyClasses(list);
      api
        .saveClassSchedule(SCHEDULE_YEAR, gridToCells(list))
        .catch((e: any) => setError(e?.message ?? "Save failed"));

      // Cancel edit mode if we deleted the slot we were editing
      if (editingClassSlot && editingClassSlot.day === dayKey) {
        const [slotStart, slotEnd] = timeSlot.split(" - ");
        if (
          (slotStart >= editingClassSlot.startTime && slotStart < editingClassSlot.endTime) ||
          (slotEnd > editingClassSlot.startTime && slotEnd <= editingClassSlot.endTime)
        ) {
          handleCancelClassEdit();
        }
      }
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 md:px-8 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/${lang}/schedule?type=class`}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          ← {isTh ? "กลับไปยังตารางเรียน" : "Back to Weekly Timetable"}
        </Link>
      </div>

      <div className="space-y-12">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            {editingClassSlot 
              ? (isTh ? `แก้ไขวิชาเรียน คาบ ${editingClassSlot.startTime} - ${editingClassSlot.endTime} วัน${editingClassSlot.day.toUpperCase()}` : `Edit Class Slot: ${editingClassSlot.startTime} - ${editingClassSlot.endTime} (${editingClassSlot.day.toUpperCase()})`) 
              : (isTh ? "ตั้งค่าตารางเรียนรายสัปดาห์" : "Weekly Timetable Settings")}
          </h1>

          {success && (
            <div className="mb-6 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold px-4 py-3 rounded-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isTh ? "บันทึกข้อมูลตารางเรียนสำเร็จ!" : "Class timetable saved successfully!"}</span>
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

          <form onSubmit={handleClassSubmit} className="flex flex-col gap-6">
            {/* Select Day */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "เลือกวันเรียน" : "Select Day"}
              </label>
              <select
                required
                value={classDay}
                onChange={(e) => setClassDay(e.target.value)}
                disabled={!!editingClassSlot}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
              >
                <option value="monday">{isTh ? "วันจันทร์ (Monday)" : "Monday"}</option>
                <option value="tuesday">{isTh ? "วันอังคาร (Tuesday)" : "Tuesday"}</option>
                <option value="wednesday">{isTh ? "วันพุธ (Wednesday)" : "Wednesday"}</option>
                <option value="thursday">{isTh ? "วันพฤหัสบดี (Thursday)" : "Thursday"}</option>
                <option value="friday">{isTh ? "วันศุกร์ (Friday)" : "Friday"}</option>
                <option value="saturday">{isTh ? "วันเสาร์ (Saturday)" : "Saturday"}</option>
              </select>
            </div>

            {/* Select Time Slot */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "เลือกคาบเวลา" : "Select Time Slot"}
              </label>
              <div className="flex gap-4 items-center">
                {/* Start Time Select */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {isTh ? "เวลาเริ่มต้น" : "Start Time"}
                  </span>
                  <select
                    value={classStartTime}
                    onChange={(e) => handleStartChange(e.target.value)}
                    disabled={!!editingClassSlot}
                    className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer w-full"
                  >
                    {START_TIMES.map((time) => (
                      <option key={time} value={time} disabled={!isStartTimeValid(time)}>
                        {time} {!isStartTimeValid(time) ? (isTh ? " (ไม่ว่าง)" : " (Occupied)") : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xl font-bold text-zinc-400 self-end mb-2.5">:</span>

                {/* End Time Select */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {isTh ? "เวลาสิ้นสุด" : "End Time"}
                  </span>
                  <select
                    value={classEndTime}
                    onChange={(e) => handleEndChange(e.target.value)}
                    disabled={!!editingClassSlot}
                    className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer w-full"
                  >
                    {END_TIMES.map((time) => (
                      <option key={time} value={time} disabled={!isEndTimeValid(time)}>
                        {time} {!isEndTimeValid(time) ? (isTh ? " (ไม่ว่าง/ไม่ต่อเนื่อง)" : " (Occupied/Invalid)") : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subject Code */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "รหัสวิชา (ปล่อยว่างเพื่อเคลียร์ตาราง)" : "Subject Code (leave blank to clear slot)"}
              </label>
              <input
                type="text"
                placeholder="e.g. CPE 321"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Subject Name EN */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ชื่อวิชา (ภาษาอังกฤษ)" : "Subject Name (English)"}
              </label>
              <input
                type="text"
                required={classCode.trim() !== ""}
                placeholder="e.g. Database Systems"
                value={classNameEn}
                onChange={(e) => setClassNameEn(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Subject Name TH */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ชื่อวิชา (ภาษาไทย)" : "Subject Name (Thai)"}
              </label>
              <input
                type="text"
                required={classCode.trim() !== ""}
                placeholder="e.g. ระบบฐานข้อมูล"
                value={classNameTh}
                onChange={(e) => setClassNameTh(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Room number */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ห้องเรียน" : "Room"}
              </label>
              <input
                type="text"
                placeholder="e.g. CPE-401"
                value={classRoom}
                onChange={(e) => setClassRoom(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Instructor EN */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ชื่ออาจารย์ (ภาษาอังกฤษ)" : "Instructor Name (English)"}
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Johnson"
                value={classInstructorEn}
                onChange={(e) => setClassInstructorEn(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Instructor TH */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ชื่ออาจารย์ (ภาษาไทย)" : "Instructor Name (Thai)"}
              </label>
              <input
                type="text"
                placeholder="e.g. ดร. ซาร่าห์ จอห์นสัน"
                value={classInstructorTh}
                onChange={(e) => setClassInstructorTh(e.target.value)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Description EN */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "รายละเอียดวิชา (ภาษาอังกฤษ)" : "Course Description (English)"}
              </label>
              <textarea
                placeholder="e.g. Overview of database architecture, SQL query processing..."
                value={classDescriptionEn}
                onChange={(e) => setClassDescriptionEn(e.target.value)}
                rows={3}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Description TH */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "รายละเอียดวิชา (ภาษาไทย)" : "Course Description (Thai)"}
              </label>
              <textarea
                placeholder="e.g. ภาพรวมของสถาปัตยกรรมระบบฐานข้อมูล, การประมวลผลคำสั่งคิวรี..."
                value={classDescriptionTh}
                onChange={(e) => setClassDescriptionTh(e.target.value)}
                rows={3}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 text-zinc-900 dark:text-zinc-100 transition-colors"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-4 mt-2">
              {editingClassSlot && (
                <button
                  type="button"
                  onClick={handleCancelClassEdit}
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
                <span>{editingClassSlot ? (isTh ? "บันทึกการแก้ไข" : "Update Class") : (isTh ? "บันทึกตารางเรียน" : "Save Class Schedule")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Admin Weekly Class List */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl rounded-lg">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            {isTh ? "ตารางเรียนปัจจุบัน" : "Current Weekly Timetable"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500">TIME</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500">DAY</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500">SUBJECT</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {weeklyClasses.every((row) => 
                  !row.monday && !row.tuesday && !row.wednesday && !row.thursday && !row.friday && !row.saturday
                ) ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                      {isTh ? "ไม่มีข้อมูลวิชาเรียน" : "No classes scheduled"}
                    </td>
                  </tr>
                ) : (
                  weeklyClasses.map((row) => {
                    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    return days.map((dayKey) => {
                      const classItem = row[dayKey as keyof Omit<WeeklyClassRow, "time">];
                      if (!classItem) return null;
                      return (
                        <tr
                          key={`${row.time}-${dayKey}`}
                          className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {row.time}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                            {dayKey}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2">{classItem.code}</span>
                            <span className="text-zinc-500 text-xs">({isTh ? classItem.nameTh : classItem.nameEn})</span>
                            {(classItem.room || classItem.instructorEn || classItem.instructorTh) && (
                              <div className="text-[10px] text-zinc-400 mt-1 space-x-2">
                                {classItem.room && <span>Room: {classItem.room}</span>}
                                {classItem.room && (classItem.instructorEn || classItem.instructorTh) && <span>|</span>}
                                {(classItem.instructorEn || classItem.instructorTh) && (
                                  <span>Instructor: {isTh ? classItem.instructorTh : classItem.instructorEn}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-right space-x-2">
                            <button
                              onClick={() => handleStartClassEdit(dayKey, row.time, classItem)}
                              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-sky-400 rounded transition-colors cursor-pointer"
                            >
                              {isTh ? "แก้ไข" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleClassDelete(dayKey, row.time)}
                              className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded transition-colors cursor-pointer"
                            >
                              {isTh ? "ลบ" : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
