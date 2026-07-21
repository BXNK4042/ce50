import { notFound } from "next/navigation";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import { api } from "@/lib/api";
import Link from "next/link";
import { Student } from "@/lib/types";
import { StudentGridClient } from "./student-grid-client";

export default async function CohortPage({
  params,
}: {
  params: Promise<{ lang: string; cohort: string }>;
}) {
  const { lang, cohort } = await params;
  const cohortUpper = cohort.toUpperCase();
  if (!/^CE\d{2}$/.test(cohortUpper)) notFound();

  const dict = await getDictionary(lang as Locale);
  const isCE04 = cohortUpper === "CE04";

  let students: Student[] = [];
  try {
    students = await api.students(cohortUpper);
  } catch (error) {
    console.error("Failed to fetch students:", error);
  }

  if (isCE04) {
    return (
      <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300">

        {/* News section (full-width, h-screen, empty box with CE_04.webp background) */}
        <div className="relative h-screen w-full p-12 md:p-16 flex flex-col justify-end items-start transition-all duration-300 overflow-hidden">
          {/* Background Image with bottom 35% fade-out mask */}
          <img 
            src="/students/ce_04/CE_04.webp"
            alt="CE04 Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{
              objectPosition: "50% 55%",
              maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)"
            }}
          />
          {/* Contrast overlay with bottom 35% fade-out mask */}
          <div 
            className="absolute inset-0 bg-black/35 dark:bg-black/55 z-10 transition-colors duration-300"
            style={{
              maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)"
            }}
          />

          {/* Section Header (Bottom-Left aligned with drop shadows for readability) */}
          <div className="relative z-20 text-left mb-16 md:mb-24 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
            <h2 className="text-4xl font-extrabold text-white tracking-tight select-none">
              THIRD YEAR
            </h2>
            <p className="mt-2 text-sky-400 dark:text-sky-300 text-4xl font-extrabold select-none tracking-tight">
              JUNIOR
            </p>
          </div>
        </div>

        {/* Student list section (below news section) */}
        <div className="py-12 md:py-16">
          <section className="mx-auto max-w-7xl px-12 md:px-16 w-full">
            <StudentGridClient students={students} lang={lang} dict={dict} />
          </section>
        </div>
      </div>
    );
  }

  // Original render for other cohorts (remains completely unchanged)
  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-6xl px-12 md:px-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href={`/${lang}`} className="hover:underline hover:text-blue-600 dark:hover:text-sky-300">
            {lang === "th" ? "หน้าแรก" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/people`} className="hover:underline hover:text-blue-600 dark:hover:text-sky-300">
            {dict.people.title}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{cohortUpper}</span>
        </div>

        {/* Page Title & Subtitle */}
        <div className="mb-12 text-left relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white select-none">
            {lang === "th" ? `นักศึกษา ${cohortUpper}` : `${cohortUpper} Students`}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
            {lang === "th" 
              ? `ข้อมูลรายชื่อและรายละเอียดของนักศึกษาภาควิชาวิศวกรรมคอมพิวเตอร์ รุ่น ${cohortUpper}`
              : `Student list and details for Computer Engineering cohort ${cohortUpper}`}
          </p>
        </div>

        {/* Student Grid */}
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black/50 border border-blue-100 dark:border-zinc-800 rounded-xl p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-zinc-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m0 0-.003-.031c0-.225.012-.447.037-.666A11.944 11.944 0 0 1 12 15c2.22 0 4.31.6 6 1.666M2.458 12c.325-.357.7-.678 1.112-.961m0 0a8.004 8.004 0 0 1 12.586 0m-12.586 0a9.003 9.003 0 0 0 4.12 10.718M18.893 12c-.325-.357-.7-.678-1.112-.961m0 0a8.004 8.004 0 0 0-12.586 0m12.586 0a9.003 9.003 0 0 1-4.12 10.718M16.24 12.75a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0ZM9.76 12.75a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0Z"
              />
            </svg>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              {lang === "th" ? "ไม่พบข้อมูลนักศึกษาในรุ่นนี้" : "No student records found for this cohort."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {students.map((student: any) => {
              const name = lang === "th" ? student.name_th : (student.name_en || student.name_th);
              const initials = student.name_en 
                ? student.name_en.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                : name.slice(0, 2);

              return (
                <div
                  key={student.id}
                  className="bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 hover:scale-[1.02] transition-all duration-300 flex flex-col group"
                >
                  {/* Photo area */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      // Custom premium avatar fallback
                      <div className="w-16 h-16 rounded-full bg-blue-600 dark:bg-sky-500 flex items-center justify-center text-white text-xl font-bold tracking-wider select-none shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        {initials}
                      </div>
                    )}
                    
                    {/* Floating role badge if exists */}
                    {student.class_role && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-semibold bg-blue-600/90 dark:bg-sky-500/90 text-white rounded-md backdrop-blur-md shadow-sm select-none">
                        {student.class_role}
                      </span>
                    )}
                  </div>

                  {/* Student Details */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-sky-400 tracking-wider">
                        ID: {student.student_id}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors mt-0.5 line-clamp-1">
                        {name}
                      </h3>
                      {student.name_en && lang === "th" && (
                        <p className="text-zinc-400 text-xs mt-0.5">{student.name_en}</p>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/30 pt-3 mt-auto">
                      {student.track && (
                        <div className="flex justify-between items-center">
                          <span>{lang === "th" ? "สายรหัส:" : "Track:"}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-[10px]">
                            {student.track}
                          </span>
                        </div>
                      )}
                      
                      {student.contact && (
                        <div className="flex justify-between items-center gap-2">
                          <span>{lang === "th" ? "ติดต่อ:" : "Contact:"}</span>
                          <a 
                            href={`mailto:${student.contact}`} 
                            className="font-medium hover:underline text-blue-600 dark:text-sky-400 truncate max-w-[150px]"
                          >
                            {student.contact}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
