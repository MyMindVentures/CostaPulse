import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAdminDashboardNavItems } from "@/config/navigation";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { filterAdminNavSections } from "@/server/auth/role-access";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const { roles } = await requireAreaAccess("admin");
  const t = await getTranslations("Dashboards");
  const sections = filterAdminNavSections(roles, [
    "overview",
    "experiences",
    "media",
    "partners",
    "locations",
    "team",
    "bookings",
    "bookingStories",
    "calendar",
    "customers"
  ]);
  const items = getAdminDashboardNavItems(sections);

  return (
    <DashboardShell
      title={t("admin.title")}
      navigationLabel={t("navigationLabel")}
      items={items}
      labels={{
        overview: t("overview"),
        experiences: t("experiences"),
        media: t("media"),
        partners: t("partners"),
        locations: t("locations"),
        team: t("team"),
        bookings: t("bookings"),
        bookingStories: t("bookingStories"),
        calendar: t("calendar"),
        customers: t("customers")
      }}
      footer={<SignOutButton label={t("signOut")} />}
    >
      {children}
    </DashboardShell>
  );
}
