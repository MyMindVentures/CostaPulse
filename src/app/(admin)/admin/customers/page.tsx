import { AdminCustomersFeature } from "@/features/admin/customers-list";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin customers",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "customers")) {
    redirect("/admin?auth=forbidden");
  }

  const params = await searchParams;
  return (
    <AdminCustomersFeature
      search={typeof params.search === "string" ? params.search : null}
      page={
        typeof params.page === "string" && Number(params.page) > 0
          ? Number(params.page)
          : 1
      }
    />
  );
}
