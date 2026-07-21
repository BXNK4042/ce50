import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";
import TeachersGrid from "./teachers-grid";

export const dynamic = "force-dynamic";

const fallbackTeachers = [
  {
    id: 1,
    name_th: "อาจารย์อรรถศาสตร์ นาคเทวัญ",
    name_en: "Athasart Narkthewan",
    photo: "/professors/athasart.webp",
    advise_years: ["1"],
    contact: "athasart.n@ce.ac.th",
  },
  {
    id: 2,
    name_th: "ดร.รัตติกร สมบัติแก้ว",
    name_en: "Rattikorn Sombutkaew",
    photo: "/professors/rattikorn.webp",
    advise_years: ["2"],
    contact: "rattikorn.s@ce.ac.th",
  },
  {
    id: 3,
    name_th: "อาจารย์นภัสรพี สิทธิวัจน์",
    name_en: "Pisakorn Sittiwatjana",
    photo: "/professors/pisakorn.webp",
    advise_years: ["3"],
    contact: "pisakorn.s@ce.ac.th",
  },
  {
    id: 4,
    name_th: "ว่าที่ร้อยตรี ศิลา ศิริมาสกุล",
    name_en: "Silar Sirimasakul",
    photo: "/professors/silar.webp",
    advise_years: ["4"],
    contact: "silar.s@ce.ac.th",
  },
  {
    id: 5,
    name_th: "อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช",
    name_en: "Sakawkarn Piyawitwanich",
    photo: "/professors/sakawkarn.webp",
    advise_years: ["1", "2"],
    contact: "sakawkarn.p@ce.ac.th",
  },
  {
    id: 6,
    name_th: "นายจตุรงค์ เกตุนิมิต",
    name_en: "Jaturong Katenimit",
    photo: "/professors/jaturong.webp",
    advise_years: ["4"],
    contact: "jaturong.k@ce.ac.th",
  },
];

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

  const teachers = (dbTeachers.length > 0 ? dbTeachers : fallbackTeachers).map((t) => {
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
      <TeachersGrid teachers={teachers} lang={lang} />
    </section>
  );
}
