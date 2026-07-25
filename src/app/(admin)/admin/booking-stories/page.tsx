import { redirect } from "next/navigation";
import { AdminBookingStoriesFeature } from "@/features/admin/booking-stories-list";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canMutateAdminContent } from "@/server/auth/role-access";

export const metadata = {
  title: "Admin booking stories",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminBookingStoriesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) redirect("/admin?auth=forbidden");
  const params = await searchParams;
  const status =
    params.status === "draft" ||
    params.status === "published" ||
    params.status === "archived"
      ? params.status
      : "eligible";
  const consent =
    params.consent === "pending" ||
    params.consent === "granted" ||
    params.consent === "revoked"
      ? params.consent
      : null;
  return (
    <AdminBookingStoriesFeature
      query={{
        status,
        consent,
        search: typeof params.search === "string" ? params.search : null,
        experienceId:
          typeof params.experience_id === "string"
            ? params.experience_id
            : null,
        page:
          typeof params.page === "string" && Number(params.page) > 0
            ? Number(params.page)
            : 1
      }}
    />
  );
}
