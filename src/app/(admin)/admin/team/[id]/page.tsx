import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { TeamMemberEditorForm } from "@/features/admin/team-member-editor-form";
import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminMedia,
  fetchAdminTeamMemberDetail
} from "@/server/repositories/admin-cms";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTeamMemberDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("Dashboards.admin");

  let member;
  try {
    member = await fetchAdminTeamMemberDetail(id);
  } catch (error) {
    if (error instanceof AdminApiError) notFound();
    throw error;
  }

  const media = await fetchAdminMedia({ pageSize: 48 });
  const displayName =
    `${String(member.first_name ?? "")} ${String(member.last_name ?? "")}`.trim();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/team" className="text-muted text-sm underline">
          {t("backToTeam")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {displayName || t("teamHeading")}
        </h1>
      </div>
      <TeamMemberEditorForm
        member={member}
        mediaLibrary={media.items}
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges")
        }}
      />
    </section>
  );
}
