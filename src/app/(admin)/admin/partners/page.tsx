import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchAdminPartners } from "@/server/repositories/admin-cms";

export default async function AdminPartnersPage() {
  const t = await getTranslations("Dashboards.admin");
  const partners = await fetchAdminPartners();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold">
            {t("partnersHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {t("partnersDescription")}
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className={cn(buttonVariants({ variant: "coral" }), "min-h-11")}
        >
          {t("createPartner")}
        </Link>
      </header>

      {partners.length === 0 ? (
        <EmptyState
          title={t("partnersEmpty")}
          description={t("partnersEmptyDescription")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-muted border-border border-b">
              <tr>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Referral</th>
                <th className="px-2 py-3">Voucher %</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-border border-b">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {partner.name}
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant="outline">{partner.status}</Badge>
                  </td>
                  <td className="px-2 py-3">{partner.referral_code}</td>
                  <td className="px-2 py-3">
                    {(partner.voucher_percent_basis_points / 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
