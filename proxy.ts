import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["th", "en"] as const;
const defaultLocale = "th";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Language redirection logic
  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  );

  if (!hasLocale) {
    const lang = request.cookies.get("lang")?.value ?? defaultLocale;
    request.nextUrl.pathname = `/${lang}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // 2. Admin page protection
  const segments = pathname.split("/"); // ["", "th", "admin", "news"]
  if (segments.length >= 3 && segments[2] === "admin") {
    const subPage = segments[3];
    // Allow login and register pages to bypass authentication
    if (subPage !== "login" && subPage !== "register") {
      const token = request.cookies.get("admin_token")?.value;
      if (!token) {
        // No token, redirect to login page
        const lang = segments[1] || defaultLocale;
        const loginUrl = new URL(`/${lang}/admin/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
