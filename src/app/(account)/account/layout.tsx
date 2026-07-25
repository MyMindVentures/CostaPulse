import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DASHBOARD_NAVIGATION } from "@/config/navigation";
import { requireAreaAccess } from "@/server/auth/protected-area";

export default async function AccountLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAreaAccess("account");
  const t = await getTranslations("Dashboards");
  return (
    <DashboardShell
      title={t("account.title")}
      navigationLabel={t("navigationLabel")}
      items={DASHBOARD_NAVIGATION.account}
      labels={{ overview: t("overview"), bookings: t("bookings") }}
    >
      {children}
    </DashboardShell>
  );
}
