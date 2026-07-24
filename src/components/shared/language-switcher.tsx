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
 * Preserves the current path and query (including booking attribution params)
 * when switching language. Locale routing expands as more locales are enabled.
 */
export function LanguageSwitcher({
  currentLocale = "en",
  className = "bk-lang-switch",
  label = "Language"
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav className={cn(className)} aria-label={label}>
      {ENABLED_LOCALES.map((locale) => {
        const href = query ? `${pathname}?${query}` : pathname;
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
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
