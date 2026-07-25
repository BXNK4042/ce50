import type { NewsCategory } from "@/lib/types";

interface HomeNewsFeaturedProps {
  newsTitle: string;
  featured: any[];
  isTh: boolean;
}

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

export function HomeNewsFeatured({ newsTitle, featured, isTh }: HomeNewsFeaturedProps) {
  const [big, small1, small2] = featured;

  return (
    <div className="relative h-screen w-full bg-[#cad9f0] dark:bg-[#0a192f] p-12 md:p-16 flex flex-col gap-6 transition-colors duration-300">
      <h2 className="flex items-center gap-3.5 text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight select-none">
        <span className="inline-block w-1.5 h-[0.9em] bg-blue-600 dark:bg-sky-500 rounded-full shrink-0" />
        {newsTitle}
      </h2>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {featured.length === 0 ? (
          <div className="md:col-span-3 flex items-center justify-center bg-white/50 dark:bg-black/30 border border-dashed border-blue-200 dark:border-zinc-800 rounded-xl p-12 text-zinc-500 dark:text-zinc-400">
            {isTh ? "ยังไม่มีข่าวสารในขณะนี้" : "No news yet."}
          </div>
        ) : (
          <>
            {big && (
              <a
                href={big.link || "#"}
                className="relative overflow-hidden md:col-span-2 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-8 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-4 cursor-pointer select-none group"
              >
                {big.image && (
                  <img
                    src={big.image}
                    alt={big.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                  />
                )}
                {big.image && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                )}
                <div className="relative z-20 w-full flex flex-col justify-end items-start gap-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[big.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                    {isTh ? (CATEGORY_STYLE[big.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[big.category as NewsCategory]?.labelEn ?? "News")}
                  </span>
                  <h3 className={`text-2xl md:text-3xl font-bold leading-tight transition-colors ${big.image ? "text-white group-hover:text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300"}`}>
                    {big.title}
                  </h3>
                  {big.body && (
                    <p className={`text-sm md:text-base line-clamp-3 ${big.image ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : "text-zinc-500 dark:text-zinc-400"}`}>
                      {big.body}
                    </p>
                  )}
                  <div className={`w-full flex items-center justify-between text-xs mt-2 border-t pt-4 ${big.image ? "text-white/70 border-white/20" : "text-zinc-400 dark:text-blue-200/50 border-zinc-100 dark:border-zinc-800/30"}`}>
                    <span>{formatDate(big.published_at, isTh)}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </a>
            )}

            <div className="flex flex-col gap-6">
              {small1 && (
                <a
                  href={small1.link || "#"} 
                  className="relative overflow-hidden flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group"
                >
                  {small1.image && (
                    <img
                      src={small1.image}
                      alt={small1.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                    />
                  )}
                  {small1.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                  )}
                  <div className="relative z-20 w-full flex flex-col justify-end items-start gap-3">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[small1.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                      {isTh ? (CATEGORY_STYLE[small1.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[small1.category as NewsCategory]?.labelEn ?? "News")}
                    </span>
                    <h3 className={`text-lg font-bold leading-snug transition-colors line-clamp-2 ${small1.image ? "text-white group-hover:text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300"}`}>
                      {small1.title}
                    </h3>
                    <div className={`w-full flex items-center justify-between text-xs mt-1 border-t pt-3 ${small1.image ? "text-white/70 border-white/20" : "text-zinc-400 dark:text-blue-200/50 border-zinc-100 dark:border-zinc-800/30"}`}>
                      <span>{formatDate(small1.published_at, isTh)}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </a>
              )}

              {small2 && (
                <a
                  href={small2.link || "#"}
                  className="relative overflow-hidden flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group"
                >
                  {small2.image && (
                    <img
                      src={small2.image}
                      alt={small2.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                    />
                  )}
                  {small2.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                  )}
                  <div className="relative z-20 w-full flex flex-col justify-end items-start gap-3">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${CATEGORY_STYLE[small2.category as NewsCategory]?.badge ?? CATEGORY_STYLE.other.badge}`}>
                      {isTh ? (CATEGORY_STYLE[small2.category as NewsCategory]?.labelTh ?? "ข่าวสาร") : (CATEGORY_STYLE[small2.category as NewsCategory]?.labelEn ?? "News")}
                    </span>
                    <h3 className={`text-lg font-bold leading-snug transition-colors line-clamp-2 ${small2.image ? "text-white group-hover:text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300"}`}>
                      {small2.title}
                    </h3>
                    <div className={`w-full flex items-center justify-between text-xs mt-1 border-t pt-3 ${small2.image ? "text-white/70 border-white/20" : "text-zinc-400 dark:text-blue-200/50 border-zinc-100 dark:border-zinc-800/30"}`}>
                      <span>{formatDate(small2.published_at, isTh)}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
