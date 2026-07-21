"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar({
  lang,
  dict,
  initialTheme = "dark",
  cohorts = [],
}: {
  lang: string;
  dict: any;
  initialTheme?: "light" | "dark";
  cohorts?: string[];
}) {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState(lang);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scheduleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkLogin = () => {
      const role = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_role="))
        ?.split("=")[1];
      setIsLoggedIn(!!role);
    };
    checkLogin();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`/${lang}/api/admin/logout`, {
        method: "POST",
      });
      if (res.ok) {
        setIsLoggedIn(false);
        router.push(`/${lang}/admin/login`);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleScheduleMouseEnter = () => {
    if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
    setIsScheduleDropdownOpen(true);
  };

  const handleScheduleMouseLeave = () => {
    scheduleTimeoutRef.current = setTimeout(() => {
      setIsScheduleDropdownOpen(false);
    }, 300);
  };

  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    setShouldAnimate(true);
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.cookie = "theme=dark; path=/; max-age=31536000";
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.cookie = "theme=light; path=/; max-age=31536000";
      setTheme("light");
    }
  };

  const getLanguageLink = (targetLang: string) => {
    if (!pathname) return `/${targetLang}`;
    const segments = pathname.split("/");
    if (segments[1] === "th" || segments[1] === "en") {
      segments[1] = targetLang;
    } else {
      segments.splice(1, 0, targetLang);
    }
    return segments.join("/");
  };

  const handleLanguageChange = (e: React.MouseEvent<HTMLAnchorElement>, targetLang: string) => {
    e.preventDefault();
    if (activeLang === targetLang) {
      const nextLang = targetLang === "th" ? "en" : "th";
      setActiveLang(nextLang);
      setTimeout(() => {
        router.push(getLanguageLink(nextLang), { scroll: false });
      }, 500);
    } else {
      setActiveLang(targetLang);
      setTimeout(() => {
        router.push(getLanguageLink(targetLang), { scroll: false });
      }, 500);
    }
  };

  const links: { href: string; label: string }[] = [
    { href: `/${lang}/people`, label: dict.nav.people },
    { href: `/${lang}/works`, label: dict.nav.works },
    { href: `/${lang}/news`, label: dict.nav.news },
    { href: `/${lang}/schedule`, label: dict.nav.schedule },
    { href: `/${lang}/rooms`, label: dict.nav.rooms },
    { href: `/${lang}/internship`, label: dict.nav.internship },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur-md text-foreground transition-colors duration-300">
      <nav className="relative flex w-full items-center justify-between px-8 py-4">
        {/* Left Section: Language Control & Theme Switcher */}
        <div className="flex items-center gap-3 shrink-0 z-10 relative">
          <div className="relative flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 p-0.5 w-24 h-7">
            {/* Sliding Background */}
            <div
              className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] bg-white dark:bg-zinc-800 rounded-sm shadow-xs transition-transform duration-800 [transition-timing-function:cubic-bezier(0.25,1.15,0.5,1)] ${
                activeLang === "th" ? "translate-x-0" : "translate-x-full"
              }`}
            />
            
            <Link
              href={lang === "th" ? getLanguageLink("en") : getLanguageLink("th")}
              onClick={(e) => handleLanguageChange(e, "th")}
              className={`relative z-10 w-1/2 text-center text-xs font-semibold py-1 transition-colors duration-300 ${
                activeLang === "th"
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              TH
            </Link>
            <Link
              href={lang === "en" ? getLanguageLink("th") : getLanguageLink("en")}
              onClick={(e) => handleLanguageChange(e, "en")}
              className={`relative z-10 w-1/2 text-center text-xs font-semibold py-1 transition-colors duration-300 ${
                activeLang === "en"
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              EN
            </Link>
          </div>
          
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative flex items-center justify-center rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer w-9 h-9 overflow-hidden"
          >
            <div className="relative h-5 w-5">
              <div
                className={`absolute inset-0 transform ${
                  shouldAnimate ? "transition-all duration-500 ease-out" : ""
                } ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0"
                }`}
              >
                <svg
                  className="h-5 w-5 text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div>
              <div
                className={`absolute inset-0 transform ${
                  shouldAnimate ? "transition-all duration-500 ease-out" : ""
                } ${
                  theme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              >
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Center Grid: Guaranteeing the Logo stays in the absolute center of the page */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
          {/* Left Links Column (aligned right to maintain dynamic gap to logo) */}
          <div className="flex-1 flex justify-end pr-8 xl:pr-[60px] pointer-events-auto">
            <ul className="flex items-center gap-4 xl:gap-8 text-sm">
              {links.slice(0, 3).map((l) => {
                const isPeople = l.href === `/${lang}/people`;
                if (isPeople) {
                  return (
                    <li
                      key={l.href}
                      className="relative py-2"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="flex items-center gap-1 cursor-default select-none">
                        {l.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                      
                      {/* Dropdown Menu with fade-in and smooth transition */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 top-full pt-1.5 z-50 w-36 transition-all duration-200 ${
                          isDropdownOpen 
                            ? "opacity-100 translate-y-0 visible pointer-events-auto" 
                            : "opacity-0 -translate-y-1 invisible pointer-events-none"
                        }`}
                      >
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-xl py-1">
                          <Link
                            href={`/${lang}/people/teachers`}
                            className="block px-4 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          >
                            {dict.people.teachers}
                          </Link>
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                          <div className="px-4 py-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            {dict.people.students}
                          </div>
                          {cohorts.map((c) => (
                            <Link
                              key={c}
                              href={`/${lang}/people/students/${c}`}
                              className="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                              {c}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Center Logo Column (always perfectly centered) */}
          <div className="flex-initial pointer-events-auto">
            <Link href={`/${lang}`} className="flex items-center gap-1.5 font-bold text-lg shrink-0">
              <img src="/ce_logo.webp" alt="CE Logo" className="h-11 w-11 object-contain" />
              <span>COM EN</span>
            </Link>
          </div>

          {/* Right Links Column (aligned left to maintain dynamic gap to logo) */}
          <div className="flex-1 flex justify-start pl-8 xl:pl-[60px] pointer-events-auto">
            <ul className="flex items-center gap-4 xl:gap-8 text-sm">
              {links.slice(3).map((l) => {
                const isSchedule = l.href === `/${lang}/schedule`;
                if (isSchedule) {
                  return (
                    <li
                      key={l.href}
                      className="relative py-2"
                      onMouseEnter={handleScheduleMouseEnter}
                      onMouseLeave={handleScheduleMouseLeave}
                    >
                      <span className="flex items-center gap-1 cursor-default select-none">
                        {l.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isScheduleDropdownOpen ? "rotate-180" : ""
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>

                      {/* Dropdown Menu with fade-in and smooth transition */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 top-full pt-1.5 z-50 w-36 transition-all duration-200 ${
                          isScheduleDropdownOpen 
                            ? "opacity-100 translate-y-0 visible pointer-events-auto" 
                            : "opacity-0 -translate-y-1 invisible pointer-events-none"
                        }`}
                      >
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-xl py-1">
                          <Link
                            href={`/${lang}/schedule?type=class`}
                            className="block px-4 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          >
                            {lang === "th" ? "ตารางเรียน" : "Class"}
                          </Link>
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                          <Link
                            href={`/${lang}/schedule?type=exam`}
                            className="block px-4 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          >
                            {lang === "th" ? "ตารางสอบ" : "Exam"}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right Section: Login / Logout Button */}
        <div className="ml-auto flex items-center shrink-0 z-10 relative">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm font-semibold hover:underline bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-950/60 dark:text-red-400 w-[110px] h-9 flex items-center justify-center rounded-md transition-all duration-300 shrink-0 cursor-pointer"
            >
              {lang === "th" ? "ออกจากระบบ" : "Logout"}
            </button>
          ) : (
            <Link
              href={`/${lang}/admin/login`}
              className="text-sm font-semibold hover:underline bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 w-[110px] h-9 flex items-center justify-center rounded-md transition-all duration-300 shrink-0"
            >
              {lang === "th" ? "เข้าสู่ระบบ" : "Login"}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}


