import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import InternshipSlider from "@/components/internship/internship-slider";

export default async function InternshipPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const titleText = dict.internship.title;

  const renderTitle = (title: string) => {
    if (title.includes("CE")) {
      const parts = title.split("CE");
      return (
        <>
          {parts[0]}
          <span className="text-blue-600 dark:text-sky-500">CE</span>
          {parts[1]}
        </>
      );
    }
    return title;
  };

  return (
    <section className="w-full px-12 md:px-16 py-12 md:py-16">
      <div className="inline-flex flex-col items-start">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{renderTitle(titleText)}</h1>
        <div className="w-1/2 h-1 bg-blue-600 dark:bg-sky-500 mt-2.5 rounded-full" />
      </div>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">{dict.internship.subtitle}</p>
      
      {/* Student Internship Slider Carousel */}
      <InternshipSlider lang={lang} />
    </section>
  );
}
