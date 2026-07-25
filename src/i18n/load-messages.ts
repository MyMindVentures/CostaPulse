import type { AppLocale } from "./locales";

export async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case "nl":
      return (await import("../../messages/nl.json")).default;
    case "fr":
      return (await import("../../messages/fr.json")).default;
    case "es":
      return (await import("../../messages/es.json")).default;
    case "de":
      return (await import("../../messages/de.json")).default;
    case "en":
    default:
      return (await import("../../messages/en.json")).default;
  }
}
