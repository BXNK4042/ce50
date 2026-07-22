import { notFound } from "next/navigation";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import RoomImageGallery from "@/components/rooms/room-image-gallery";
import Room3DViewer from "@/components/rooms/room-3d-viewer";

export async function generateStaticParams() {
  return [
    { lang: "th", id: "113" },
    { lang: "en", id: "113" },
    { lang: "th", id: "server-room" },
    { lang: "en", id: "server-room" },
  ];
}

interface RoomDetail {
  id: string;
  titleTh: string;
  titleEn: string;
  locationTh: string;
  locationEn: string;
  tagTh: string;
  tagEn: string;
  descTh: string;
  descEn: string;
  images: string[];
  featuresTh: string[];
  featuresEn: string[];
}

const ROOMS_DATA: Record<string, RoomDetail> = {
  "113": {
    id: "113",
    titleTh: "ห้องเรียน 113",
    titleEn: "Classroom 113",
    locationTh: "ตึก E ห้อง 113",
    locationEn: "Building E, Room 113",
    tagTh: "ห้องเรียน / ปฏิบัติการ",
    tagEn: "Lecture & Lab",
    descTh:
      "ห้องปฏิบัติการคอมพิวเตอร์และห้องเรียนสำหรับการเรียนการสอนของภาควิชาวิศวกรรมคอมพิวเตอร์ ตึก E ชั้น 1 พร้อมด้วยคอมพิวเตอร์ประมวลผลประสิทธิภาพสูง จอภาพคู่ อุปกรณ์เชื่อมต่อเครือข่ายความเร็วสูง จอโปรเจกเตอร์อินเทอร์แอคทีฟ และระบบปรับอากาศ เหมาะสำหรับการเรียนวิชาโปรแกรมมิ่ง ระบบโครงสร้างข้อมูล ปัญญาประดิษฐ์ และการสอบปฏิบัติการ",
    descEn:
      "Advanced computer engineering laboratory and lecture hall located at Building E, Floor 1. Equipped with high-performance workstation PCs, dual monitors, high-speed networking, interactive presentation displays, and climate control system. Specially designed for computer programming, data structures, AI labs, and practical examinations.",
    images: [], // ดึง array รูปภาพจาก Database ในอนาคตเมื่อมีข้อมูล
    featuresTh: [
      "คอมพิวเตอร์ประมวลผลสูง จอคู่",
      "โปรเจกเตอร์ & เครื่องเสียงระดับพรีเมียม",
      "ระบบเครือข่าย High-Speed Gigabit LAN",
      "ความจุรองรับนักศึกษา 60 คน",
    ],
    featuresEn: [
      "High-Performance PCs with Dual Monitors",
      "Interactive Projector & Premium Sound System",
      "High-Speed Gigabit LAN Network",
      "Capacity for 60 Students",
    ],
  },
  "server-room": {
    id: "server-room",
    titleTh: "ห้องเซิร์ฟเวอร์",
    titleEn: "Server Room",
    locationTh: "ตึก B ห้อง 317",
    locationEn: "Building B, Room 317",
    tagTh: "ศูนย์ข้อมูลภาควิชา",
    tagEn: "Data Center",
    descTh:
      "ศูนย์ข้อมูลและระบบเซิร์ฟเวอร์หลักของภาควิชาวิศวกรรมคอมพิวเตอร์ ตึก B ชั้น 3 (ห้อง 317) รวบรวมเครื่องเซิร์ฟเวอร์ประมวลผลสมรรถนะสูง (High-Performance Computing Cluster), ระบบจัดเก็บข้อมูลความเร็วสูง SAN/NAS, อุปกรณ์ Core Network Switches และ Firewall ระบบสแกนลายนิ้วมือเพื่อความปลอดภัย พร้อมระบบควบคุมอุณหภูมิและความชื้นแม่นยำระดับอุตสาหกรรมตลอด 24 ชั่วโมง",
    descEn:
      "Primary data center and High-Performance Computing (HPC) server room located at Building B, Floor 3 (Room 317). Houses enterprise server rack cabinets, SAN/NAS high-speed storage clusters, core layer-3 network switches, enterprise firewalls, biometric access control, and 24/7 industrial precision environmental cooling systems.",
    images: [], // ดึง array รูปภาพจาก Database ในอนาคตเมื่อมีข้อมูล
    featuresTh: [
      "HPC Compute Server Cluster",
      "ระบบ SAN/NAS High-Speed Storage",
      "Core Switch 10Gbps & Security Firewall",
      "ระบบปรับอากาศควบคุมอุณหภูมิ 24/7",
    ],
    featuresEn: [
      "HPC Compute Server Cluster",
      "SAN/NAS High-Speed Storage System",
      "Core Switch 10Gbps & Security Firewall",
      "24/7 Precision Air Conditioning System",
    ],
  },
};

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const room = ROOMS_DATA[id.toLowerCase()];

  if (!room) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";

  const title = isTh ? room.titleTh : room.titleEn;
  const location = isTh ? room.locationTh : room.locationEn;
  const tag = isTh ? room.tagTh : room.tagEn;
  const desc = isTh ? room.descTh : room.descEn;
  const features = isTh ? room.featuresTh : room.featuresEn;

  return (
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-auto max-w-5xl px-6 md:px-12 space-y-12">
        {/* 1. TOP SECTION: Photos / Images Gallery (Rendered only if images are provided from DB) */}
        {room.images && room.images.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              {isTh ? "รูปภาพบรรยากาศภายในห้อง" : "Room Image Gallery"}
            </h2>
            <RoomImageGallery images={room.images} title={title} tag={tag} location={location} />
          </div>
        ) : null}

        {/* 2. MIDDLE SECTION: Room Name & Detailed Description */}
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50/80 dark:bg-sky-950/50 border border-blue-100 dark:border-sky-900/40 text-sm font-semibold text-blue-600 dark:text-sky-300 self-start md:self-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>{location}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
              {isTh ? "รายละเอียดห้อง" : "Room Description"}
            </h3>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Key Features List */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              {isTh ? "อุปกรณ์และระบบอำนวยความสะดวก" : "Facilities & Equipment"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-sky-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SECTION: Interactive 3D Rotatable Room Viewer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              {isTh ? "ห้องจำลอง 3D แบบ Interactive (หมุนดูได้ 360°)" : "Interactive 3D Room Viewer (360° Rotatable)"}
            </h2>
          </div>
          <Room3DViewer roomId={room.id} lang={lang} />
        </div>
      </section>
    </div>
  );
}
