import { AdminBookingsFeature } from "@/features/admin/bookings-list";
import {
  bookingStatusSchema,
  paymentStatusSchema
} from "@/server/admin/schemas";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin bookings",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "bookings")) {
    redirect("/admin?auth=forbidden");
  }

  const params = await searchParams;
  const statusRaw = typeof params.status === "string" ? params.status : "";
  const statusParsed = bookingStatusSchema.safeParse(statusRaw);
  const paymentRaw =
    typeof params.payment_status === "string" ? params.payment_status : "";
  const paymentParsed = paymentStatusSchema.safeParse(paymentRaw);

  return (
    <AdminBookingsFeature
      query={{
        page:
          typeof params.page === "string" && Number(params.page) > 0
            ? Number(params.page)
            : 1,
        search: typeof params.search === "string" ? params.search : null,
        status: statusParsed.success ? statusParsed.data : null,
        paymentStatus: paymentParsed.success ? paymentParsed.data : null,
        experienceId:
          typeof params.experience_id === "string"
            ? params.experience_id
            : null,
        locationId:
          typeof params.location_id === "string" ? params.location_id : null
      }}
    />
  );
}
