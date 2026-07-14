import Link from "next/link";

export default function Navbar({ lang }: { lang: string }) {
  const links: { href: string; label: string }[] = [
    { href: `/${lang}/people`, label: "People" },
    { href: `/${lang}/works`, label: "Works" },
    { href: `/${lang}/news`, label: "News" },
    { href: `/${lang}/schedule`, label: "Schedule" },
    { href: `/${lang}/rooms`, label: "Rooms" },
    { href: `/${lang}/internship`, label: "Internship" },
  ];
  const other = lang === "th" ? "en" : "th";
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={`/${lang}`} className="font-semibold">
          CE
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
