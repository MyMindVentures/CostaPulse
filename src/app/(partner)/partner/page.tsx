import { getTranslations } from "next-intl/server";
export default async function PartnerPage() {
  const t = await getTranslations("Dashboards.partner");
  return (
    <section className="dashboard-page">
      <h1>{t("heading")}</h1>
      <p>{t("description")}</p>
    </section>
  );
}
