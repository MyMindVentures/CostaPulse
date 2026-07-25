import { DEFAULT_LOCALE, resolveAppLocale } from "@/i18n/locales";

export type LocalizedTextRow = {
  locale: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  short_description?: string | null;
  category_label?: string | null;
  location_name?: string | null;
  subtitle?: string | null;
  badge_label?: string | null;
  highlights?: unknown;
  inclusions?: unknown;
};

function normalizeTranslations(
  value: LocalizedTextRow | LocalizedTextRow[] | null | undefined
): LocalizedTextRow[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickRow(
  translations: LocalizedTextRow[],
  locale: string
): LocalizedTextRow | null {
  const resolved = resolveAppLocale(locale);
  const exact = translations.find((entry) => entry.locale === resolved);
  if (exact) return exact;
  const fallback = translations.find(
    (entry) => entry.locale === DEFAULT_LOCALE
  );
  return fallback ?? null;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Resolve localized experience/child copy with locale → en → base column fallback.
 */
export function pickLocalizedFields<
  T extends Record<string, unknown>
>(options: {
  locale: string;
  translations: LocalizedTextRow | LocalizedTextRow[] | null | undefined;
  base: T;
  stringKeys: Array<keyof T & string>;
  arrayKeys?: Array<keyof T & string>;
}): T {
  const rows = normalizeTranslations(options.translations);
  const row = pickRow(rows, options.locale);
  const next = { ...options.base };

  for (const key of options.stringKeys) {
    const fromRow = row?.[key as keyof LocalizedTextRow];
    if (typeof fromRow === "string" && fromRow.trim().length > 0) {
      (next as Record<string, unknown>)[key] = fromRow;
    }
  }

  for (const key of options.arrayKeys ?? []) {
    const fromRow = row?.[key as keyof LocalizedTextRow];
    const fallback = Array.isArray(options.base[key])
      ? (options.base[key] as string[])
      : [];
    (next as Record<string, unknown>)[key] = asStringArray(fromRow, fallback);
  }

  return next;
}

export function pickLocalizedString(options: {
  locale: string;
  translations: LocalizedTextRow | LocalizedTextRow[] | null | undefined;
  field: "title" | "name" | "description" | "subtitle" | "badge_label";
  fallback: string | null;
}): string | null {
  const rows = normalizeTranslations(options.translations);
  const row = pickRow(rows, options.locale);
  const value = row?.[options.field];
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return options.fallback;
}
