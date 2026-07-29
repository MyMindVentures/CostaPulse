import { redirect } from "next/navigation";
import { SectionKicker } from "@/components/shared/section-kicker";
import { TeamMemberAvailabilityManager } from "@/features/admin/team-member-availability-manager";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import {
  fetchAdminAvailabilityReferenceData,
  fetchAdminTeamMemberAvailability
} from "@/server/repositories/admin-availability";
import { fetchAdminCalendar } from "@/server/repositories/admin-ops";

export const metadata = {
  title: "Admin availability",
  robots: { index: false, follow: false }
};

export default async function AdminAvailabilityPage() {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "availability")) {
    redirect("/admin?auth=forbidden");
  }

  const from = new Date();
  from.setUTCDate(1);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCMonth(to.getUTCMonth() + 3);

  const [entries, reference, overlays] = await Promise.all([
    fetchAdminTeamMemberAvailability({
      from: from.toISOString(),
      to: to.toISOString()
    }),
    fetchAdminAvailabilityReferenceData(),
    fetchAdminCalendar({
      from: from.toISOString(),
      to: to.toISOString()
    })
  ]);

  return (
    <section className="grid gap-6">
      <header>
        <SectionKicker>Operations</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Team availability
        </h1>
        <p className="text-muted mt-2 max-w-2xl">
          Manage public availability, private blocks, assignments, travel, and
          experience overlays.
        </p>
      </header>
      <TeamMemberAvailabilityManager
        entries={entries}
        reference={reference}
        overlays={overlays}
      />
    </section>
  );
}
