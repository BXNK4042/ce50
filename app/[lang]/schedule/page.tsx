import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import ScheduleClient from "./schedule-client";

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ type?: string; term?: string; year?: string }>;
}) {
  const { lang } = await params;
  const { type, term, year } = (await searchParams) || {};
  const dict = await getDictionary(lang as Locale);

  const parsedYear = year ? parseInt(year, 10) : 3;
  const initialYear = isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4 ? 3 : parsedYear;

  return (
    <ScheduleClient
      lang={lang}
      dict={dict}
      type={type}
      term={term}
      initialYear={initialYear}
    />
  );
}
