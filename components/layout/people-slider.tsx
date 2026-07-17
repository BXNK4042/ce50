"use client";

import { useState, useEffect } from "react";

interface PeopleSliderProps {
  lang: string;
  title: string;
}

const people = [
  {
    nameTh: "อาจารย์อรรถศาสตร์ นาคเทวัญ",
    nameEn: "Athasart Narkthewan",
    roleTh: "หัวหน้าสาขาวิชา",
    roleEn: "Head of Program",
    email: "athasart.n@ce.ac.th",
    image: "/image/athasart.webp",
  },
  {
    nameTh: "ดร.รัตติกร สมบัติแก้ว",
    nameEn: "Rattikorn Sombutkaew",
    roleTh: "รองหัวหน้าสาขาวิชา",
    roleEn: "Deputy Head of Program",
    email: "rattikorn.s@ce.ac.th",
    image: "/image/rattikorn.webp",
  },
  {
    nameTh: "อาจารย์นภัสรพี สิทธิวัจน์",
    nameEn: "Pisakorn Sittiwatjana",
    roleTh: "อาจารย์ประจำสาขา",
    roleEn: "Lecturer",
    email: "pisakorn.s@ce.ac.th",
    image: "/image/pisakorn.webp",
  },
  {
    nameTh: "ว่าที่ร้อยตรี ศิลา ศิริมาสกุล",
    nameEn: "Silar Sirimasakul",
    roleTh: "ผู้ช่วยศาสตราจารย์",
    roleEn: "Assistant Professor",
    email: "silar.s@ce.ac.th",
    image: "/image/silar.webp",
  },
  {
    nameTh: "อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช",
    nameEn: "Sakawkarn Piyawitwanich",
    roleTh: "อาจารย์และนักวิจัย",
    roleEn: "Lecturer & Researcher",
    email: "sakawkarn.p@ce.ac.th",
    image: "/image/sakawkarn.webp",
  },
];

export default function PeopleSlider({ lang, title }: PeopleSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const maxIndex = people.length; // 5

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (currentIndex === 0) {
      // Snap instantly to the duplicate index at the end
      setTransitionEnabled(false);
      setCurrentIndex(maxIndex);

      // Slide smoothly to the previous real index (maxIndex - 1 = 4) in the next frame
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
      // Snap instantly back to start (index 0)
      setTransitionEnabled(false);
      setCurrentIndex(0);
    }
  };

  // Auto scroll every 10 seconds (resets whenever currentIndex or visibleCount changes)
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(timer);
  }, [currentIndex, visibleCount, isTransitioning]);

  const getTranslateX = () => {
    if (visibleCount === 1) {
      return `translateX(calc(-${currentIndex} * (100% + 24px)))`;
    }
    if (visibleCount === 2) {
      return `translateX(calc(-${currentIndex} * (50% + 12px)))`;
    }
    return `translateX(calc(-${currentIndex} * (25% + 6px)))`;
  };

  // Duplicate items at the end of the array to create a seamless looping effect
  const duplicatedPeople = [...people, ...people.slice(0, visibleCount)];

  return (
    <div className="w-full flex flex-col gap-6 min-h-0">
      {/* Slider Header: Title + Navigation buttons */}
      <div className="flex items-center justify-between select-none">
        <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {/* Arrow Navigation Controls */}
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
          {duplicatedPeople.map((person, idx) => (
            <div
              key={idx}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 h-[420px] bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40 cursor-pointer select-none flex flex-col justify-end relative group"
            >
              {/* Full Background Portrait Image */}
              <img
                src={`${person.image}?v=6`}
                alt={lang === "th" ? person.nameTh : person.nameEn}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
              />
              {/* Vignette Overlay (cinematic darkened edges) */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.85)_100%)] z-10 pointer-events-none" />
              {/* Premium Dark Gradient Overlay at the bottom for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

              {/* Profile Info - Floated at the bottom-left */}
              <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 backdrop-blur-md text-white rounded-md border border-white/20 uppercase tracking-wider select-none">
                    {lang === "th" ? person.roleTh : person.roleEn}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 group-hover:text-sky-300 transition-colors line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
                    {lang === "th" ? person.nameTh : person.nameEn}
                  </h3>
                </div>
                <div className="text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{person.email}</span>
                  <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
