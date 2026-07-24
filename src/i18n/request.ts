import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE } from "./locales";
import messages from "../../messages/en.json";

export default getRequestConfig(async () => {
  return { locale: DEFAULT_LOCALE, messages };
});
