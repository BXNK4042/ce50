import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import Link from "next/link";
import { fetchRooms } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";
  const dbRooms = await fetchRooms();

  const parseRoomImages = (raw?: string | null): string[] => {
    if (!raw) return [];
    if (raw.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {
        // ponytail: fallback to comma split if json parse fails
      }
    }
    if (raw.includes(",")) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [raw.trim()];
  };

  const roomsList = dbRooms.map((r) => {
    const slug = r.slug || r.name;
    const dbImages = parseRoomImages(r.image);
    return {
      id: slug,
      titleTh: r.title_th || r.name,
      titleEn: r.title_en || r.name,
      locationTh: r.location_th || "",
      locationEn: r.location_en || "",
      tagTh: r.tag_th || "ห้องปฏิบัติการ",
      tagEn: r.tag_en || "Laboratory",
      descTh: r.desc_th || r.description || "",
      descEn: r.desc_en || r.description || "",
      image: dbImages[0] || null,
    };
  });

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-6 md:px-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {dict.rooms.title}
          </h1>
          {dict.rooms.subtitle ? (
            <p className="mt-3 text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              {dict.rooms.subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roomsList.map((room) => (
            <Link
              key={room.id}
              href={`/${lang}/rooms/${room.id}`}
              className="group bg-white dark:bg-black/80 border border-blue-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {room.image ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={room.image}
                      alt={isTh ? room.titleTh : room.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full bg-blue-600/90 dark:bg-sky-500/90 text-white backdrop-blur-md shadow-sm">
                      {isTh ? room.tagTh : room.tagEn}
                    </span>
                  </div>
                ) : null}

                <div className="p-6">
                  {!room.image ? (
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-sky-950/60 border border-blue-100 dark:border-sky-900/50 text-blue-600 dark:text-sky-400">
                        {isTh ? room.tagTh : room.tagEn}
                      </span>
                    </div>
                  ) : null}

                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {isTh ? room.titleTh : room.titleEn}
                  </h2>

                  {room.locationTh || room.locationEn ? (
                    <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-sky-950/50 border border-blue-100 dark:border-sky-900/40 text-xs font-semibold text-blue-600 dark:text-sky-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>{isTh ? room.locationTh : room.locationEn}</span>
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {isTh ? room.descTh : room.descEn}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-sky-400 group-hover:underline">
                <span>{isTh ? "ดูรายละเอียดและโมเดล 3D จำลอง" : "View Details & 3D Model"}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
