import { NextResponse } from "next/server";
import {
  LOCALE_COOKIE_NAME,
  isAppLocale,
  type AppLocale
} from "@/i18n/locales";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Same-origin relative path only (preserves query, blocks open redirects).
 */
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!localeParam || !isAppLocale(localeParam)) {
    return NextResponse.redirect(new URL(next, url.origin), 303);
  }

  const locale: AppLocale = localeParam;
  const response = NextResponse.redirect(new URL(next, url.origin), 303);
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
