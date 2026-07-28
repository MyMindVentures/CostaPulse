import { LoadingState } from "@/components/shared/loading-state";
import { Container } from "@/components/ui/container";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("WhyCostaPulse");
  return (
    <Container className="py-24">
      <LoadingState label={t("loading")} />
    </Container>
  );
}
