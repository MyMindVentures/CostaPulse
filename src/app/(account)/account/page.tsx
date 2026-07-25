import { getTranslations } from "next-intl/server";
export default async function AccountPage() {
  const t = await getTranslations("Dashboards.account");
  return (
    <section className="dashboard-page">
      <h1>{t("heading")}</h1>
      <p>{t("description")}</p>
    </section>
  );
}
