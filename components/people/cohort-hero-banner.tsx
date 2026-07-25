import { CohortHeroImage } from "@/app/[lang]/people/students/[cohort]/cohort-hero-image";
import type { CohortHeroData } from "@/lib/cohort";

interface CohortHeroBannerProps {
  cohortUpper: string;
  heroData: CohortHeroData;
  isTh: boolean;
}

export function CohortHeroBanner({ cohortUpper, heroData, isTh }: CohortHeroBannerProps) {
  return (
    <div className="relative h-[65vh] md:h-[85vh] w-full pb-12 md:pb-16 flex flex-col justify-between items-center transition-all duration-300 overflow-hidden bg-gradient-to-b from-blue-900 to-slate-950">
      <CohortHeroImage src={heroData.bgImage} alt={`${cohortUpper} Background`} />
      <div
        className="absolute inset-0 bg-black/35 dark:bg-black/55 z-10 transition-colors duration-300"
        style={{
          maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        }}
      />

      <div className="relative z-20 mx-auto max-w-7xl px-12 md:px-16 pt-8 w-full" />

      <div className="relative z-20 mx-auto max-w-7xl px-12 md:px-16 w-full text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
        <h1 className="text-4xl font-extrabold text-white tracking-tight select-none">
          {isTh ? heroData.titleTh : heroData.titleEn}
        </h1>
        <p className="mt-2 text-sky-400 dark:text-sky-300 text-3xl md:text-4xl font-extrabold select-none tracking-tight">
          {isTh ? heroData.subTitleTh : heroData.subTitleEn}
        </p>
      </div>
    </div>
  );
}
