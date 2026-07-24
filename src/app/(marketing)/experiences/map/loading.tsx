import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";

export default async function ExperiencesMapLoading() {
  const t = await getTranslations("MapPage");

  return (
    <main className="map-page">
      <Container className="map-page__body py-16">
        <LoadingState label={t("loading")} rows={5} />
        <div className="map-canvas map-canvas--skeleton" aria-hidden />
      </Container>
    </main>
  );
}
