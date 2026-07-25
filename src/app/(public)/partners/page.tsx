import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionKicker } from "@/components/shared/section-kicker";

export const metadata: Metadata = {
  title: "Partners | CostaPulse",
  description: "Partner with CostaPulse on Costa Blanca experiences."
};

export default async function PartnersPage() {
  const t = await getTranslations("MarketingPages.partners");

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
