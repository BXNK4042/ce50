import { notFound } from "next/navigation";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import { api } from "@/lib/api";
import Link from "next/link";
import { Student } from "@/lib/types";
import { StudentGridClient } from "./student-grid-client";
import { formatCohortLabel, getCohortHeroData } from "@/lib/cohort";

export default async function CohortPage({
  params,
}: {
  params: Promise<{ lang: string; cohort: string }>;
}) {
  const { lang, cohort } = await params;
  const cohortUpper = cohort.toUpperCase();
  if (!/^CE\d{2}$/.test(cohortUpper)) notFound();

  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";
  const heroData = getCohortHeroData(cohortUpper);

  let students: Student[] = [];
  try {
    students = await api.students(cohortUpper);
  } catch (error) {
    console.error("Failed to fetch students:", error);
  }

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300">
      {/* Dynamic Hero section */}
      <div className="relative h-[65vh] md:h-[85vh] w-full pb-12 md:pb-16 flex flex-col justify-between items-center transition-all duration-300 overflow-hidden bg-gradient-to-b from-blue-900 to-slate-950">
        {/* Background Image with bottom 35% fade-out mask */}
        <img
          src={heroData.bgImage}
          alt={`${cohortUpper} Background`}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{
            objectPosition: "50% 55%",
            maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          }}
        />
        {/* Contrast overlay with bottom 35% fade-out mask */}
        <div
          className="absolute inset-0 bg-black/35 dark:bg-black/55 z-10 transition-colors duration-300"
          style={{
            maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          }}
        />

        {/* Top Breadcrumbs */}
        <div className="relative z-20 mx-auto max-w-7xl px-12 md:px-16 pt-8 w-full">
        </div>

        {/* Section Header */}
        <div className="relative z-20 mx-auto max-w-7xl px-12 md:px-16 w-full text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
          <h1 className="text-4xl font-extrabold text-white tracking-tight select-none">
            {isTh ? heroData.titleTh : heroData.titleEn}
          </h1>
          <p className="mt-2 text-sky-400 dark:text-sky-300 text-3xl md:text-4xl font-extrabold select-none tracking-tight">
            {isTh ? heroData.subTitleTh : heroData.subTitleEn}
          </p>
        </div>
      </div>

      {/* Student list section */}
      <div className="py-12 md:py-16">
        <section className="mx-auto max-w-7xl px-12 md:px-16 w-full">
          <StudentGridClient students={students} lang={lang} dict={dict} />
        </section>
      </div>
    </div>
  );
}

