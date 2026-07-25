import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
export default async function AccountBookingsPage() {
  const t = await getTranslations("Dashboards.account");
  return (
    <section className="dashboard-page">
      <h1>{t("bookingsHeading")}</h1>
      <EmptyState
        title={t("bookingsEmpty")}
        description={t("bookingsEmptyDescription")}
      />
    </section>
  );
}
