import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";

export default async function ExperiencesLoading() {
  const t = await getTranslations("SharedUI");

  return (
    <main className="catalog-page">
      <Container className="catalog-content py-16">
        <LoadingState label={t("loadingExperiences")} rows={5} />
      </Container>
    </main>
  );
}
