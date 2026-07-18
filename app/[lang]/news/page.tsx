import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import Link from "next/link";
import NewsSlider from "@/components/layout/news-slider";
import NewsFeed from "@/components/layout/news-feed";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isTh = lang === "th";

  return (
    <section className="w-full px-12 md:px-16 py-12 md:py-16">
      <div className="flex flex-col gap-16">
        {/* Section 1: Original News Section */}
        <div className="flex flex-col gap-6">
          {/* Add News Button in the top right */}
          <div className="flex justify-end">
            <Link
              href={`/${lang}/news/writer`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#e55300] hover:bg-[#c94800] text-white text-sm font-semibold transition-all duration-300 rounded-none shadow-md cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isTh ? "เพิ่มข่าวสาร" : "Add News"}
            </Link>
          </div>

          <div>
            <NewsSlider lang={lang} title={dict.news.external} />
          </div>
        </div>

        {/* Section 2: Internal CE News (Vertical Feed) */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3.5 select-none">
            <span className="inline-block w-1.5 h-[0.9em] bg-blue-600 dark:bg-sky-500 rounded-full shrink-0" />
            <h2 className="text-3xl font-bold text-blue-950 dark:text-white tracking-tight">
              {dict.news.internal}
            </h2>
          </div>
          <NewsFeed lang={lang} archiveTitle={dict.news.archive} />
        </div>
      </div>
    </section>
  );
}
