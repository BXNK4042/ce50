"use client";

import { useState, useEffect } from "react";
import type { Teacher } from "@/lib/types";
import StudentCohortDropdown from "./student-cohort-dropdown";

interface PeopleSliderProps {
  lang: string;
  title: string;
  people: Teacher[];
  cohorts?: string[];
}

export default function PeopleSlider({ lang, title, people, cohorts = [] }: PeopleSliderProps) {
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

  const maxIndex = people.length;

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

  const duplicatedPeople = [...people, ...people.slice(0, visibleCount)];

  if (people.length === 0) {
    return (
      <div className="w-full flex flex-col gap-6 min-h-0">
        <div className="flex items-center justify-between select-none">
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <StudentCohortDropdown cohorts={cohorts} lang={lang} />
        </div>
        <div className="flex items-center justify-center bg-white/50 dark:bg-black/30 border border-dashed border-blue-200 dark:border-zinc-800 rounded-xl p-12 text-zinc-500 dark:text-zinc-400">
          {lang === "th" ? "ไม่พบข้อมูลคณาจารย์" : "No faculty records found."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 min-h-0">
      {/* Slider Header: Title + Student Cohort Dropdown + Navigation buttons */}
      <div className="flex items-center justify-between select-none">
        <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <StudentCohortDropdown cohorts={cohorts} lang={lang} />

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
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 h-[420px] bg-gradient-to-b from-[#a7c7f2] to-[#2b5c9e] dark:from-[#ff7b30] dark:to-[#9c3100] border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-black/40 cursor-pointer select-none flex flex-col justify-end relative group"
            >
              {/* Full Background Portrait Image */}
              {person.photo && (
                <img
                  src={person.photo}
                  alt={lang === "th" ? person.name_th : (person.name_en ?? person.name_th)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                />
              )}
              {/* Premium Dark Gradient Overlay at the bottom for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

              {/* Profile Info - Floated at the bottom-left */}
              <div className="p-6 flex flex-col gap-3 z-20 text-left w-full">
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
                  {lang === "th" ? person.name_th : (person.name_en ?? person.name_th)}
                </h3>
                {person.contact && (
                  <div className="text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{person.contact}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
