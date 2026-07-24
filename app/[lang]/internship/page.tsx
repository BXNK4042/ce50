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

  return (
    <section className="w-full px-12 md:px-16 py-12 md:py-16">
      <div className="inline-flex flex-col items-start">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{titleText}</h1>
      </div>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">{dict.internship.subtitle}</p>
      
      {/* Student Internship Slider Carousel */}
      <InternshipSlider lang={lang} />
    </section>
  );
}
