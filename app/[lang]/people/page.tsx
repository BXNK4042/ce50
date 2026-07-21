import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import Link from "next/link";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-12 md:px-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href={`/${lang}`} className="hover:underline hover:text-blue-600 dark:hover:text-sky-300">
            {isTh ? "หน้าแรก" : "Home"}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{dict.people.title}</span>
        </div>

        {/* Title */}
        <div className="mb-12 text-left relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white select-none">
            {dict.people.title}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
            {dict.people.subtitle}
          </p>
        </div>

        {/* Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teachers Card */}
          <Link
            href={`/${lang}/people/teachers`}
            className="group bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-2xl p-8 shadow-md hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-sky-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-sky-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M12 21v-8.25" />
              </svg>
            </div>
            
            <div className="z-10">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                {dict.people.teachers}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {isTh 
                  ? "ข้อมูลรายชื่อ คณาจารย์ผู้สอน ประวัติ และช่องทางการติดต่ออาจารย์ประจำหลักสูตรวิศวกรรมคอมพิวเตอร์"
                  : "Profiles, specializations, and contact details of Computer Engineering faculty members."}
              </p>
            </div>
            
            <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400">
              <span>{isTh ? "ดูรายชื่อคณาจารย์" : "View Faculty"}</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </div>
          </Link>

          {/* Students Card */}
          <Link
            href={`/${lang}/people/students`}
            className="group bg-white dark:bg-black border border-blue-100 dark:border-zinc-800 rounded-2xl p-8 shadow-md hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21c-1.08 0-2.117-.144-3.106-.413v-.358A9.38 9.38 0 0 0 12 18.75c0-1.113-.285-2.16-.786-3.07M9 3.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM18 16.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            
            <div className="z-10">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {dict.people.students}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {isTh 
                  ? "ทำเนียบรุ่นนักศึกษาปัจจุบัน วิศวกรรมคอมพิวเตอร์ แบ่งตามชั้นปี รุ่น และสายรหัสสำหรับการเชื่อมโยงการทำงานร่วมกัน"
                  : "Student cohort lists, year-wise records, track groups, and current computer engineering student directories."}
              </p>
            </div>
            
            <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{isTh ? "ดูรายชื่อนักศึกษาแต่ละรุ่น" : "View Cohorts"}</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

