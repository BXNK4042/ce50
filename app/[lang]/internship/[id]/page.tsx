import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchInternshipStudentById, fetchInternshipStudents } from "@/lib/internship-data";
import { ArrowLeft, Building2, Briefcase, GraduationCap, Calendar, Cpu, MessageSquareQuote, CheckCircle2, User, Coins, Gift, Star } from "lucide-react";

export async function generateStaticParams() {
  // ponytail: pre-render static paths for th and en locales
  const students = await fetchInternshipStudents();
  return ["th", "en"].flatMap((lang) =>
    students.map((student) => ({
      lang,
      id: student.id,
    }))
  );
}

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const isTh = lang === "th";

  const student = await fetchInternshipStudentById(id);
  if (!student) {
    notFound();
  }

  const name = isTh ? student.name_th : student.name_en;
  const position = isTh ? student.position_th : student.position_en;
  const period = isTh ? student.period_th : student.period_en;
  const description = isTh ? student.description_th : student.description_en;
  const advice = isTh ? student.advice_th : student.advice_en;
  const stipend = isTh ? student.stipend_th : student.stipend_en;
  const welfare = isTh ? student.welfare_th : student.welfare_en;

  const formatImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.includes("/server/image/")) {
      return "/image/" + url.split("/server/image/")[1];
    }
    return url;
  };

  const bgImageSrc = formatImageUrl(student.bg_image) || formatImageUrl(student.photo);

  return (
    <div className="w-full min-h-screen bg-[#cad9f0]/40 dark:bg-black text-zinc-900 dark:text-white px-12 md:px-16 pt-6 pb-12 relative overflow-hidden select-none space-y-8 transition-colors duration-300">
      {/* Top Background Hero Image with Bottom Fade */}
      {bgImageSrc && (
        <div className="absolute top-0 left-0 right-0 h-[32rem] md:h-[42rem] w-full overflow-hidden pointer-events-none z-0">
          <Image
            src={bgImageSrc}
            alt={name}
            fill
            priority
            className="object-cover object-top opacity-20 dark:opacity-30 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#cad9f0]/60 via-[#cad9f0]/90 to-[#cad9f0] dark:from-black/40 dark:via-black/80 dark:to-black" />
        </div>
      )}

      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-zinc-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HERO SECTION: Left (70% Company Name) | Right (30% Logo) */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 z-10 border-b border-zinc-200 dark:border-white/10 pb-8 pt-0 relative">
        
        {/* Left Side (70%): ONLY Company Name & Back Button */}
        <div className="w-full md:w-[70%] flex flex-col items-start text-left space-y-4">
          <div className="-mt-3 md:-mt-5">
            <Link
              href={`/${lang}/internship`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/15 text-sm font-semibold text-zinc-800 dark:text-white transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>{isTh ? "กลับสู่หน้าข้อมูลการฝึกงาน" : "Back to Internship Overview"}</span>
            </Link>
          </div>

          <div className="pt-6 md:pt-10">
            {/* ONLY Company Name Here */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              {student.company}
            </h1>
          </div>
        </div>

        {/* Right Side (30%): Company Logo / CE Logo Fallback */}
        <div className="w-full md:w-[30%] flex items-center justify-center shrink-0 pt-6 md:pt-14">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center opacity-85 dark:opacity-70 transition-opacity duration-300 hover:opacity-100">
            <img
              src={formatImageUrl(student.logo) || "/ce_logo.webp"}
              alt={student.company || "Company Logo"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

      </div>

      {/* 2. BOTTOM SECTION: Left 70% (Remaining Student Details) | Right 30% (Company, Position, Stipend & Welfare) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-10 gap-8 z-10">

        {/* LEFT 70% COLUMN (md:col-span-7): Student Profile, Work Responsibilities, Tech, Advice */}
        {/* ponytail: main student info panel */}
        <div className="md:col-span-7 p-8 md:p-10 rounded-2xl bg-white/90 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md space-y-8 shadow-xl dark:shadow-2xl">
          
          {/* Sub-heading 1: Student Profile Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-zinc-400 font-bold text-lg border-b border-zinc-200 dark:border-white/10 pb-3">
              <User className="w-5 h-5 shrink-0" />
              <h2>{isTh ? "ข้อมูลนักศึกษาผู้ฝึกงาน" : "Intern Student Profile"}</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-zinc-700/60 shadow-xl shrink-0">
                <Image
                  src={student.photo}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800/60 text-blue-700 dark:text-zinc-300 border border-blue-100 dark:border-zinc-700/40 text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {student.track}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800/60 text-blue-700 dark:text-zinc-300 border border-blue-100 dark:border-zinc-700/40 text-xs font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                    {position}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {name}
                </h3>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

          {/* Sub-heading 2: Work Responsibilities & Contributions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-zinc-400 font-bold text-lg border-b border-zinc-200 dark:border-white/10 pb-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3>{isTh ? "ลักษณะงานและสิ่งที่ได้ลงมือทำ" : "Role Responsibilities & Key Contributions"}</h3>
            </div>
            <p className="text-base text-zinc-700 dark:text-zinc-200 leading-relaxed pt-1">
              {description}
            </p>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

          {/* Sub-heading 3: Technologies Used */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-zinc-400 font-bold text-lg border-b border-zinc-200 dark:border-white/10 pb-3">
              <Cpu className="w-5 h-5 shrink-0" />
              <h3>{isTh ? "เทคโนโลยีและเครื่องมือที่ใช้ในการฝึกงาน" : "Technologies & Tools Used"}</h3>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {student.tech.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

          {/* Sub-heading 4: Advice for Juniors & 5-Star Rating */}
          <div className="space-y-4 p-5 md:p-6 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <MessageSquareQuote className="w-5 h-5 shrink-0 text-blue-600 dark:text-zinc-400" />
                <span>{isTh ? "คำแนะนำจากรุ่นพี่ถึงรุ่นน้อง" : "Advice for Juniors"}</span>
              </div>

              {/* 5-Star Rating System */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/80 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700/50 backdrop-blur-sm shadow-xs">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300 mr-1">
                  {isTh ? "คะแนนความพึงพอใจ:" : "Rating:"}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (student.rating || 5)
                          ? "text-amber-400 fill-amber-400"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-1">
                  {(student.rating || 5).toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            <p className="text-base text-zinc-700 dark:text-zinc-200 italic leading-relaxed pl-1">
              "{advice}"
            </p>
          </div>

        </div>

        {/* RIGHT 30% COLUMN (md:col-span-3): Company, Position, Stipend & Welfare Sidebar */}
        <div className="md:col-span-3 p-6 md:p-8 rounded-2xl bg-white/90 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md space-y-6 shadow-xl dark:shadow-2xl h-fit">
          
          <div className="flex items-center gap-2 text-blue-600 dark:text-zinc-400 font-bold text-lg border-b border-zinc-200 dark:border-white/10 pb-3">
            <Building2 className="w-5 h-5 shrink-0" />
            <h3>{isTh ? "ข้อมูลสถานที่และตำแหน่ง" : "Company & Position"}</h3>
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isTh ? "สถานที่ฝึกงาน" : "Company / Host"}
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
              {student.company}
            </div>
          </div>

          {/* Internship Role / Position */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isTh ? "ตำแหน่งที่ไปฝึกงาน" : "Position / Role"}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-zinc-800/60 text-blue-700 dark:text-zinc-300 border border-blue-100 dark:border-zinc-700/40 text-sm font-semibold mt-1">
              <Briefcase className="w-4 h-4 shrink-0 text-blue-500 dark:text-zinc-400" />
              <span>{position}</span>
            </div>
          </div>

          {/* Track / Department */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isTh ? "กลุ่มงาน / สาขาวิชา" : "Track / Domain"}
            </div>
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {student.track}
            </div>
          </div>

          {/* Duration / Period */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isTh ? "ช่วงเวลาฝึกงาน" : "Duration"}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <Calendar className="w-4 h-4 text-blue-500 dark:text-zinc-400 shrink-0" />
              <span>{period}</span>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

          {/* 1. STIPEND & ALLOWANCE */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              <Coins className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
              <span>{isTh ? "เบี้ยเลี้ยงการฝึกงาน" : "Stipend & Allowance"}</span>
            </div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
              {stipend}
            </div>
          </div>

          {/* 2. WELFARE & BENEFITS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              <Gift className="w-4 h-4 shrink-0 text-emerald-500 dark:text-zinc-400" />
              <span>{isTh ? "สวัสดิการที่ได้รับ" : "Welfare & Benefits"}</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
              {welfare.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-100/70 dark:bg-white/5 p-2.5 rounded-lg border border-zinc-200/80 dark:border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-zinc-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
