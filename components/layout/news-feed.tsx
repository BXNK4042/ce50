"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id?: number;
  title: string;
  category: "competition" | "scholarship" | "other" | string;
  body?: string;
  link?: string;
  published_at?: string;
}

interface NewsFeedProps {
  lang: string;
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

export default function NewsFeed({ lang }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const isTh = lang === "th";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${backendUrl}/news`);
        if (res.ok) {
          const data: NewsItem[] = await res.json();
          if (data && data.length > 0) {
            const filtered = data.filter(item => item.category === "scholarship" || item.category === "competition");
            setNews(filtered.slice(0, 6));
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
      // Fallback to mock data (filtered by scholarship/competition) if empty or failed
      const filteredMock = mockNews.filter(item => item.category === "scholarship" || item.category === "competition");
      setNews(filteredMock.slice(0, 6));
    };

    fetchNews();
  }, []);

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
          classes: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
        };
      case "scholarship":
        return {
          label: isTh ? "ทุนการศึกษา" : "Scholarship",
          classes: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
        };
      default:
        return {
          label: isTh ? "ข่าวประชาสัมพันธ์" : "Announcement",
          classes: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 border border-blue-300 dark:border-blue-800"
        };
    }
  };

  const getSmallCategoryDetails = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "competition":
        return {
          label: isTh ? "การแข่งขัน" : "Competition",
          classes: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md"
        };
      case "scholarship":
        return {
          label: isTh ? "ทุนการศึกษา" : "Scholarship",
          classes: "bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md"
        };
      default:
        return {
          label: isTh ? "ข่าวประชาสัมพันธ์" : "Announcement",
          classes: "bg-sky-500/20 text-sky-300 border border-sky-500/30 backdrop-blur-md"
        };
    }
  };

  if (news.length === 0) return null;

  const featuredNews = news[0];
  const smallNewsItems = news.slice(1, 5); // next 4 items
  const featuredCat = getCategoryDetails(featuredNews.category);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 py-6">
      {/* 1. Left Column: Featured News (Large) */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4">
        {/* Title & Category & Date */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${featuredCat.classes}`}>
              {featuredCat.label}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {formatDate(featuredNews.published_at)}
            </span>
          </div>
          {featuredNews.link ? (
            <a
              href={featuredNews.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-block"
            >
              <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                {featuredNews.title}
              </h3>
            </a>
          ) : (
            <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white leading-tight">
              {featuredNews.title}
            </h3>
          )}
        </div>

        {/* Large Image */}
        <div className="w-full aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative group">
          <img
            src="/image/news_placeholder.jpg?v=2"
            alt={featuredNews.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20 group-hover:bg-transparent transition-all duration-300" />
        </div>

        {/* Details */}
        {featuredNews.body && (
          <div className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
            <p>{featuredNews.body}</p>
          </div>
        )}

        {/* Read more */}
        {featuredNews.link && (
          <div className="mt-2">
            <a
              href={featuredNews.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 transition-colors"
            >
              {isTh ? "อ่านเพิ่มเติม" : "Read More"}
              <span className="text-base">→</span>
            </a>
          </div>
        )}
      </div>

      {/* 2. Right Column: 2x2 Grid of Small News Items */}
      <div className="w-full lg:w-5/12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {smallNewsItems.map((item, idx) => {
            const cat = getSmallCategoryDetails(item.category);
            return (
              <div
                key={idx}
                className="relative w-full h-[320px] overflow-hidden border border-zinc-200 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40 hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer select-none group flex flex-col justify-end"
                onClick={() => {
                  if (item.link) window.open(item.link, "_blank");
                }}
              >
                {/* Background image */}
                <img
                  src="/image/news_placeholder.jpg?v=2"
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                />

                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

                {/* News Info - Floated on top of the image */}
                <div className="p-4 flex flex-col gap-2 z-20 text-left w-full">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-[9px] text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    <span className={`px-2 py-0.5 font-semibold rounded-full uppercase tracking-wider ${cat.classes}`}>
                      {cat.label}
                    </span>
                    <span className="text-[10px]">{formatDate(item.published_at)}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white leading-snug group-hover:text-sky-300 transition-colors line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
                    {item.title}
                  </h4>

                  {/* Body Snippet */}
                  {item.body && (
                    <p className="text-white/70 text-[10px] line-clamp-2 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {item.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
