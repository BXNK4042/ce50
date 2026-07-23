import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import NewsSlider from "@/components/layout/news-slider";
import NewsFeed from "@/components/layout/news-feed";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

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
