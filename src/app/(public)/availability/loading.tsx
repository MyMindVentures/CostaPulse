import { LoadingState } from "@/components/shared/loading-state";
import { Container } from "@/components/ui/container";
import { getTranslations } from "next-intl/server";

export default async function AvailabilityLoading() {
  const t = await getTranslations("Availability");
  return (
    <Container className="py-12">
      <LoadingState label={t("loading")} rows={6} />
    </Container>
  );
}
