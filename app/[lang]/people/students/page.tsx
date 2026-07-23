import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import Link from "next/link";
import { formatCohortLabel } from "@/lib/cohort";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";

  const cohorts = [
    {
      code: "CE04",
      yearTh: "ชั้นปีที่ 3",
      yearEn: "Year 3",
      descTh: "นักศึกษาระดับชั้นปีที่ 3 เตรียมความพร้อมสำหรับการฝึกงาน",
      descEn: "Junior students preparing for their professional internships.",
      color: "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
      textColor: "text-blue-600 dark:text-sky-400",
    },
    {
      code: "CE05",
      yearTh: "ชั้นปีที่ 2",
      yearEn: "Year 2",
      descTh: "นักศึกษาระดับชั้นปีที่ 2 ศึกษาความรู้เฉพาะทางของสาขา",
      descEn: "Sophomore students diving into core computer engineering topics.",
      color: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      code: "CE06",
      yearTh: "ชั้นปีที่ 1",
      yearEn: "Year 1",
      descTh: "นักศึกษาระดับชั้นปีที่ 1 ปรับตัวและเรียนรู้พื้นฐานวิศวกรรม",
      descEn: "Freshman students building foundational engineering knowledge.",
      color: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
      textColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-12 md:px-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href={`/${lang}`} className="hover:underline hover:text-blue-600 dark:hover:text-sky-300">
            {isTh ? "หน้าแรก" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/people`} className="hover:underline hover:text-blue-600 dark:hover:text-sky-300">
            {dict.people.title}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{dict.people.students}</span>
        </div>

        {/* Title */}
        <div className="mb-12 text-left relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white select-none">
            {dict.people.students}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
            {isTh 
              ? "ทำเนียบนักศึกษาภาควิชาวิศวกรรมคอมพิวเตอร์ตามรายรุ่น"
              : "Computer Engineering student directories cataloged by cohort."}
          </p>
        </div>

        {/* Cohort Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <Link
              key={cohort.code}
              href={`/${lang}/people/students/${cohort.code.toLowerCase()}`}
              className="group bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cohort Badge/Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cohort.color} flex items-center justify-center font-bold text-xl ${cohort.textColor} shadow-inner`}>
                    {cohort.code}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-sky-900/40">
                    {formatCohortLabel(cohort.code, lang)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                  {isTh ? `${cohort.yearTh} (${formatCohortLabel(cohort.code, "th")})` : `${cohort.yearEn} (${formatCohortLabel(cohort.code, "en")})`}
                </h2>
                
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isTh ? cohort.descTh : cohort.descEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/30 flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                <span>{isTh ? "ดูรายชื่อทั้งหมด" : "View Directory"}</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

