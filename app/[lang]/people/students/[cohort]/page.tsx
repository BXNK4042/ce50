import { notFound } from "next/navigation";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import { api } from "@/lib/api";
import { Student } from "@/lib/types";
import { StudentGridClient } from "./student-grid-client";
import { getCohortHeroData, getCohortNumber } from "@/lib/cohort";
import { CohortHeroBanner } from "@/components/people/cohort-hero-banner";

export const dynamic = "force-dynamic";

export default async function CohortPage({
  params,
}: {
  params: Promise<{ lang: string; cohort: string }>;
}) {
  const { lang, cohort } = await params;

  const gen = getCohortNumber(cohort);
  let cohortUpper = "";
  if (gen !== null && gen > 0) {
    cohortUpper = `CE${String(gen).padStart(2, "0")}`;
  } else if (/^CE[-_]?\d{1,2}$/i.test(cohort)) {
    const num = parseInt(cohort.replace(/CE[-_]?/i, ""), 10);
    cohortUpper = `CE${String(num).padStart(2, "0")}`;
  } else {
    notFound();
  }

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
      <CohortHeroBanner cohortUpper={cohortUpper} heroData={heroData} isTh={isTh} />

      <div className="py-12 md:py-16">
        <section className="mx-auto max-w-7xl px-12 md:px-16 w-full">
          <StudentGridClient students={students} lang={lang} dict={dict} />
        </section>
      </div>
    </div>
  );
}
