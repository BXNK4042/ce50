import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import { fetchRoomByIdentifier } from "@/lib/api";
import RoomImageGallery from "@/components/rooms/room-image-gallery";
import Room3DViewer from "@/components/rooms/room-3d-viewer";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return [
    { lang: "th", id: "113" },
    { lang: "en", id: "113" },
    { lang: "th", id: "server-room" },
    { lang: "en", id: "server-room" },
  ];
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dbRoom = await fetchRoomByIdentifier(id);

  if (!dbRoom) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";

  const parseArrayJson = (raw?: string | null): string[] => {
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

  const images = parseArrayJson(dbRoom.image);
  const featuresTh = parseArrayJson(dbRoom.features_th);
  const featuresEn = parseArrayJson(dbRoom.features_en);

  const title = isTh ? (dbRoom.title_th || dbRoom.name) : (dbRoom.title_en || dbRoom.name);
  const location = isTh ? (dbRoom.location_th || "") : (dbRoom.location_en || "");
  const tag = isTh ? (dbRoom.tag_th || "ห้องปฏิบัติการ") : (dbRoom.tag_en || "Laboratory");
  const desc = isTh ? (dbRoom.desc_th || dbRoom.description || "") : (dbRoom.desc_en || dbRoom.description || "");
  const features = isTh ? featuresTh : featuresEn;

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-6 md:px-12 space-y-8">
        <div>
          <Link
            href={`/${lang}/rooms`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white transition-all shadow-xs backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>{isTh ? "กลับสู่หน้าข้อมูลห้องเรียน" : "Back to Rooms Overview"}</span>
          </Link>
        </div>

        {images.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              {isTh ? "รูปภาพบรรยากาศภายในห้อง" : "Room Image Gallery"}
            </h2>
            <RoomImageGallery images={images} title={title} tag={tag} location={location} />
          </div>
        ) : null}

        <div className="bg-white dark:bg-black/80 border border-blue-100 dark:border-zinc-800 rounded-3xl p-8 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-sky-950/60 border border-blue-100 dark:border-sky-900/50 text-blue-600 dark:text-sky-400 mb-2">
                {tag}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {title}
              </h1>
            </div>

            {location ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50/80 dark:bg-sky-950/50 border border-blue-100 dark:border-sky-900/40 text-sm font-semibold text-blue-600 dark:text-sky-300 self-start md:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>{location}</span>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
              {isTh ? "รายละเอียดห้อง" : "Room Description"}
            </h3>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {desc}
            </p>
          </div>

          {features && features.length > 0 ? (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                {isTh ? "อุปกรณ์และระบบอำนวยความสะดวก" : "Facilities & Equipment"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/50 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            {isTh ? "โมเดล 3D จำลองบรรยากาศห้อง" : "3D Room Virtual Model"}
          </h2>
          <Room3DViewer roomId={dbRoom.slug || String(dbRoom.id)} lang={lang} />
        </div>
      </section>
    </div>
  );
}
