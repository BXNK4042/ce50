import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import PeopleSlider from "@/components/layout/people-slider";
import { HomeHero } from "@/components/home/home-hero";
import { HomeNewsFeatured } from "@/components/home/home-news-featured";
import { api } from "@/lib/api";
import type { Teacher } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const isTh = lang === "th";

  let news: any[] = [];
  try {
    news = await api.news();
  } catch (e) {
    console.error("Failed to fetch homepage news:", e);
  }
  let teachers: Teacher[] = [];
  try {
    teachers = await api.teachers();
  } catch (e) {
    console.error("Failed to fetch homepage teachers:", e);
  }
  let cohorts: string[] = [];
  try {
    cohorts = await api.cohorts();
  } catch (e) {
    console.error("Failed to fetch homepage cohorts:", e);
  }

  const featured = news.slice(0, 3);

  return (
    <>
      <HomeHero title={dict.home.title} />
      <HomeNewsFeatured newsTitle={dict.home.news} featured={featured} isTh={isTh} />

      <div className="relative w-full bg-background px-12 md:px-16 py-12 md:py-16 flex flex-col gap-6">
        <PeopleSlider lang={lang} title={dict.home.people} people={teachers} cohorts={cohorts} />
      </div>
    </>
  );
}
