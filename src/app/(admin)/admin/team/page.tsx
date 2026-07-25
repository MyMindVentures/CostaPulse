import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchAdminTeamMembers } from "@/server/repositories/admin-cms";

export default async function AdminTeamPage() {
  const t = await getTranslations("Dashboards.admin");
  const members = await fetchAdminTeamMembers();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold">
            {t("teamHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">{t("teamDescription")}</p>
        </div>
        <Link
          href="/admin/team/new"
          className={cn(buttonVariants({ variant: "coral" }), "min-h-11")}
        >
          {t("createTeamMember")}
        </Link>
      </header>

      {members.length === 0 ? (
        <EmptyState
          title={t("teamEmpty")}
          description={t("teamEmptyDescription")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-muted border-border border-b">
              <tr>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Role</th>
                <th className="px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-border border-b">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/team/${member.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {member.first_name} {member.last_name}
                    </Link>
                  </td>
                  <td className="px-2 py-3">{member.role_title}</td>
                  <td className="px-2 py-3">
                    <Badge variant="outline">
                      {member.is_active ? "active" : "inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
