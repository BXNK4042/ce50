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
        {/* Section 1: Internal CE News (Vertical Feed without archive) */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-3.5">
              <span className="inline-block w-1.5 h-[0.9em] bg-blue-600 dark:bg-sky-500 rounded-full shrink-0" />
              <h2 className="text-3xl font-bold text-blue-950 dark:text-white tracking-tight">
                {dict.news.internal}
              </h2>
            </div>
            {/* Add News Button in the top right */}
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
          <NewsFeed lang={lang} archiveTitle={dict.news.archive} excludeArchive={true} />
        </div>

        {/* Section 2: Original News Section (External News) */}
        <div className="flex flex-col gap-6">
          <div>
            <NewsSlider lang={lang} title={dict.news.external} />
          </div>
        </div>

        {/* Section 3: Internal CE News Archive (at the very bottom) */}
        <div className="flex flex-col gap-8">
          <NewsFeed lang={lang} archiveTitle={dict.news.archive} onlyArchive={true} />
        </div>
      </div>
    </section>
  );
}
