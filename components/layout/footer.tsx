export default function Footer({ lang }: { lang: string }) {
  return (
    <footer className="border-t border-black/10 px-6 py-6 text-center text-sm text-zinc-500 dark:border-white/10">
      <p>
        {lang === "th"
          ? "สาขาวิศวกรรมคอมพิวเตอร์ · สงวนลิขสิทธิ์"
          : "Computer Engineering · All rights reserved"}
      </p>
    </footer>
  );
}
