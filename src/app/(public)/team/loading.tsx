import { getTranslations } from "next-intl/server";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function TeamLoading() {
  const t = await getTranslations("TeamPage");

  return (
    <main>
      <PageContainer spacing="comfortable">
        <LoadingState label={t("loading")} rows={6} />
      </PageContainer>
    </main>
  );
}
