import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";

export default async function ExperienceDetailLoading() {
  const t = await getTranslations("SharedUI");

  return (
    <main className="xp-detail-page">
      <Container className="xp-detail-top py-16">
        <LoadingState label={t("loadingExperience")} rows={6} />
      </Container>
    </main>
  );
}
