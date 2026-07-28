import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/shared/error-state";
import { Container } from "@/components/ui/container";
import { StrategyPage } from "@/features/strategies/strategy-page";
import { getPublicStrategies } from "@/server/repositories/strategies";
import { DEFAULT_LOCALE, ENABLED_LOCALES } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WhyCostaPulse");
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club"
  ).replace(/\/+$/, "");
  const canonical = `${siteUrl}/why-costapulse`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical,
      locale: DEFAULT_LOCALE,
      type: "website"
    },
    robots: { index: true, follow: true }
  };
}

export default async function WhyCostaPulsePage() {
  const result = await getPublicStrategies();
  if (result.status === "error") {
    const t = await getTranslations("WhyCostaPulse");
    return (
      <Container className="py-24">
        <ErrorState
          title={t("errorTitle")}
          description={t("errorDescription")}
        />
      </Container>
    );
  }
  return <StrategyPage strategies={result.strategies} />;
}
