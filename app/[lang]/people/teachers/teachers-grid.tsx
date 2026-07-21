"use client";

import { useState } from "react";
import { Teacher } from "@/lib/types";

interface TeachersGridProps {
  teachers: Teacher[];
  lang: string;
}

export default function TeachersGrid({ teachers, lang }: TeachersGridProps) {
  const isTh = lang === "th";
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);

  // Rattikorn Card Flip States
  const [rotationY, setRotationY] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedResult, setFlippedResult] = useState<"front" | "back" | null>(null);

  const handleRattikornClick = () => {
    setActiveOverlayId(2);
    setRotationY(0);
    setIsFlipping(true);
    setFlippedResult(null);
    
    setTimeout(() => {
      const landOnFront = Math.random() < 0.5;
      const targetRotation = landOnFront ? 1440 : 1620;
      setRotationY(targetRotation);
      
      setTimeout(() => {
        setIsFlipping(false);
        setFlippedResult(landOnFront ? "front" : "back");
      }, 1200);
    }, 100);
  };

  const spinRattikornCard = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isFlipping) return;
    
    setIsFlipping(true);
    setFlippedResult(null);
    
    const landOnFront = Math.random() < 0.5;
    const baseExtra = 1440;
    let targetRotation = rotationY + baseExtra;
    
    if (landOnFront) {
      targetRotation = Math.ceil(targetRotation / 360) * 360;
    } else {
      targetRotation = Math.ceil((targetRotation - 180) / 360) * 360 + 180;
    }
    
    setRotationY(targetRotation);
    
    setTimeout(() => {
      setIsFlipping(false);
      setFlippedResult(landOnFront ? "front" : "back");
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-none">
      {teachers.map((teacher) => {
        const name = isTh ? teacher.name_th : (teacher.name_en || teacher.name_th);
        const initials = teacher.name_en
          ? teacher.name_en
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : name.slice(0, 2);

        const isAthasart = teacher.id === 1;
        const isRattikorn = teacher.id === 2;
        const isOverlayActive = activeOverlayId === teacher.id;

        return (
          <div
            key={teacher.id}
            className="relative group w-full h-[300px]"
            onClick={() => {
              if (isAthasart) {
                setActiveOverlayId(teacher.id);
              } else if (isRattikorn) {
                handleRattikornClick();
              }
            }}
          >
            {/* Actual Card Container (with overflow-hidden) */}
            <div
              className={`w-full h-full border border-zinc-200 dark:border-zinc-800 overflow-hidden isolate will-change-transform transition-all duration-500 hover:shadow-lg cursor-pointer select-none flex flex-col justify-end relative bg-gradient-to-b from-[#a7c7f2] to-[#2b5c9e] ${
                isAthasart
                  ? "hover:from-[#fbc6a9] hover:to-[#e06e30] hover:shadow-orange-500/20"
                  : isRattikorn
                  ? "hover:from-[#d8b4fe] hover:to-[#7c3aed] hover:shadow-purple-500/20"
                  : "hover:shadow-blue-500/20"
              }`}
            >
              {/* Dark Theme Background Overlay (Cross-fades smoothly on theme changes) */}
              <div
                className={`absolute inset-0 bg-gradient-to-b from-[#3b7cd4] to-[#12294a] opacity-0 dark:opacity-100 transition-all duration-500 z-0 pointer-events-none ${
                  isAthasart
                    ? "group-hover:from-[#ff7b30] group-hover:to-[#9c3100]"
                    : isRattikorn
                    ? "group-hover:from-[#a855f7] group-hover:to-[#4c1d95]"
                    : ""
                }`}
              />

              {/* CE04 logo in the top-left corner */}
              <img
                src="/ce_logo.webp?v=8"
                alt="CE Logo"
                className={`absolute top-4 left-4 w-[35%] max-w-[180px] min-w-[80px] h-auto z-20 object-contain pointer-events-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] contrast-[1.15] brightness-[1.05] opacity-25 transition-opacity duration-500 ${
                  teacher.id === 6 ? "group-hover:opacity-0" : ""
                }`}
              />

              {/* Full Background Portrait Image */}
              {teacher.photo ? (
                <div className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden">
                  <img
                    src={`${teacher.photo}?v=8`}
                    alt={name}
                    className={`absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom translate-x-[15%] z-10 transition-opacity duration-500 ease-in-out ${
                      [3, 4, 5].includes(teacher.id) ? "group-hover:opacity-0" : ""
                    }`}
                  />
                  {teacher.id === 3 && (
                    <img
                      src="/professors/pisakorn-alt.webp?v=8"
                      alt={`${name} alternative`}
                      className="absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom translate-x-[15%] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    />
                  )}
                  {teacher.id === 4 && (
                    <img
                      src="/professors/silar-alt.webp?v=8"
                      alt={`${name} alternative`}
                      className="absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom translate-x-[15%] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    />
                  )}
                  {teacher.id === 5 && (
                    <img
                      src="/professors/sakawkarn-alt.webp?v=8"
                      alt={`${name} alternative`}
                      className="absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom translate-x-[15%] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    />
                  )}
                  {teacher.id === 6 && (
                    <img
                      src="/backgrounds/niyomcha.webp?v=8"
                      alt="Niyomcha background"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                    />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold z-10">
                  {initials}
                </div>
              )}

              {/* Profile Info - Floated at the bottom-left */}
              <div className={`p-6 flex flex-col gap-3 z-20 text-left w-full transition-transform duration-500 ease-in-out ${
                teacher.id === 6 
                  ? "group-hover:-translate-y-[124px]" 
                  : ""
              }`}>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 backdrop-blur-md text-white rounded-md border border-white/20 uppercase tracking-wider select-none transition-all duration-500 ${
                    teacher.id === 6 ? "group-hover:text-black group-hover:bg-black/10 group-hover:border-black/20" : ""
                  }`}>
                    {teacher.id === 6 ? (
                      <>
                        <span className="group-hover:hidden">
                          {isTh ? "นักวิชาการคอมพิวเตอร์" : "Computer Technical Officer"}
                        </span>
                        <span className="hidden group-hover:inline">
                          {isTh ? 'ผู้บริหารร้าน "นิยมชา"' : 'Executive of "Niyomcha"'}
                        </span>
                      </>
                    ) : (
                      isTh ? "อาจารย์ประจำสาขา" : "Faculty Member"
                    )}
                  </span>
                  <h3 className={`text-lg font-bold text-white mt-2 transition-colors line-clamp-1 ${
                    teacher.id === 6 ? "group-hover:text-black" : "group-hover:text-sky-300"
                  }`}>
                    {name}
                  </h3>
                  {teacher.advise_years && teacher.advise_years.length > 0 && (
                    <p className={`text-xs text-white/60 mt-1 font-medium transition-all duration-500 ${
                      teacher.id === 6 ? "group-hover:opacity-0 group-hover:pointer-events-none" : ""
                    }`}>
                      {isTh ? "ชั้นปีที่ดูแล: " : "Advise: "}
                      {teacher.advise_years.map((y: string) => `${isTh ? "ปี " : "Year "}${y}`).join(", ")}
                    </p>
                  )}
                </div>
                {teacher.contact && (
                  <div className={`text-xs text-white/70 mt-1 border-t border-white/10 pt-3 flex items-center justify-between transition-all duration-500 ${
                    teacher.id === 6 ? "group-hover:opacity-0 group-hover:pointer-events-none group-hover:border-transparent" : ""
                  }`}>
                    <span className="truncate">{teacher.contact}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                )}
              </div>
            </div>

            {/* Viewport Overlay for Athasart (outside overflow-hidden) */}
            {isAthasart && teacher.photo && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveOverlayId(null);
                }}
                className={`fixed inset-0 bg-black/75 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500 z-[9999] ${
                  isOverlayActive
                    ? "opacity-100 pointer-events-auto cursor-pointer"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="flex flex-col items-center justify-center max-h-screen p-4 text-center">
                  <div
                    className={`relative h-[65vh] aspect-[350/263] transition-all duration-1000 ease-out transform ${
                      isOverlayActive ? "scale-100 rotate-[-1080deg]" : "scale-0 rotate-0"
                    }`}
                  >
                    <img
                      src={`${teacher.photo}?v=8`}
                      alt={name}
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(245,148,92,0.4)] pointer-events-none"
                    />
                    
                    {/* Left Eye Red Glow */}
                    <div
                      className={`absolute top-[28.5%] left-[45.2%] w-[1.5%] h-[1.5%] bg-red-500 rounded-full shadow-[0_0_12px_6px_#ff0000,0_0_24px_12px_#ff0000] opacity-0 scale-0 transition-all ease-out ${
                        isOverlayActive
                          ? "opacity-100 scale-100 delay-[1000ms] duration-500"
                          : "opacity-0 scale-0 duration-300"
                      }`}
                    />

                    {/* Right Eye Red Glow */}
                    <div
                      className={`absolute top-[28.5%] left-[54.8%] w-[1.5%] h-[1.5%] bg-red-500 rounded-full shadow-[0_0_12px_6px_#ff0000,0_0_24px_12px_#ff0000] opacity-0 scale-0 transition-all ease-out ${
                        isOverlayActive
                          ? "opacity-100 scale-100 delay-[1000ms] duration-500"
                          : "opacity-0 scale-0 duration-300"
                      }`}
                    />
                  </div>

                  <h2
                    className={`text-2xl md:text-4xl font-extrabold text-white mt-8 tracking-wider drop-shadow-[0_4px_12px_rgba(245,148,92,0.6)] transition-all duration-700 delay-300 ease-out transform ${
                      isOverlayActive ? "scale-100" : "scale-0"
                    }`}
                  >
                    {isTh ? "ประธานสาขาวิศวกรรมคอมพิวเตอร์" : "Head of Computer Engineering Department"}
                  </h2>
                </div>
              </div>
            )}

            {/* Viewport Overlay for Rattikorn (outside overflow-hidden) */}
            {isRattikorn && teacher.photo && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveOverlayId(null);
                }}
                className={`fixed inset-0 bg-black/85 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500 z-[9999] ${
                  isOverlayActive
                    ? "opacity-100 pointer-events-auto cursor-pointer"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="flex flex-col items-center justify-center max-h-screen p-4 text-center max-w-lg w-full">
                  
                  {/* Card perspective container */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      spinRattikornCard();
                    }}
                    className={`relative h-[50vh] max-h-[360px] min-h-[260px] aspect-[2/3] perspective-1000 cursor-pointer select-none transition-all duration-700 ease-out transform ${
                      isOverlayActive ? "scale-100" : "scale-0"
                    }`}
                  >
                    {/* Inner spinning card */}
                    <div
                      className="w-full h-full preserve-3d relative rounded-2xl shadow-[0_20px_50px_rgba(168,85,247,0.3)] transition-transform duration-[1200ms]"
                      style={{
                        transform: `rotateY(${rotationY}deg)`,
                        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.2)"
                      }}
                    >
                      {/* FRONT FACE (อาจารย์rattikorn) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border-[3px] border-amber-400 bg-gradient-to-b from-[#1b3b6f] to-[#091e3a] p-3 flex flex-col justify-between overflow-hidden shadow-inner">
                        {/* Foil shining effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none z-30" />
                        
                        {/* Header */}
                        <div className="flex justify-between items-center z-10 border-b border-amber-400/30 pb-1.5">
                          <span className="text-[9px] font-extrabold text-amber-300 tracking-wider">TEACHER • LEGENDARY</span>
                          <span className="text-xs">⭐</span>
                        </div>

                        {/* Portrait */}
                        <div className="relative flex-1 my-2 bg-slate-950/50 rounded-lg overflow-hidden border border-amber-400/20 flex items-center justify-center z-10">
                          <img
                            src={`${teacher.photo}?v=8`}
                            alt="อาจารย์rattikorn"
                            className="absolute bottom-0 w-[95%] h-auto object-contain object-bottom pointer-events-none"
                          />
                          {/* Stars */}
                          <div className="absolute top-1.5 right-1.5 bg-black/60 px-1 py-0.5 rounded text-[8px] text-amber-300 font-bold flex gap-0.5">
                            ★★★★★
                          </div>
                        </div>

                        {/* Title and stats */}
                        <div className="z-10 bg-black/40 backdrop-blur-xs p-2.5 rounded-lg border border-amber-400/20 text-left">
                          <h4 className="text-sm font-black text-amber-300 tracking-wide text-center">
                            อาจารย์rattikorn
                          </h4>
                          <p className="text-[9px] text-zinc-300 mt-0.5 line-clamp-2 text-center italic leading-tight">
                            "ผู้ควบคุมพลังคณิตศาสตร์แบบไม่ต่อเนื่องและโครงสร้างข้อมูล"
                          </p>
                          
                          {/* Mini Game Stats */}
                          <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-amber-400/20 text-[9px] text-zinc-300">
                            <div>⚡ ATK: <span className="font-bold text-amber-300">999</span></div>
                            <div>🛡️ DEF: <span className="font-bold text-amber-300">999</span></div>
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE (ป้าจุ๋ม) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border-[3px] border-purple-500 bg-gradient-to-b from-[#2e1065] to-[#0f052d] p-3 flex flex-col justify-between overflow-hidden shadow-inner transform rotate-y-180"
                           style={{ transform: "rotateY(180deg)" }}>
                        {/* Mystic violet shining effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-400/20 to-transparent -translate-x-full animate-shimmer pointer-events-none z-30" />
                        
                        {/* Header */}
                        <div className="flex justify-between items-center z-10 border-b border-purple-400/30 pb-1.5">
                          <span className="text-[9px] font-extrabold text-purple-300 tracking-wider">SECRET • GOD MODE</span>
                          <span className="text-xs">🔮</span>
                        </div>

                        {/* Portrait */}
                        <div className="relative flex-1 my-2 bg-slate-950/70 rounded-lg overflow-hidden border border-purple-500/30 flex items-center justify-center z-10">
                          <img
                            src="/professors/rattikorn-alt.webp?v=8"
                            alt="ป้าจุ๋ม"
                            className="absolute bottom-0 w-[95%] h-auto object-contain object-bottom pointer-events-none"
                          />
                        </div>

                        {/* Title and stats */}
                        <div className="z-10 bg-black/50 backdrop-blur-xs p-2.5 rounded-lg border border-purple-500/20 text-left">
                          <h4 className="text-sm font-black text-purple-300 tracking-wide text-center drop-shadow-[0_2px_4px_rgba(168,85,247,0.8)]">
                            ป้าจุ๋ม
                          </h4>
                          <p className="text-[9px] text-purple-200 mt-0.5 line-clamp-2 text-center italic leading-tight">
                            "สุดยอดผู้ปกครองฝ่ายวิชาการผู้มีอิทธิพลสูงสุดใน CE"
                          </p>
                          
                          {/* Mini Game Stats */}
                          <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-purple-500/20 text-[9px] text-purple-200">
                            <div>💥 DAMAGE: <span className="font-bold text-purple-300">MAX</span></div>
                            <div>💫 CHARM: <span className="font-bold text-purple-300">100%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls below card */}
                  <div className="mt-4 flex flex-col items-center gap-2.5 z-50">
                    <p className="text-[11px] text-white/60">
                      {isFlipping ? (
                        <span className="animate-pulse">กำลังสุ่มพลัง... 🌀</span>
                      ) : (
                        <span>คลิกที่การ์ดหรือปุ่มด้านล่างเพื่อสุ่มใหม่</span>
                      )}
                    </p>
                    
                    {flippedResult && (
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300 border uppercase tracking-wider animate-[bounce_1.5s_infinite] ${
                        flippedResult === "front" 
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                          : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      }`}>
                        การ์ดที่ออก: {flippedResult === "front" ? "อาจารย์rattikorn" : "ป้าจุ๋ม"}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={spinRattikornCard}
                        disabled={isFlipping}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors cursor-pointer select-none"
                      >
                        {isFlipping ? "กำลังสุ่ม..." : "สุ่มใหม่ (Flip)"}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveOverlayId(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer select-none"
                      >
                        ปิด (Close)
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
