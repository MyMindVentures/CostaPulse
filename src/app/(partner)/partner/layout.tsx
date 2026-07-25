import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DASHBOARD_NAVIGATION } from "@/config/navigation";
import { requireAreaAccess } from "@/server/auth/protected-area";
export default async function PartnerLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAreaAccess("partner");
  const t = await getTranslations("Dashboards");
  return (
    <DashboardShell
      title={t("partner.title")}
      navigationLabel={t("navigationLabel")}
      items={DASHBOARD_NAVIGATION.partner}
      labels={{ overview: t("overview") }}
    >
      {children}
    </DashboardShell>
  );
}
