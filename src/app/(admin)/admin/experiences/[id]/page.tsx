import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExperienceEditorForm } from "@/features/admin/experience-editor-form";
import { SectionKicker } from "@/components/shared/section-kicker";
import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminExperienceDetail,
  fetchAdminLocations,
  fetchAdminMedia,
  fetchAdminTeamMembers
} from "@/server/repositories/admin-cms";

type Props = { params: Promise<{ id: string }> };

export default async function AdminExperienceDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("Dashboards.admin");

  let experience;
  try {
    experience = await fetchAdminExperienceDetail(id);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }

  const [locations, teamMembers, media] = await Promise.all([
    fetchAdminLocations(),
    fetchAdminTeamMembers(),
    fetchAdminMedia({ pageSize: 48 })
  ]);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/experiences"
          className="text-muted text-sm underline"
        >
          {t("backToExperiences")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {experience.title}
        </h1>
        <p className="text-muted mt-1 text-sm">Status: {experience.status}</p>
      </div>
      <ExperienceEditorForm
        experience={experience}
        locations={locations}
        teamMembers={teamMembers}
        mediaLibrary={media.items}
        labels={{
          save: t("save"),
          publish: t("publish"),
          unpublish: t("unpublish"),
          archive: t("archive"),
          unsavedChanges: t("unsavedChanges"),
          publishBlocked: t("publishBlocked"),
          previewPublic: t("previewPublic")
        }}
      />
    </section>
  );
}
