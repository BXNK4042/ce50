"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WriterProps {
  params: Promise<{ lang: string }>;
}

export default function WriterPage({ params }: WriterProps) {
  const [lang, setLang] = useState("th");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setLang(p.lang);
    });

    // Check if user is logged in
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_role="))
      ?.split("=")[1];
    setIsLoggedIn(!!role);
  }, [params]);

  const isTh = lang === "th";

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { title, category, body, link };
      const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      
      const res = await fetch(`${backendUrl}/news/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${lang}/news`);
      }, 3000);
    } catch (err) {
      setError(isTh ? "เกิดข้อผิดพลาดในการเชื่อมต่อ" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-950 p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <svg
            className="w-16 h-16 mx-auto text-amber-500 mb-4 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">
            {isTh ? "จำเป็นต้องเข้าสู่ระบบ" : "Authentication Required"}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
            {isTh
              ? "คุณจำเป็นต้องเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบหรือผู้เขียนเพื่อเข้าถึงหน้านี้"
              : "You must be logged in as an administrator or writer to access this page."}
          </p>
          <Link
            href={`/${lang}/admin/login`}
            className="inline-block w-full py-3 bg-[#e55300] hover:bg-[#c94800] text-white font-semibold transition-all uppercase tracking-wider text-sm"
          >
            {isTh ? "เข้าสู่ระบบตอนนี้" : "Log In Now"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[85vh] py-12 px-6 md:px-16 flex justify-center items-start bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center">
          <div className="bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold px-6 py-3 rounded-none shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <svg
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{isTh ? "สร้างข่าวสารสำเร็จ" : "News published successfully"}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-wider text-zinc-900 dark:text-white uppercase">
            {isTh ? "เขียนข่าวสารใหม่" : "Write New News"}
          </h1>
          <Link
            href={`/${lang}/news`}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            {isTh ? "ย้อนกลับ" : "Back"}
          </Link>
        </div>

        <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* News Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "หัวข้อข่าวสาร" : "News Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isTh ? "ระบุหัวข้อข่าวสาร" : "Enter news title"}
                required
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "หมวดหมู่" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all cursor-pointer text-sm font-medium"
              >
                <option value="competition">{isTh ? "การแข่งขัน (Competition)" : "Competition"}</option>
                <option value="scholarship">{isTh ? "ทุนการศึกษา (Scholarship)" : "Scholarship"}</option>
                <option value="other">{isTh ? "ข่าวประชาสัมพันธ์อื่นๆ (Other)" : "Other"}</option>
              </select>
            </div>

            {/* Link / URL (optional) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "ลิงก์เชื่อมโยง (ถ้ามี)" : "Link / URL (Optional)"}
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com/details"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all"
              />
            </div>

            {/* News Body / Content */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {isTh ? "เนื้อหาข่าวสาร" : "News Content"}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isTh ? "เขียนเนื้อหาข่าวสารของคุณที่นี่..." : "Write news content here..."}
                rows={6}
                required
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all resize-y min-h-[150px]"
              />
            </div>

            {/* Buttons Row */}
            <div className="flex gap-4 mt-2">
              <Link
                href={`/${lang}/news`}
                className="flex-1 py-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-center font-bold text-zinc-700 dark:text-zinc-300 transition-all uppercase tracking-wider text-sm rounded-none"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#e55300] hover:bg-[#c94800] text-white font-bold transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wider text-sm rounded-none"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isTh ? "เผยแพร่ข่าวสาร" : "Publish News"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
