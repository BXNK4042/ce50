import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import Link from "next/link";
import { StudentCohortGrid } from "@/components/people/student-cohort-grid";

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
      code: "CE06",
      descTh: "นักศึกษาระดับชั้นปีที่ 1 ปรับตัวและเรียนรู้พื้นฐานวิศวกรรม",
      descEn: "Freshman students building foundational engineering knowledge.",
      color: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      code: "CE05",
      descTh: "นักศึกษาระดับชั้นปีที่ 2 ศึกษาความรู้เฉพาะทางของสาขา",
      descEn: "Sophomore students diving into core computer engineering topics.",
      color: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      code: "CE04",
      descTh: "นักศึกษาระดับชั้นปีที่ 3 เตรียมความพร้อมสำหรับการฝึกงาน",
      descEn: "Junior students preparing for their professional internships.",
      color: "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
      textColor: "text-blue-600 dark:text-sky-400",
    },
    {
      code: "CE03",
      descTh: "นักศึกษาระดับชั้นปีที่ 4 โครงงานวิศวกรรมและเตรียมพร้อมสู่วัยทำงาน",
      descEn: "Senior students working on engineering projects and capstone.",
      color: "from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20",
      textColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      code: "CE02",
      descTh: "ทำเนียบศิษย์เก่ารุ่นที่ 2 ที่สำเร็จการศึกษาและปฏิบัติงานในภาคอุตสาหกรรม",
      descEn: "Alumni directory of Generation 2 graduates working in tech industry.",
      color: "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      code: "CE01",
      descTh: "ทำเนียบศิษย์เก่ารุ่นบุกเบิก (รุ่นที่ 1) สำเร็จการศึกษาเรียบร้อยแล้ว",
      descEn: "Pioneer Alumni directory of Generation 1 graduates.",
      color: "from-purple-500/10 to-violet-500/10 hover:from-purple-500/20 hover:to-violet-500/20",
      textColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-12 md:px-16">
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

        <StudentCohortGrid cohorts={cohorts} lang={lang} />
      </section>
    </div>
  );
}
