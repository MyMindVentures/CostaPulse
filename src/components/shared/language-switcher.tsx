"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ENABLED_LOCALES, type AppLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  currentLocale?: AppLocale;
  className?: string;
  label?: string;
};

/**
 * Sets NEXT_LOCALE via /api/locale and returns to the same path + query
 * (booking attribution and filters preserved).
 */
export function LanguageSwitcher({
  currentLocale = "en",
  className = "bk-lang-switch",
  label = "Language"
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const nextPath = query ? `${pathname}?${query}` : pathname;

  return (
    <nav className={cn(className)} aria-label={label}>
      {ENABLED_LOCALES.map((locale) => {
        const href = `/api/locale?locale=${locale}&next=${encodeURIComponent(nextPath)}`;
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            prefetch={false}
            className={active ? "is-active" : undefined}
            aria-current={active ? "true" : undefined}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}

/** @deprecated Prefer LanguageSwitcher — alias kept for Scope A call sites. */
export const LocaleSwitcher = LanguageSwitcher;
