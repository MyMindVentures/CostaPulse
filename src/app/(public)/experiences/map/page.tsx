import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExperienceMapPageFeature } from "@/features/map/experience-map-page";
import { ENABLED_LOCALES, DEFAULT_LOCALE } from "@/i18n/locales";

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MapPage.meta");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";
  const canonical = `${siteUrl.replace(/\/+$/, "")}/experiences/map`;

  const languages = Object.fromEntries(
    ENABLED_LOCALES.map((locale) => [locale, canonical])
  );

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": canonical
      }
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      locale: DEFAULT_LOCALE,
      type: "website"
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ExperiencesMapPage({
  searchParams
}: MapPageProps) {
  const params = await searchParams;
  return <ExperienceMapPageFeature searchParams={params} />;
}
