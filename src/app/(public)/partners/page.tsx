import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionKicker } from "@/components/shared/section-kicker";
import { REFERRAL_FLOW_ENTRY } from "@/config/navigation";

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
          <Link
            href={REFERRAL_FLOW_ENTRY.href}
            className="button button-outline mt-6"
          >
            {t("referralCta")}
          </Link>
        </article>
      </PageContainer>
    </main>
  );
}
