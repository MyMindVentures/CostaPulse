import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const loaders = {
  bg: () => import("../../messages/bg.json"),
  hr: () => import("../../messages/hr.json"),
  cs: () => import("../../messages/cs.json"),
  da: () => import("../../messages/da.json"),
  nl: () => import("../../messages/nl.json"),
  en: () => import("../../messages/en.json"),
  et: () => import("../../messages/et.json"),
  fi: () => import("../../messages/fi.json"),
  fr: () => import("../../messages/fr.json"),
  de: () => import("../../messages/de.json"),
  el: () => import("../../messages/el.json"),
  hu: () => import("../../messages/hu.json"),
  ga: () => import("../../messages/ga.json"),
  it: () => import("../../messages/it.json"),
  lv: () => import("../../messages/lv.json"),
  lt: () => import("../../messages/lt.json"),
  mt: () => import("../../messages/mt.json"),
  pl: () => import("../../messages/pl.json"),
  pt: () => import("../../messages/pt.json"),
  ro: () => import("../../messages/ro.json"),
  sk: () => import("../../messages/sk.json"),
  sl: () => import("../../messages/sl.json"),
  es: () => import("../../messages/es.json"),
  sv: () => import("../../messages/sv.json")
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const fallbackMessages = (await loaders.en()).default;
  const localeMessages = locale === "en" ? fallbackMessages : (await loaders[locale]()).default;

  return {
    locale,
    messages: {
      ...fallbackMessages,
      ...localeMessages
    }
  };
});
