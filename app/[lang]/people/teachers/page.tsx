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
            <div key={teacher.id} className="relative group w-full h-[300px]">
              {/* Actual Card Container (with overflow-hidden) */}
              <div
                className={`w-full h-full border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer select-none flex flex-col justify-end relative bg-gradient-to-b from-[#a7c7f2] to-[#2b5c9e] dark:from-[#3b7cd4] dark:to-[#12294a] ${
                  isAthasart
                    ? "hover:from-[#fbc6a9] hover:to-[#e06e30] dark:hover:from-[#ff7b30] dark:hover:to-[#9c3100] hover:shadow-orange-500/20"
                    : "hover:shadow-blue-500/20"
                }`}
              >
                {/* Full Background Portrait Image */}
                {teacher.photo ? (
                  <img
                    src={`${teacher.photo}?v=8`}
                    alt={name}
                    className="absolute right-0 bottom-0 h-full w-auto object-contain object-right translate-x-[15%] z-0"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold z-0">
                    {initials}
                  </div>
                )}

                {/* Profile Info - Floated at the bottom-left */}
                <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 backdrop-blur-md text-white rounded-md border border-white/20 uppercase tracking-wider select-none">
                      {teacher.id === 6
                        ? (isTh ? "นักวิชาการคอมพิวเตอร์" : "Computer Technical Officer")
                        : (isTh ? "อาจารย์ประจำสาขา" : "Faculty Member")}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-sky-300 transition-colors line-clamp-1">
                      {name}
                    </h3>
                    {teacher.advise_years && teacher.advise_years.length > 0 && (
                      <p className="text-xs text-white/60 mt-1 font-medium">
                        {isTh ? "ชั้นปีที่ดูแล: " : "Advise: "}
                        {teacher.advise_years.map((y: string) => `${isTh ? "ปี " : "Year "}${y}`).join(", ")}
                      </p>
                    )}
                  </div>
                  {teacher.contact && (
                    <div className="text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                      <span className="truncate">{teacher.contact}</span>
                      <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Viewport Overlay for Athasart (outside overflow-hidden) */}
              {isAthasart && teacher.photo && (
                <div className="fixed inset-0 bg-black/70 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-500 z-[9999] flex items-center justify-center backdrop-blur-sm">
                  <img
                    src={`${teacher.photo}?v=8`}
                    alt={name}
                    className="h-[75vh] w-auto object-contain transition-all duration-1000 ease-out transform scale-0 rotate-0 group-hover:scale-100 group-hover:rotate-[-1080deg] drop-shadow-[0_20px_50px_rgba(245,148,92,0.4)] pointer-events-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
