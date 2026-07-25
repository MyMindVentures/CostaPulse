import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DASHBOARD_NAVIGATION } from "@/config/navigation";
import { requireAreaAccess } from "@/server/auth/protected-area";
export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAreaAccess("admin");
  const t = await getTranslations("Dashboards");
  return (
    <DashboardShell
      title={t("admin.title")}
      navigationLabel={t("navigationLabel")}
      items={DASHBOARD_NAVIGATION.admin}
      labels={{ overview: t("overview") }}
    >
      {children}
    </DashboardShell>
  );
}
