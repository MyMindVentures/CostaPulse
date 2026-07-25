import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ExperienceEditorForm } from "@/features/admin/experience-editor-form";
import { SectionKicker } from "@/components/shared/section-kicker";
import {
  fetchAdminLocations,
  fetchAdminTeamMembers
} from "@/server/repositories/admin-cms";

export default async function AdminNewExperiencePage() {
  const t = await getTranslations("Dashboards.admin");
  const [locations, teamMembers] = await Promise.all([
    fetchAdminLocations(),
    fetchAdminTeamMembers()
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
          {t("createExperience")}
        </h1>
      </div>
      <ExperienceEditorForm
        locations={locations}
        teamMembers={teamMembers}
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
