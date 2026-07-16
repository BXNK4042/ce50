import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-32 flex flex-col items-center justify-center text-center">
        {/* Relative container for the logo and overlay text */}
        <div className="relative mb-10 h-[450px] w-[450px] flex items-center justify-center transition-transform duration-300 hover:scale-105 group select-none">
          <img
            src="/CE.webp"
            alt="CE Logo"
            className="h-full w-full object-contain"
          />
          {/* Overlaid Title */}
          <h1 className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold tracking-tight text-white whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
            {dict.home.title}
          </h1>
        </div>
      </section>

      {/* Spacer equal to the height of the home page screen, colored dark blue */}
      <div className="h-screen w-full bg-[#0a192f]" />
    </>
  );
}
