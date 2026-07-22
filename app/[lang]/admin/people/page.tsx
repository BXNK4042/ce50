import Link from "next/link";

export default async function AdminPeoplePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isTh = lang === "th";

  return (
    <section className="max-w-5xl mx-auto px-6 md:px-16 py-12 md:py-16">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4483cc] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 border border-blue-200 dark:border-blue-800">
          Admin Hub
        </span>
        <h1 className="text-3xl font-black uppercase text-zinc-900 dark:text-white mt-2">
          {isTh ? "จัดการข้อมูลบุคลากร & นักศึกษา" : "People Management"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teachers CRUD Card */}
        <Link
          href={`/${lang}/admin/teachers`}
          className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 hover:border-[#4483cc] transition-all shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-blue-500/10 text-[#4483cc] font-bold text-xl flex items-center justify-center mb-4">
              👨‍🏫
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-[#4483cc] transition-colors">
              {isTh ? "จัดการข้อมูลคณาจารย์" : "Faculty / Teachers CRUD"}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
              {isTh
                ? "เพิ่ม แก้ไข ลบข้อมูลอาจารย์ ที่ปรึกษาประจำชั้นปี และอัปโหลดรูปภาพ"
                : "Create, edit, delete teacher profiles, advise years, and upload photos."}
            </p>
          </div>
          <div className="mt-6 text-xs font-bold uppercase tracking-wider text-[#4483cc] flex items-center gap-1">
            <span>{isTh ? "เข้าสู่หน้าจัดการ" : "Manage Teachers"}</span>
            <span>→</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
