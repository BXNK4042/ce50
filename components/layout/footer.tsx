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
              <a href="mailto:kmitl-chumphon@kmitl.ac.th" className="hover:text-white hover:underline transition-colors">
                kmitl-chumphon@kmitl.ac.th
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-500">🌐</span>
              <a href="https://www.kmitl-chumphon.kmitl.ac.th/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors truncate">
                kmitl-chumphon.kmitl.ac.th
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
              href="https://www.facebook.com/KMITLPrinceofChumphon"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
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
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
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
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              title="Line"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M12 2C6.48 2 2 5.82 2 10.53c0 2.76 1.51 5.21 3.93 6.78-.2.66-.73 2.39-.83 2.74-.13.43.08.42.36.23.27-.18 4.2-2.77 4.74-3.13.58.07 1.18.11 1.8.11 5.52 0 10-3.82 10-8.53S17.52 2 12 2zm-4.7 11.23h-.8c-.34 0-.6-.27-.6-.6V7.37c0-.33.26-.6.6-.6h.8c.33 0 .6.27.6.6v5.26c0 .33-.27.6-.6.6zm3.3 0H9.72c-.34 0-.6-.27-.6-.6V7.37c0-.33.26-.6.6-.6h.88c.33 0 .6.27.6.6V10.2l1.62-2.83c.18-.32.48-.6.82-.6h.87c.37 0 .49.33.25.61l-1.92 2.21 2.06 3.04c.24.36.08.6-.33.6h-.93a.9.9 0 0 1-.72-.37l-1.57-2.31V12.63c0 .33-.27.6-.6.6zm3.9-.6c0 .33-.27.6-.6.6h-.8c-.33 0-.6-.27-.6-.6V7.37c0-.33.27-.6.6-.6h.8c.33 0 .6.27.6.6v5.26zm5.8 0c0 .33-.27.6-.6.6h-2.1c-.34 0-.6-.27-.6-.6V7.37c0-.33.26-.6.6-.6h2.1c.33 0 .6.27.6.6v.77c0 .33-.27.6-.6.6h-1.3v1.07h1.17c.33 0 .6.27.6.6v.72c0 .33-.27.6-.6.6h-1.17v1.17h1.3c.33 0 .6.27.6.6v.77z" />
              </svg>
            </a>
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
