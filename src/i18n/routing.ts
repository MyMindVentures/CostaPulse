import { defineRouting } from "next-intl/routing";
import { euLocales } from "./locales";

export const routing = defineRouting({
  locales: euLocales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true
});
