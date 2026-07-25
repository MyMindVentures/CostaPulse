import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { listOwnedPartners } from "@/server/repositories/partner-referrals";

export default async function PartnerQrIndexPage() {
  const [{ userId }, t] = await Promise.all([
    requireAreaAccess("partner"),
    getTranslations("Dashboards")
  ]);
  const partners = await listOwnedPartners(userId);

  return (
    <section className="dashboard-page">
      <h1>{t("partnerQr")}</h1>
      <p>{t("partner.qrDescription")}</p>
      {partners.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {partners.map((partner) => (
            <article
              key={partner.id}
              className="border-border rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-turquoise text-sm tracking-wide uppercase">
                {partner.business_type ?? t("partner.fallbackType")}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{partner.name}</h2>
              <p className="text-muted mt-2 text-sm">
                {t("partner.status", { status: partner.status })}
              </p>
              <Link
                href={`/partner/qr/${partner.id}`}
                className="button button-gold mt-5"
              >
                {t("partner.openQr")}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="border-border text-muted mt-8 rounded-xl border bg-white p-5">
          {t("partner.empty")}
        </p>
      )}
    </section>
  );
}
