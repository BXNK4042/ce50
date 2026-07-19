import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ThemeScript from "@/components/layout/theme-script";
import HomeBackgroundVideo from "@/components/layout/hero-video";

import { getDictionary, Locale } from "./dictionaries";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return [{ lang: "th" }, { lang: "en" }];
}

export const metadata: Metadata = {
  title: "WE ARE CE | Computer Engineering",
  description:
    "เว็บไซต์ประชาสัมพันธ์และสารสนเทศ WE ARE CE — Public information site for the Computer Engineering program.",
};

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "dark";

  const videoFileName = lang === "th" ? "Footage_CE04_remake.mp4" : "Footage_CE04.mp4";
  const videoSrc = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/Video/${videoFileName}`;

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <HomeBackgroundVideo src={videoSrc} />
        <Navbar lang={lang} dict={dict} initialTheme={theme as "light" | "dark"} />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
