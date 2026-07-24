/**
 * Central locale registry for customer-facing CostaPulse surfaces.
 * Only enabled locales are exposed in the language switcher.
 */
export const LOCALE_REGISTRY = [
  {
    code: "en",
    label: "English",
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
