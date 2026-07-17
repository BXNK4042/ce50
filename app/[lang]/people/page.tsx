import { getDictionary, Locale } from "@/app/[lang]/dictionaries";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="mx-auto max-w-5xl px-12 md:px-16 py-12 md:py-16">
      <h1 className="text-3xl font-semibold">{dict.people.title}</h1>
      <p className="mt-2 text-zinc-500">{dict.people.subtitle}</p>
    </section>
  );
}
