import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";

export default async function BookLoading() {
  const t = await getTranslations("SharedUI");

  return (
    <main className="bk-page">
      <Container className="py-16">
        <LoadingState label={t("loadingBooking")} rows={4} />
      </Container>
    </main>
  );
}
