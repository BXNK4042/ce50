import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {dict.home.title}
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        {dict.home.subtitle}
      </p>
    </section>
  );
}
