import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["th", "en"] as const;
const defaultLocale = "th";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  );

  if (hasLocale) return;

  const lang = request.cookies.get("lang")?.value ?? defaultLocale;
  request.nextUrl.pathname = `/${lang}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
