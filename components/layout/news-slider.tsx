"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NewsItem {
  id?: number;
  title: string;
  category: "competition" | "scholarship" | "other" | string;
  body?: string;
  link?: string;
  image?: string;
  published_at?: string;
}

interface NewsSliderProps {
  lang: string;
  title: string;
}

const mockNews: NewsItem[] = [
  {
    title: "ทีมนักศึกษา CE คว้ารางวัลชนะเลิศระดับประเทศการแข่ง Hackathon 2026",
    category: "competition",
    body: "ทีมนักศึกษาชั้นปีที่ 3 และ 4 สาขาวิชาวิศวกรรมคอมพิวเตอร์ คว้ารางวัลชนะเลิศอันดับหนึ่งจากการแข่งขันพัฒนาซอฟต์แวร์นวัตกรรมและเทคโนโลยีระดับประเทศ Hackathon 2026 ณ ศูนย์การประชุมแห่งชาติสิริกิติ์",
    published_at: "2026-07-18 10:00:00"
  },
  {
    title: "เปิดรับสมัครทุนการศึกษาเรียนดีแต่ขาดแคลนทุนทรัพย์ ประจำภาคเรียนที่ 1/2569",
    category: "scholarship",
    body: "สาขาวิชาวิศวกรรมคอมพิวเตอร์เปิดรับสมัครขอรับทุนสนับสนุนการศึกษาสำหรับนักศึกษาที่มีผลการเรียนดีแต่ขาดแคลนทุนทรัพย์ ประจำปีการศึกษา 2569 โดยสามารถยื่นเอกสารได้ที่สำนักงานสาขาจนถึงสิ้นเดือนนี้",
    published_at: "2026-07-17 09:00:00"
  },
  {
    title: "ขอเชิญชวนศิษย์เก่าและนักศึกษาปัจจุบันร่วมงานสถาปนาครบรอบ 30 ปี วิศวกรรมคอมพิวเตอร์",
    category: "other",
    body: "ร่วมเฉลิมฉลองและสานสัมพันธ์เครือข่ายพี่น้องคอมพิวเตอร์ในงานครบรอบ 30 ปีการก่อตั้งสาขาวิชา พบกับกิจกรรมเสวนาวิชาการโดยศิษย์เก่าผู้ทรงคุณวุฒิ และงานเลี้ยงสังสรรค์ในภาคค่ำ",
    published_at: "2026-07-16 13:30:00"
  },
  {
    title: "CE04 เป็นตัวแทนประเทศไทยเข้าร่วมแข่งขันโอลิมปิกหุ่นยนต์ระดับนานาชาติ ณ ประเทศญี่ปุ่น",
    category: "competition",
    body: "ทีมนักศึกษา CE04 คว้ารางวัลเหรียญทองจากการคัดเลือกตัวแทนระดับประเทศ และได้รับสิทธิ์เดินทางไปเข้าร่วมประกวดนวัตกรรมหุ่นยนต์อัตโนมัติรอบชิงแชมป์โลก ณ เมืองโตเกียว ประเทศญี่ปุ่น",
    published_at: "2026-07-15 11:15:00"
  },
  {
    title: "ทุนสนับสนุนการวิจัยและฝึกงานต่างประเทศสำหรับนักศึกษาชั้นปีที่ 4 สนับสนุนโดยสมาคมศิษย์เก่า",
    category: "scholarship",
    body: "สมาคมศิษย์เก่าวิศวกรรมคอมพิวเตอร์ มอบทุนการศึกษาและตั๋วเครื่องบินสำหรับศึกษาดูงานและฝึกงานระยะสั้น ณ มหาวิทยาลัยคู่ความร่วมมือในต่างประเทศ สำหรับนักศึกษาที่มีผลการเรียนและทักษะภาษาอังกฤษดีเด่น",
    published_at: "2026-07-14 15:45:00"
  },
  {
    title: "การบรรยายพิเศษเรื่องความปลอดภัยไซเบอร์ (Cybersecurity) และบล็อกเชนในโลกยุคใหม่",
    category: "other",
    body: "ขอเชิญผู้สนใจเข้าร่วมฟังการสัมมนาจากกูรูผู้เชี่ยวชาญด้านความปลอดภัยทางไซเบอร์และบล็อกเชนระดับแนวหน้าของไทย เพื่อเตรียมพร้อมรับมือภัยคุกคามและการเปลี่ยนแปลงทางเทคโนโลยีในอนาคต",
    published_at: "2026-07-12 14:00:00"
  }
];

export default function NewsSlider({ lang, title }: NewsSliderProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isTh = lang === "th";

  // Check login status on mount
  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_role="))
      ?.split("=")[1];
    setIsLoggedIn(!!role);
  }, []);

  // Fetch news from DB
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${backendUrl}/news`);
        if (res.ok) {
          const data: NewsItem[] = await res.json();
          if (data && data.length > 0) {
            const filtered = data.filter(item => item.category === "other");
            setNews(filtered.slice(0, 6));
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
      // Fallback to mock data (filtered by 'other') if empty or failed
      const filteredMock = mockNews.filter(item => item.category === "other");
      setNews(filteredMock.slice(0, 6));
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = news.length;

  const handleNext = () => {
    if (isTransitioning || maxIndex <= visibleCount) return;
    setIsTransitioning(true);
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isTransitioning || maxIndex <= visibleCount) return;
    setIsTransitioning(true);
    if (currentIndex === 0) {
      setTransitionEnabled(false);
      setCurrentIndex(maxIndex);
      setTimeout(() => {
        setTransitionEnabled(true);
        setCurrentIndex(maxIndex - 1);
      }, 30);
    } else {
      setTransitionEnabled(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex >= maxIndex) {
      setTransitionEnabled(false);
      setCurrentIndex(0);
    }
  };

  // Auto scroll every 10 seconds
  useEffect(() => {
    if (maxIndex <= visibleCount) return;
    const timer = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(timer);
  }, [currentIndex, visibleCount, isTransitioning, news]);

  const getTranslateX = () => {
    if (visibleCount === 1) {
      return `translateX(calc(-${currentIndex} * (100% + 24px)))`;
    }
    if (visibleCount === 2) {
      return `translateX(calc(-${currentIndex} * (50% + 12px)))`;
    }
    return `translateX(calc(-${currentIndex} * (25% + 6px)))`;
  };

  // Create infinite loop list
  const duplicatedNews = maxIndex > visibleCount 
    ? [...news, ...news.slice(0, visibleCount)] 
    : news;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      if (isNaN(d.getTime())) return dateStr;
      
      const day = d.getDate();
      const monthTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      const monthEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (isTh) {
        return `${day} ${monthTh[d.getMonth()]} ${d.getFullYear() + 543}`;
      } else {
        return `${monthEn[d.getMonth()]} ${day}, ${d.getFullYear()}`;
      }
    } catch {
      return dateStr;
    }
  };

  const getCategoryDetails = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "competition":
        return {
          label: isTh ? "การแข่งขัน" : "Competition",
          classes: "bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
        };
      case "scholarship":
        return {
          label: isTh ? "ทุนการศึกษา" : "Scholarship",
          classes: "bg-purple-100/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
        };
      default:
        return {
          label: isTh ? "ข่าวประชาสัมพันธ์" : "Announcement",
          classes: "bg-blue-100/80 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30"
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 min-h-0">
      {/* Slider Header: Title + Navigation buttons */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-3.5">
          <span className="inline-block w-1.5 h-[0.9em] bg-blue-600 dark:bg-sky-500 rounded-full shrink-0" />
          <h2 className="text-3xl font-bold text-blue-950 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
        {/* Arrow Navigation Controls (only show if sliding is necessary) */}
        {maxIndex > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs cursor-pointer"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs cursor-pointer"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Cards Viewport Wrapper */}
      <div className="w-full overflow-hidden py-2 relative">
        <div
          className={`flex gap-6 ${
            transitionEnabled ? "transition-transform duration-500 ease-in-out" : "transition-none"
          }`}
          style={{ transform: getTranslateX() }}
          onTransitionEnd={handleTransitionEnd}
        >
          {duplicatedNews.map((item, idx) => {
            const catDetails = getCategoryDetails(item.category);
            return (
              <div
                key={idx}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 h-[420px] bg-zinc-950 dark:bg-black border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:border-zinc-700/80 cursor-pointer select-none relative group"
                onClick={(e) => {
                  const isEditClick = (e.target as HTMLElement).closest(".edit-btn");
                  if (isEditClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (item.link) window.open(item.link, "_blank");
                }}
              >
                {/* Background image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-0"
                  />
                )}

                {/* Edit News button (Admins/Writers only) */}
                {isLoggedIn && item.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${lang}/news/edit/${item.id}`);
                    }}
                    className="edit-btn absolute top-3 right-3 z-30 p-2 bg-black/60 hover:bg-[#e55300] text-white rounded-full border border-white/20 transition-all duration-200 cursor-pointer shadow-md hover:scale-110"
                    title={isTh ? "แก้ไขข่าวสาร" : "Edit News"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}

                {/* Premium Dark Gradient Overlay at the bottom for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

                {/* News Info - Floating Card */}
                <div className="absolute bottom-4 left-4 right-4 z-20 p-5 bg-zinc-950/85 dark:bg-black/90 backdrop-blur-md border border-zinc-800/80 rounded-xl flex flex-col gap-2.5 text-left transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-zinc-700/80 group-hover:shadow-xl group-hover:shadow-black/60">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider select-none ${catDetails.classes}`}>
                      {catDetails.label}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2.5 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {item.title}
                    </h3>
                  </div>
                  {item.body && (
                    <p className="text-white/70 text-xs line-clamp-3 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {item.body}
                    </p>
                  )}
                  <div className="text-[11px] text-white/50 mt-1 border-t border-white/10 pt-2.5 flex items-center justify-between">
                    <span>{formatDate(item.published_at)}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
