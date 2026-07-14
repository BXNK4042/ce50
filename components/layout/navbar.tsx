import Link from "next/link";
import { getDictionary, Locale } from "@/app/[lang]/dictionaries";

export default async function Navbar({ lang }: { lang: string }) {
  const dict = await getDictionary(lang as Locale);
  const links: { href: string; label: string }[] = [
    { href: `/${lang}/people`, label: dict.nav.people },
    { href: `/${lang}/works`, label: dict.nav.works },
    { href: `/${lang}/news`, label: dict.nav.news },
    { href: `/${lang}/schedule`, label: dict.nav.schedule },
    { href: `/${lang}/rooms`, label: dict.nav.rooms },
    { href: `/${lang}/internship`, label: dict.nav.internship },
  ];
  const other = lang === "th" ? "en" : "th";
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-semibold">
          <img src="/CE.webp" alt="CE Logo" className="h-8 w-8 object-contain" />
          <span>CE</span>
        </Link>
        <ul className="flex items-center gap-5 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={`/${other}`}
              className="rounded border border-black/10 px-2 py-1 dark:border-white/10"
            >
              {other.toUpperCase()}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

