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

interface NewsGridProps {
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

export default function NewsGrid({ lang }: NewsGridProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const isTh = lang === "th";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${backendUrl}/news`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setNews(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
      setNews(mockNews);
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
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2">
      {news.map((item, idx) => {
        const catDetails = getCategoryDetails(item.category);
        return (
          <div
            key={idx}
            className="relative w-full h-[320px] bg-zinc-950 dark:bg-black border border-zinc-800/80 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40 hover:border-zinc-700 cursor-pointer select-none flex flex-col justify-end group"
            onClick={() => {
              if (item.link) window.open(item.link, "_blank");
            }}
          >
            {/* Premium Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

            {/* News Info */}
            <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
              <div>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${catDetails.classes}`}>
                  {catDetails.label}
                </span>
                <h3 className="text-lg font-bold text-white mt-3 group-hover:text-blue-400 dark:group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </div>
              {item.body && (
                <p className="text-white/70 text-xs line-clamp-3 leading-relaxed">
                  {item.body}
                </p>
              )}
              <div className="text-xs text-white/50 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                <span>{formatDate(item.published_at)}</span>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
