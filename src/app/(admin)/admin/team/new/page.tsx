import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { TeamMemberEditorForm } from "@/features/admin/team-member-editor-form";
import { fetchAdminMedia } from "@/server/repositories/admin-cms";

export default async function AdminNewTeamMemberPage() {
  const t = await getTranslations("Dashboards.admin");
  const media = await fetchAdminMedia({ pageSize: 48 });

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/team" className="text-muted text-sm underline">
          {t("backToTeam")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("createTeamMember")}
        </h1>
      </div>
      <TeamMemberEditorForm
        mediaLibrary={media.items}
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges")
        }}
      />
    </section>
  );
}
