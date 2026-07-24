import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const fallbackMessages = (await import("../../messages/en.json")).default;
  const localeMessages =
    locale === "en"
      ? fallbackMessages
      : (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...fallbackMessages,
      ...localeMessages
    }
  };
});
