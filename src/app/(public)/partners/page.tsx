import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PartnerDirectoryPage } from "@/features/partners/partner-directory-page";
import { DEFAULT_LOCALE, ENABLED_LOCALES } from "@/i18n/locales";

type PartnersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PartnerDirectory.meta");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";
  const canonical = `${siteUrl.replace(/\/+$/, "")}/partners`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          ENABLED_LOCALES.map((locale) => [locale, canonical])
        ),
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
    robots: { index: true, follow: true }
  };
}

export default async function PartnersPage({
  searchParams
}: PartnersPageProps) {
  return <PartnerDirectoryPage searchParams={await searchParams} />;
}
