import type { MetadataRoute } from "next";
import { euLocales } from "@/i18n/locales";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

export default function sitemap(): MetadataRoute.Sitemap {
  return euLocales.map((locale) => ({
    url: locale === "en" ? siteUrl : `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: locale === "en" ? 1 : 0.9
  }));
}
