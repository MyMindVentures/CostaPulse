import { AdminBookingDetailFeature } from "@/features/admin/booking-detail";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin booking detail",
  robots: { index: false, follow: false }
};

type Params = Promise<{ id: string }>;

export default async function AdminBookingDetailPage({
  params
}: {
  params: Params;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "bookings")) {
    redirect("/admin?auth=forbidden");
  }

  const { id } = await params;
  return <AdminBookingDetailFeature bookingId={id} roles={roles} />;
}
