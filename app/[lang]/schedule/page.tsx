import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import ScheduleClient from "./schedule-client";

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ type?: string; term?: string }>;
}) {
  const { lang } = await params;
  const { type, term } = (await searchParams) || {};
  const dict = await getDictionary(lang as Locale);

  return (
    <ScheduleClient
      lang={lang}
      dict={dict}
      type={type}
      term={term}
    />
  );
}
