import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/shared/error-state";
import { Container } from "@/components/ui/container";
import { StrategyPage } from "@/features/strategies/strategy-page";
import { getPublicStrategies } from "@/server/repositories/strategies";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WhyCostaPulse");
  return { title: t("metaTitle"), description: t("metaDescription") };
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
