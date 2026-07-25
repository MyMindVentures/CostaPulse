import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE_NAME, resolveAppLocale } from "./locales";
import { loadMessages } from "./load-messages";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveAppLocale(store.get(LOCALE_COOKIE_NAME)?.value);

  return {
    locale,
    messages: await loadMessages(locale)
  };
});
