import { AdminCustomerDetailFeature } from "@/features/admin/customer-detail";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin customer detail",
  robots: { index: false, follow: false }
};

type Params = Promise<{ id: string }>;

export default async function AdminCustomerDetailPage({
  params
}: {
  params: Params;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "customers")) {
    redirect("/admin?auth=forbidden");
  }

  const { id } = await params;
  return <AdminCustomerDetailFeature customerId={id} />;
}
