import { getDictionary, Locale } from "@/app/[lang]/dictionaries";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold">{dict.people.students}</h1>
    </section>
  );
}
