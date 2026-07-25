import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import InternshipSlider from "@/components/internship/internship-slider";
import { fetchInternshipStudents } from "@/lib/api";

export default async function InternshipPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const titleText = dict.internship.title;
  // ponytail: pre-fetch students on server side to avoid client rendering flash
  const students = await fetchInternshipStudents();

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
    <div className="min-h-screen bg-[#cad9f0]/40 dark:bg-[#0a192f]/40 transition-colors duration-300 py-12 md:py-16">
      <section className="mx-6 max-w-5xl px-12 md:px-16">
        <div className="inline-flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{renderTitle(titleText)}</h1>
          <div className="w-1/2 h-1 bg-blue-600 dark:bg-sky-500 mt-2.5 rounded-full" />
        </div>
        <p className="mt-4 mb-10 text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">{dict.internship.subtitle}</p>
        
        {/* ponytail: render student cards grid */}
        <InternshipSlider lang={lang} initialStudents={students} />
      </section>
    </div>
  );
}
