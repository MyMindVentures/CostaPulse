import { AdminCalendarFeature } from "@/features/admin/calendar-view";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin calendar",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCalendarPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "calendar")) {
    redirect("/admin?auth=forbidden");
  }

  const params = await searchParams;
  return (
    <AdminCalendarFeature
      roles={roles}
      from={typeof params.from === "string" ? params.from : null}
      to={typeof params.to === "string" ? params.to : null}
      experienceId={
        typeof params.experience_id === "string" ? params.experience_id : null
      }
      locationId={
        typeof params.location_id === "string" ? params.location_id : null
      }
      teamMemberId={
        typeof params.team_member_id === "string" ? params.team_member_id : null
      }
    />
  );
}
