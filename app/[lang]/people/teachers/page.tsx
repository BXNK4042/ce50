import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";

export const dynamic = "force-dynamic";

const fallbackTeachers = [
  {
    id: 1,
    name_th: "อาจารย์อรรถศาสตร์ นาคเทวัญ",
    name_en: "Athasart Narkthewan",
    photo: "/image/athasart.webp",
    advise_years: ["1"],
    contact: "athasart.n@ce.ac.th",
  },
  {
    id: 2,
    name_th: "ดร.รัตติกร สมบัติแก้ว",
    name_en: "Rattikorn Sombutkaew",
    photo: "/image/rattikorn.webp",
    advise_years: ["2"],
    contact: "rattikorn.s@ce.ac.th",
  },
  {
    id: 3,
    name_th: "อาจารย์นภัสรพี สิทธิวัจน์",
    name_en: "Pisakorn Sittiwatjana",
    photo: "/image/pisakorn.webp",
    advise_years: ["3"],
    contact: "pisakorn.s@ce.ac.th",
  },
  {
    id: 4,
    name_th: "ว่าที่ร้อยตรี ศิลา ศิริมาสกุล",
    name_en: "Silar Sirimasakul",
    photo: "/image/silar.webp",
    advise_years: ["4"],
    contact: "silar.s@ce.ac.th",
  },
  {
    id: 5,
    name_th: "อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช",
    name_en: "Sakawkarn Piyawitwanich",
    photo: "/image/sakawkarn.webp",
    advise_years: ["1", "2"],
    contact: "sakawkarn.p@ce.ac.th",
  },
  {
    id: 6,
    name_th: "นายจตุรงค์ เกตุนิมิต",
    name_en: "Jaturong Katenimit",
    photo: "/image/jaturong.webp",
    advise_years: [],
    contact: "",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-none">
        {teachers.map((teacher) => {
          const name = isTh ? teacher.name_th : (teacher.name_en || teacher.name_th);
          const initials = teacher.name_en
            ? teacher.name_en
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : name.slice(0, 2);

          const isAthasart = teacher.id === 1;

          return (
            <div
              key={teacher.id}
              className={`w-full h-[300px] border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer select-none flex flex-col justify-end relative group ${
                isAthasart
                  ? "bg-gradient-to-b from-[#fbc6a9] to-[#e06e30] dark:from-[#ff7b30] dark:to-[#9c3100] hover:shadow-orange-500/20"
                  : "bg-black hover:shadow-black/20 dark:hover:shadow-black/40"
              }`}
            >
              {/* Full Background Portrait Image */}
              {teacher.photo ? (
                <img
                  src={`${teacher.photo}?v=8`}
                  alt={name}
                  className="absolute right-0 bottom-0 h-full w-auto object-contain object-right transition-transform duration-500 group-hover:scale-105 translate-x-[15%] z-0"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold z-0">
                  {initials}
                </div>
              )}
              {/* Vignette & Gradient Overlays (Skip for Athasart) */}
              {!isAthasart && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.85)_100%)] z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />
                </>
              )}

              {/* Profile Info - Floated at the bottom-left */}
              <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 backdrop-blur-md text-white rounded-md border border-white/20 uppercase tracking-wider select-none">
                    {isTh ? "อาจารย์ประจำสาขา" : "Faculty Member"}
                  </span>
                  <h3 className={`text-lg font-bold text-white mt-2 group-hover:text-sky-300 transition-colors line-clamp-1 ${
                    isAthasart ? "drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.6)]" : ""
                  }`}>
                    {name}
                  </h3>
                  {teacher.advise_years && teacher.advise_years.length > 0 && (
                    <p className={`text-xs text-white/60 mt-1 font-medium ${
                      isAthasart ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : ""
                    }`}>
                      {isTh ? "ชั้นปีที่ดูแล: " : "Advise: "}
                      {teacher.advise_years.map((y: string) => `${isTh ? "ปี " : "Year "}${y}`).join(", ")}
                    </p>
                  )}
                </div>
                {teacher.contact && (
                  <div className="text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className={`truncate ${
                      isAthasart ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : ""
                    }`}>{teacher.contact}</span>
                    <span className={`text-white group-hover:translate-x-1 transition-transform ${
                      isAthasart ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : ""
                    }`}>→</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
