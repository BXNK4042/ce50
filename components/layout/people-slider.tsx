"use client";

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
];

export default function PeopleSlider({ lang }: PeopleSliderProps) {
  // Duplicate list to create a seamless infinite loop marquee
  const marqueeItems = [...people, ...people];

  return (
    <div className="w-full overflow-hidden py-4 relative group">
      {/* Side gradients to smoothly fade out edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
        {marqueeItems.map((person, idx) => (
          <div
            key={idx}
            className="w-[280px] shrink-0 h-[420px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:scale-[1.03] transition-transform duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 cursor-pointer select-none flex flex-col group/card"
          >
            {/* Portrait Image */}
            <div className="h-[260px] w-full overflow-hidden relative">
              <img
                src={person.image}
                alt={lang === "th" ? person.nameTh : person.nameEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="p-5 flex flex-col justify-between flex-1 text-left">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-zinc-950 text-blue-600 dark:text-zinc-400 rounded-md border border-blue-100 dark:border-zinc-800 uppercase tracking-wider">
                  {lang === "th" ? person.roleTh : person.roleEn}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2 group-hover/card:text-blue-600 dark:group-hover/card:text-sky-300 transition-colors line-clamp-1">
                  {lang === "th" ? person.nameTh : person.nameEn}
                </h3>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 border-t border-zinc-100 dark:border-zinc-900 pt-3 flex items-center justify-between">
                <span className="truncate">{person.email}</span>
                <span className="group-hover/card:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
