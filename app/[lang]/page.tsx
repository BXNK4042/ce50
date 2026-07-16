import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import PeopleSlider from "@/components/layout/people-slider";

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 flex flex-col items-center justify-center text-center min-h-[calc(100vh-76px)]">
        {/* Relative container for the logo and overlay text */}
        <div className="relative h-[450px] w-[450px] flex items-center justify-center transition-transform duration-300 hover:scale-105 group select-none">
          <img
            src="/CE.webp"
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
          {/* Block 1 (Largest - spans 2 columns on medium screens and above) */}
          <div className="md:col-span-2 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-8 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-4 cursor-pointer select-none group">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100/80 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 rounded-full border border-blue-200 dark:border-sky-500/30 uppercase tracking-wider">
              {lang === "th" ? "ประชาสัมพันธ์" : "Announcement"}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
              {lang === "th" 
                ? "เปิดรับสมัครนักศึกษาใหม่ระดับปริญญาตรี ปีการศึกษา 2569" 
                : "Undergraduate Applications Open for Academic Year 2026"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base line-clamp-3">
              {lang === "th"
                ? "สาขาวิชาวิศวกรรมคอมพิวเตอร์เปิดรับสมัครนักเรียน ม.6 หรือเทียบเท่าเข้าศึกษาต่อในหลักสูตรวิศวกรรมศาสตรบัณฑิต ประจำปีการศึกษา 2569 รายละเอียดเกณฑ์การคัดเลือกและกำหนดการ..."
                : "Computer Engineering program invites high school graduates to apply for the Bachelor of Engineering program for academic year 2026. Detailed selection criteria and timeline..."}
            </p>
            <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-2 border-t border-zinc-100 dark:border-zinc-800/30 pt-4">
              <span>{lang === "th" ? "16 กรกฎาคม 2569" : "July 16, 2026"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Right Column Stack for Block 2 & 3 */}
          <div className="flex flex-col gap-6">
            {/* Block 2 */}
            <div className="flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-wider">
                {lang === "th" ? "การแข่งขัน" : "Competition"}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
                {lang === "th"
                  ? "นักศึกษา CE คว้าเหรียญทองการแข่งขันพัฒนาซอฟต์แวร์ระดับประเทศ"
                  : "CE Students Win Gold in National Software Contest"}
              </h3>
              <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-1 border-t border-zinc-100 dark:border-zinc-800/30 pt-3">
                <span>{lang === "th" ? "14 กรกฎาคม 2569" : "July 14, 2026"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Block 3 */}
            <div className="flex-1 bg-white dark:bg-black border border-blue-100 dark:border-zinc-800/50 p-6 shadow-md shadow-black/10 dark:shadow-black/20 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/30 hover:scale-[1.015] transition-all duration-300 flex flex-col justify-end items-start text-left gap-3 cursor-pointer select-none group">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-purple-100/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-500/30 uppercase tracking-wider">
                {lang === "th" ? "สัมมนาพิเศษ" : "Seminar"}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-2">
                {lang === "th"
                  ? "สัมมนาพิเศษ: นวัตกรรม AI และทิศทางเทคโนโลยีในทศวรรษหน้า"
                  : "Special Seminar: AI Innovation and Next Decade Tech Trends"}
              </h3>
              <div className="w-full flex items-center justify-between text-xs text-zinc-400 dark:text-blue-200/50 mt-1 border-t border-zinc-100 dark:border-zinc-800/30 pt-3">
                <span>{lang === "th" ? "10 กรกฎาคม 2569" : "July 10, 2026"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Equal size to Section 2, matching Section 1 background in all themes */}
      <div className="relative h-screen w-full bg-background p-12 md:p-16 flex flex-col gap-6">
        <PeopleSlider lang={lang} title={dict.home.people} />
      </div>
    </>
  );
}
