import Link from "next/link";

export default function Footer({ lang }: { lang: string }) {
  const isTh = lang === "th";

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Brand & Bio */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-600 dark:bg-sky-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-extrabold text-white tracking-tight select-none">
              WE ARE CE
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            {isTh
              ? "ภาควิชาวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการวิจัยและการเรียนการสอนด้านเทคโนโลยีซอฟต์แวร์ ฮาร์ดแวร์ ระบบเครือข่าย และปัญญาประดิษฐ์เพื่อสร้างผู้นำทางเทคโนโลยีในอนาคต"
              : "The Computer Engineering Department focuses on research and education in software, hardware, networking, and AI to nurture future tech leaders."}
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            {isTh ? "ลิงก์ด่วน" : "Quick Links"}
          </h4>
          <ul className="grid grid-cols-2 gap-x-[5px] gap-y-2 text-sm max-w-[240px]">
            <li>
              <Link href={`/${lang}/people`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "บุคลากร" : "People"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/works`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "ผลงาน" : "Works"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/news`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "ข่าวสาร" : "News"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/schedule`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "ตารางสอน/สอบ" : "Schedule"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/rooms`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "ห้อง CE" : "CE Rooms"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/internship`} className="hover:text-white hover:underline transition-colors">
                {isTh ? "ฝึกงาน" : "Internship"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            {isTh ? "ติดต่อเรา" : "Contact"}
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-zinc-500 shrink-0">📍</span>
              <span>
                {isTh ? (
                  <>
                    สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง วิทยาเขตชุมพรเขตรอุดมศักดิ์
                    <br />
                    ตั้งอยู่ที่ 17/1 หมู่ 6 ตำบลชุมโค อำเภอปะทิว จังหวัดชุมพร 86160
                  </>
                ) : (
                  <>
                    King Mongkut's Institute of Technology Ladkrabang, Chumphon Khet Udomsak Campus
                    <br />
                    17/1 Moo 6, Chum Kho, Pathio, Chumphon 86160
                  </>
                )}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-500">📞</span>
              <span>077-506422</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-500">✉️</span>
              <a href="mailto:ce@university.ac.th" className="hover:text-white hover:underline transition-colors">
                ce@university.ac.th
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Social Connect */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            {isTh ? "ติดตามเรา" : "Follow Us"}
          </h4>
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              title="Facebook"
            >
              FB
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              title="YouTube"
            >
              YT
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              title="GitHub"
            >
              GH
            </a>
          </div>
          <div className="mt-2 text-xs">
            <Link
              href={`/${lang}/admin/login`}
              className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-850 hover:text-white transition-colors"
            >
              {isTh ? "เข้าสู่ระบบผู้ดูแล" : "Admin Panel"}
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 my-10 border-t border-zinc-900" />

      {/* Bottom Copyright */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 flex justify-center text-center text-xs">
        <p>
          &copy; {new Date().getFullYear()} COMPUTER ENGINEERING KMITL PCC. {isTh ? "สงวนลิขสิทธิ์ทั้งหมด" : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
