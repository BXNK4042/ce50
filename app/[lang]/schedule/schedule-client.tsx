"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function ScheduleClient({
  lang,
  dict,
  type,
  term,
}: {
  lang: string;
  dict: any;
  type?: string;
  term?: string;
}) {
  const [exams, setExams] = useState<ExamItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("exam_schedules");
    if (saved) {
      setExams(JSON.parse(saved));
    } else {
      localStorage.setItem("exam_schedules", JSON.stringify(DEFAULT_EXAMS));
      setExams(DEFAULT_EXAMS);
    }
  }, []);

  const [countdownText, setCountdownText] = useState<string>("");

  useEffect(() => {
    if (exams.length === 0) return;

    const updateCountdown = () => {
      const now = new Date();
      const upcoming = exams
        .filter(exam => exam.dateRaw && exam.dateRaw !== "9999-12-31")
        .map(exam => {
          const dateTime = new Date(`${exam.dateRaw}T${exam.startTimeRaw || "00:00"}:00`);
          return { ...exam, dateTime };
        })
        .filter(exam => exam.dateTime.getTime() > now.getTime())
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

      if (upcoming.length === 0) {
        setCountdownText(lang === "th" ? "ไม่มีการสอบที่กำลังจะมาถึง" : "No upcoming exams");
        return;
      }

      const nextExam = upcoming[0];
      const diff = nextExam.dateTime.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (lang === "th") {
        setCountdownText(
          `สอบถัดไป: ${nextExam.code} ใน ${days} วัน ${hours} ชม. ${minutes} น. ${seconds} วิ`
        );
      } else {
        setCountdownText(
          `Next: ${nextExam.code} in ${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [exams, lang]);

  const displayTitle = dict.schedule.title;
  const activeTab = type === "exam" ? "exam" : "class";
  const currentTerm = term || "all";
  const activeIndex = currentTerm === "finals" ? 2 : currentTerm === "midterm" ? 1 : 0;

  return (
    <section className="w-full px-12 md:px-16 py-8 md:py-12 min-h-[calc(100vh-16rem)] flex gap-12">
      {/* Left Sidebar */}
      <div className="flex flex-col w-56 shrink-0">
        <h1 className="text-2xl font-semibold">{displayTitle}</h1>
        <p className="mt-2 text-zinc-500">{dict.schedule.subtitle}</p>
        <p className="mt-1 text-yellow-600 dark:text-yellow-400">COMPUTER ENGINEER</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/${lang}/schedule?type=exam`}
            className={`relative px-4 py-3 text-sm font-semibold transition-all border rounded-md overflow-hidden ${
              activeTab === "exam"
                ? "bg-blue-50/50 dark:bg-sky-950/10 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-sky-900/50"
                : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {activeTab === "exam" && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500" />
            )}
            <span className={activeTab === "exam" ? "pl-1.5" : ""}>
              {dict.schedule.upcomingExams}
            </span>
          </Link>
          <Link
            href={`/${lang}/schedule?type=class`}
            className={`relative px-4 py-3 text-sm font-semibold transition-all border rounded-md overflow-hidden ${
              activeTab === "class"
                ? "bg-blue-50/50 dark:bg-sky-950/10 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-sky-900/50"
                : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {activeTab === "class" && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500" />
            )}
            <span className={activeTab === "class" ? "pl-1.5" : ""}>
              {dict.schedule.weeklyOverview}
            </span>
          </Link>
        </div>
      </div>

      {/* Pulsing Vertical Line */}
      <div className="w-px bg-blue-600 dark:bg-sky-500 animate-pulse self-stretch my-2" />

      {/* Right Content Area */}
      <div className="flex-1">
        {type === "exam" ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100 leading-none">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-sky-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{lang === "th" ? "ตารางสอบ" : "Exam Schedule"}</span>
              </h2>
              
              <div className="flex items-center gap-3 self-end md:self-auto">
                {countdownText && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/50 dark:bg-sky-950/20 border border-blue-100 dark:border-sky-900/30 text-blue-600 dark:text-sky-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-500 animate-ping" />
                    <span>{countdownText}</span>
                  </div>
                )}
                <Link
                  href={`/${lang}/admin/schedule`}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all duration-300"
                  title={lang === "th" ? "ตั้งค่าตารางสอบ" : "Exam Schedule Settings"}
                >
                  <svg
                    className="w-6 h-6 transform hover:rotate-45 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Segmented Control Switcher */}
            <div className="relative flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 p-1 w-[380px] h-11 mt-6">
              <div
                className="absolute top-1 bottom-1 left-1 w-[calc(33.3333%-3px)] bg-white dark:bg-zinc-800 rounded-md shadow-sm transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${activeIndex * 100}%) translateX(${activeIndex * 1}px)`,
                }}
              />
              
              <Link
                href={`/${lang}/schedule?type=exam&term=all`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 0
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.allTerms}
              </Link>
              <Link
                href={`/${lang}/schedule?type=exam&term=midterm`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 1
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.midterm}
              </Link>
              <Link
                href={`/${lang}/schedule?type=exam&term=finals`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 2
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.finals}
              </Link>
            </div>

            {/* Exams Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50/70 dark:bg-sky-950/20 border-b border-blue-100 dark:border-sky-900/30">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">SUBJECT</th>
                    {(currentTerm === "all" || currentTerm === "midterm") && (
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">MIDTERM</th>
                    )}
                    {(currentTerm === "all" || currentTerm === "finals") && (
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">FINALS</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr
                      key={exam.code}
                      className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{exam.code}</div>
                          <Link
                            href={`/${lang}/admin/schedule?edit=${exam.code}`}
                            className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-sky-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            title={lang === "th" ? "แก้ไขวิชานี้" : "Edit this subject"}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{lang === "th" ? exam.nameTh : exam.nameEn}</div>
                      </td>
                      {(currentTerm === "all" || currentTerm === "midterm") && (
                        <td className="py-4 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === "th" ? exam.midtermTh : exam.midtermEn}
                        </td>
                      )}
                      {(currentTerm === "all" || currentTerm === "finals") && (
                        <td className="py-4 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === "th" ? exam.finalsTh : exam.finalsEn}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100 leading-none">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-sky-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{lang === "th" ? "ตารางเรียน" : "Class Schedule"}</span>
            </h2>

            <Link
              href={`/${lang}/admin/schedule`}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all duration-300"
              title={lang === "th" ? "ตั้งค่าตารางเรียน" : "Class Schedule Settings"}
            >
              <svg
                className="w-6 h-6 transform hover:rotate-45 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
