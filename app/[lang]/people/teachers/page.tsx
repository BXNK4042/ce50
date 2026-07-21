import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";
import TeachersGrid from "./teachers-grid";

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
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
        {isTh ? (
          <>
            วิศวกรรมคอมพิวเตอร์
            <br />
            <span className="text-[#4483cc]">
              <span className="relative inline-block">
                คณา
                <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#4483cc] rounded-full" />
              </span>
              จารย์
            </span>{" "}
            ปี 2026
          </>
        ) : (
          <>
            COMPUTER ENGINEERING
            <br />
            <span className="text-[#4483cc]">
              <span className="relative inline-block">
                FAC
                <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#4483cc] rounded-full" />
              </span>
              ULTY
            </span>{" "}
            2026
          </>
        )}
      </h1>

      {/* Teachers Grid */}
      {teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black/50 border border-blue-100 dark:border-zinc-800 rounded-xl p-8 text-center mt-12">
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
