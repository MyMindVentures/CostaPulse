import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "nl", "fr", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed"
});
