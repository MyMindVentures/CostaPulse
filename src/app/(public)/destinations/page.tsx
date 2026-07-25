import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionKicker } from "@/components/shared/section-kicker";

export const metadata: Metadata = {
  title: "Destinations | CostaPulse",
  description: "Discover Costa Blanca destinations for CostaPulse experiences."
};

export default async function DestinationsPage() {
  const t = await getTranslations("MarketingPages.destinations");

  return (
    <main>
      <PageContainer spacing="comfortable">
        <article className="marketing-stub">
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </article>
      </PageContainer>
    </main>
  );
}
