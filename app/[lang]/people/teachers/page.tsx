import { api } from "@/lib/api";
import TeachersGrid from "./teachers-grid";
import { TeachersHeader } from "@/components/people/teachers-header";

export const dynamic = "force-dynamic";

export default async function TeachersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isTh = lang === "th";

  let dbTeachers: any[] = [];
  try {
    dbTeachers = await api.teachers();
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
  }

  const teachers = dbTeachers.map((t) => {
    let adviseYears: string[] = [];
    if (t.advise_years) {
      if (typeof t.advise_years === "string") {
        try {
          adviseYears = JSON.parse(t.advise_years);
        } catch {
          // ignore
        }
      } else if (Array.isArray(t.advise_years)) {
        adviseYears = t.advise_years;
      }
    }
    return { ...t, advise_years: adviseYears };
  });

  return (
    <section className="w-full px-12 md:px-16 py-12 md:py-16">
      <TeachersHeader isTh={isTh} />

      {teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black/50 border border-blue-100 dark:border-zinc-800 rounded-xl p-8 text-center mt-4">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {isTh ? "ไม่พบข้อมูลคณาจารย์" : "No faculty records found."}
          </p>
        </div>
      ) : (
        <TeachersGrid teachers={teachers} lang={lang} />
      )}
    </section>
  );
}
