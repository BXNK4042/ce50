import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return (
    <section className="mx-auto max-w-5xl px-6 py-32 flex flex-col items-center justify-center text-center">
      <div className="mb-10">
        <img
          src="/CE.webp"
          alt="CE Logo"
          className="h-52 w-52 object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {dict.home.title}
      </h1>
      <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400">
        {dict.home.subtitle}
      </p>
    </section>
  );
}
