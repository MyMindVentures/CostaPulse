import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionKicker } from "@/components/shared/section-kicker";
export const metadata: Metadata = { title: "Contact | CostaPulse" };
export default async function ContactPage() {
  const t = await getTranslations("MarketingPages.contact");
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
