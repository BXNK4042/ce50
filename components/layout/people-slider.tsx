"use client";

import { useState, useEffect } from "react";

interface PeopleSliderProps {
  lang: string;
}

const people = [
  {
    nameTh: "ดร. สมชาย รักดี",
    nameEn: "Dr. Somchai Rakdee",
    roleTh: "หัวหน้าสาขาวิชา",
    roleEn: "Head of Program",
    email: "somchai.r@ce.ac.th",
    image: "/teacher_somchai.jpg",
  },
  {
    nameTh: "ผศ.ดร. อนงค์ แก้วงาม",
    nameEn: "Asst. Prof. Dr. Anong Kaewngam",
    roleTh: "รองหัวหน้าสาขาวิชา",
    roleEn: "Deputy Head of Program",
    email: "anong.k@ce.ac.th",
    image: "/teacher_anong.jpg",
  },
  {
    nameTh: "อ. ดนัย วิศวกรรม",
    nameEn: "Lect. Danai Witsawakam",
    roleTh: "อาจารย์ประจำสาขา",
    roleEn: "Lecturer",
    email: "danai.w@ce.ac.th",
    image: "/teacher_danai.jpg",
  },
  {
    nameTh: "ผศ. พิพัฒน์ ช่างคิด",
    nameEn: "Asst. Prof. Pipat Changkid",
    roleTh: "ผู้ช่วยศาสตราจารย์",
    roleEn: "Assistant Professor",
    email: "pipat.c@ce.ac.th",
    image: "/teacher_pipat.jpg",
  },
  {
    nameTh: "ดร. วรัญญา ปัญญาเลิศ",
    nameEn: "Dr. Waranya Panyalert",
    roleTh: "อาจารย์และนักวิจัย",
    roleEn: "Lecturer & Researcher",
    email: "waranya.p@ce.ac.th",
    image: "/teacher_waranya.jpg",
  },
  {
    nameTh: "ดร. พลวัต ดิจิทัล",
    nameEn: "Dr. Polawat Digital",
    roleTh: "อาจารย์ประจำสาขา",
    roleEn: "Lecturer",
    email: "polawat.d@ce.ac.th",
    image: "/teacher_polawat.jpg",
  },
];

export default function PeopleSlider({ lang }: PeopleSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

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

  const maxIndex = Math.max(0, people.length - visibleCount);

  // Keep currentIndex in bounds if visibleCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  // Auto scroll every 10 seconds
  useEffect(() => {
    if (maxIndex === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const getTranslateX = () => {
    if (visibleCount === 1) {
      // 1 visible card with 24px (gap-6) container gaps between items
      // When sliding by index, we shift by calc(index * (100% + 24px))
      return `translateX(-calc(${currentIndex} * (100% + 24px)))`;
    }
    if (visibleCount === 2) {
      // 2 visible cards, card width is calc(50% - 12px), gap is 24px.
      // Slide step = width + gap = 50% - 12px + 24px = 50% + 12px
      return `translateX(-calc(${currentIndex} * (50% + 12px)))`;
    }
    // 4 visible cards, card width is calc(25% - 18px), gap is 24px.
    // Slide step = width + gap = 25% - 18px + 24px = 25% + 6px
    return `translateX(-calc(${currentIndex} * (25% + 6px)))`;
  };

  return (
    <div className="w-full overflow-hidden py-4">
      <div
        className="flex gap-6 transition-transform duration-[3000ms] ease-in-out"
        style={{ transform: getTranslateX() }}
      >
        {people.map((person, idx) => (
          <div
            key={idx}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 h-[420px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:scale-[1.03] transition-all duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 cursor-pointer select-none flex flex-col group"
          >
            {/* Portrait Image */}
            <div className="h-[260px] w-full overflow-hidden relative">
              <img
                src={person.image}
                alt={lang === "th" ? person.nameTh : person.nameEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="p-5 flex flex-col justify-between flex-1 text-left">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-blue-550/10 text-blue-600 dark:text-zinc-400 rounded-md border border-blue-100 dark:border-zinc-800 uppercase tracking-wider">
                  {lang === "th" ? person.roleTh : person.roleEn}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors line-clamp-1">
                  {lang === "th" ? person.nameTh : person.nameEn}
                </h3>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 border-t border-zinc-100 dark:border-zinc-900 pt-3 flex items-center justify-between">
                <span className="truncate">{person.email}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
