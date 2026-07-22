import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import PeopleSlider from "@/components/layout/people-slider";
import { api } from "@/lib/api";
import type { NewsCategory, Teacher } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORY_STYLE: Record<NewsCategory, { labelTh: string; labelEn: string; badge: string }> = {
  competition: {
    labelTh: "การแข่งขัน",
    labelEn: "Competition",
    badge: "bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  },
  scholarship: {
    labelTh: "ทุนการศึกษา",
    labelEn: "Scholarship",
    badge: "bg-purple-100/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  },
  other: {
    labelTh: "ประชาสัมพันธ์",
    labelEn: "Announcement",
    badge: "bg-blue-100/80 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30",
  },
};

function formatDate(raw: string | null | undefined, isTh: boolean): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  if (isTh) {
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  }
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const isTh = lang === "th";

  let news: any[] = [];
  try {
    news = await api.news();
  } catch (e) {
    console.error("Failed to fetch homepage news:", e);
  }
  let teachers: Teacher[] = [];
  try {
    teachers = await api.teachers();
  } catch (e) {
    console.error("Failed to fetch homepage teachers:", e);
  }
  const featured = news.slice(0, 3);
  const [big, small1, small2] = featured;
  return (
    <>
      <section className="relative w-full flex flex-col items-center justify-center text-center min-h-[calc(100vh-76px)] overflow-hidden">
        {/* Relative container for the logo and overlay text */}
        <div className="relative z-10 h-[450px] w-[450px] flex items-center justify-center transition-transform duration-300 hover:scale-105 group select-none">
          <img
            src="/ce_logo.webp"
            alt="CE Logo"
            className="h-full w-full object-contain"
          />
          {/* Overlaid Title */}
          <h1 className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold tracking-tight text-white whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
            {dict.home.title}
          </h1>
        </div>
      </section>

      {/* Spacer equal to the height of the home page screen, colored dark blue with NEWS section */}
      <div className="relative h-screen w-full bg-[#cad9f0] dark:bg-[#0a192f] p-12 md:p-16 flex flex-col gap-6 transition-colors duration-300">
        <h2 className="flex items-center gap-3.5 text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight select-none">
          <span className="inline-block w-1.5 h-[0.9em] bg-blue-600 dark:bg-sky-500 rounded-full shrink-0" />
          {dict.home.news}
        </h2>

        {/* 3 Blocks Grid Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          {featured.length === 0 ? (
            <div className="md:col-span-3 flex items-center justify-center bg-white/50 dark:bg-black/30 border border-dashed border-blue-200 dark:border-zinc-800 rounded-xl p-12 text-zinc-500 dark:text-zinc-400">
              {isTh ? "ยังไม่มีข่าวสารในขณะนี้" : "No news yet."}
            </div>
          ) : (
            <>
              {/* Block 1 (Largest - spans 2 columns on medium screens and above) */}
              {big && (
                <a
                  href={big.link || "#"}
                  className="md:col-span-2 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-8 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-4 cursor-pointer select-none group"
                >
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[big.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                    {isTh ? (CATEGORY_STYLE[big.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[big.category as NewsCategory]?.labelEn ?? "News")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                    {big.title}
                  </h3>
                  {big.body && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base line-clamp-3">
                      {big.body}
                    </p>
                  )}
                  <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-2 border-t border-zinc-100 dark:border-zinc-800/30 pt-4">
                    <span>{formatDate(big.published_at, isTh)}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              )}

              {/* Right Column Stack for Block 2 & 3 */}
              <div className="flex flex-col gap-6">
                {small1 && (
                  <a
                    href={small1.link || "#"} 
                    className="flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group"
                  >
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[small1.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                      {isTh ? (CATEGORY_STYLE[small1.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[small1.category as NewsCategory]?.labelEn ?? "News")}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors line-clamp-2">
                      {small1.title}
                    </h3>
                    <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-1 border-t border-zinc-100 dark:border-zinc-800/30 pt-3">
                      <span>{formatDate(small1.published_at, isTh)}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </a>
                )}

                {small2 && (
                  <a
                    href={small2.link || "#"}
                    className="flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group"
                  >
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[small2.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                      {isTh ? (CATEGORY_STYLE[small2.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[small2.category as NewsCategory]?.labelEn ?? "News")}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors line-clamp-2">
                      {small2.title}
                    </h3>
                    <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-1 border-t border-zinc-100 dark:border-zinc-800/30 pt-3">
                      <span>{formatDate(small2.published_at, isTh)}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 3: Equal size to Section 2, matching Section 1 background in all themes */}
      <div className="relative h-screen w-full bg-background p-12 md:p-16 flex flex-col gap-6">
        <PeopleSlider lang={lang} title={dict.home.people} people={teachers} />
      </div>
    </>
  );
}
