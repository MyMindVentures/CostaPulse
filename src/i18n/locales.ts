/**
 * Central locale registry for customer-facing CostaPulse surfaces.
 * Only enabled locales are exposed in the language switcher.
 */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_REGISTRY = [
  {
    code: "en",
    label: "English",
    enabled: true
  },
  {
    code: "nl",
    label: "Nederlands",
    enabled: true
  },
  {
    code: "fr",
    label: "Français",
    enabled: true
  },
  {
    code: "es",
    label: "Español",
    enabled: true
  },
  {
    code: "de",
    label: "Deutsch",
    enabled: true
  }
] as const;

export type AppLocale = (typeof LOCALE_REGISTRY)[number]["code"];

export const ENABLED_LOCALES = LOCALE_REGISTRY.filter(
  (locale) => locale.enabled
).map((locale) => locale.code);

export const DEFAULT_LOCALE: AppLocale = "en";

export function isAppLocale(value: string): value is AppLocale {
  return ENABLED_LOCALES.includes(value as AppLocale);
}

/** BCP 47 tags for Intl date/number formatting. */
export const LOCALE_FORMAT_TAGS: Record<AppLocale, string> = {
  en: "en-GB",
  nl: "nl-NL",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE"
};

export function resolveAppLocale(value: string | undefined | null): AppLocale {
  if (value && isAppLocale(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}
