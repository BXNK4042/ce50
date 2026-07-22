import Link from "next/link";

export default function Footer({ lang }: { lang: string }) {
  const isTh = lang === "th";

  return (
    <footer className="relative z-10 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Brand & Bio */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-600 dark:bg-sky-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-extrabold text-black dark:text-white tracking-tight select-none">
              WE ARE CE
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {isTh
              ? "ภาควิชาวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการวิจัยและการเรียนการสอนด้านเทคโนโลยีซอฟต์แวร์ ฮาร์ดแวร์ ระบบเครือข่าย และปัญญาประดิษฐ์เพื่อสร้างผู้นำทางเทคโนโลยีในอนาคต"
              : "The Computer Engineering Department focuses on research and education in software, hardware, networking, and AI to nurture future tech leaders."}
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
            {isTh ? "ลิงก์ด่วน" : "Quick Links"}
          </h4>
          <ul className="grid grid-cols-2 gap-x-[5px] gap-y-2 text-sm max-w-[240px]">
            <li>
              <Link href={`/${lang}/people`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "บุคลากร" : "People"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/works`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "ผลงาน" : "Works"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/news`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "ข่าวสาร" : "News"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/schedule`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "ตารางสอน/สอบ" : "Class/Exam Schedule"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/rooms`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "ห้อง CE" : "CE Rooms"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/internship`} className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                {isTh ? "ฝึกงาน" : "Internship"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
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
              <a href="mailto:kmitl-chumphon@kmitl.ac.th" className="hover:text-black dark:hover:text-white hover:underline transition-colors">
                kmitl-chumphon@kmitl.ac.th
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-500">🌐</span>
              <a href="https://www.kmitl-chumphon.kmitl.ac.th/" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white hover:underline transition-colors truncate">
                kmitl-chumphon.kmitl.ac.th
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Social Connect */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
            {isTh ? "ติดตามเรา" : "Follow Us"}
          </h4>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/KMITLPrinceofChumphon"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/channel/UCVAF-WEWNY_UzrHlNZL5jog"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://line.me/R/ti/p/%40134lrlhe"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Line"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M24 10.304c0-5.691-5.383-10.304-12-10.304S0 4.613 0 10.304c0 5.097 4.277 9.346 10.059 10.155.392.085.924.258.785.892-.124.567-.406 2.406-.475 2.748-.069.342.162.316.353.21 2.378-1.328 4.2-2.73 4.887-3.13 5.4-1.2 7.2-5.1 7.2-10.304zM6.543 12.613h-1.29V8.341a.3.3 0 00-.3-.3h-.424a.3.3 0 00-.3.3v4.572a.3.3 0 00.3.3h2.014a.3.3 0 00.3-.3v-.3a.3.3 0 00-.3-.3zm3.354 0a.3.3 0 00.3-.3v-4.27a.3.3 0 00-.3-.3h-.424a.3.3 0 00-.3.3v4.27a.3.3 0 00.3.3h.424zm3.73 0a.3.3 0 00.3-.3V8.341a.3.3 0 00-.3-.3h-.424a.3.3 0 00-.238.118l-1.745 2.428V8.341a.3.3 0 00-.3-.3h-.424a.3.3 0 00-.3.3v4.572a.3.3 0 00.3.3h.424a.3.3 0 00.238-.118l1.745-2.428v2.246a.3.3 0 00.3.3h.424zm3.76 0a.3.3 0 00.3-.3v-.3a.3.3 0 00-.3-.3h-1.693v-1.246h1.493a.3.3 0 00.3-.3v-.3a.3.3 0 00-.3-.3h-1.493V9.041h1.693a.3.3 0 00.3-.3v-.3a.3.3 0 00-.3-.3H14.8a.3.3 0 00-.3.3v4.572a.3.3 0 00.3.3h1.993z" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 my-10 border-t border-zinc-200 dark:border-zinc-900" />

      {/* Bottom Copyright */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 flex justify-center text-center text-xs">
        <p>
          &copy; {new Date().getFullYear()} COMPUTER ENGINEERING KMITL PCC. {isTh ? "สงวนลิขสิทธิ์ทั้งหมด" : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
