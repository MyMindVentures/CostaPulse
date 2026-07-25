import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { MediaUploadForm } from "@/features/admin/media-upload-form";
import { fetchAdminReferenceData } from "@/server/repositories/admin-ops";

export default async function AdminMediaUploadPage() {
  const t = await getTranslations("Dashboards.admin");
  const reference = await fetchAdminReferenceData();

  return (
    <section className="flex flex-col gap-6">
      <SectionKicker>{t("kicker")}</SectionKicker>
      <MediaUploadForm
        reference={reference}
        labels={{
          title: t("mediaUploadHeading"),
          description: t("mediaUploadDescription"),
          entityType: t("mediaEntityType"),
          entity: t("mediaEntity"),
          parentExperience: t("mediaParentExperience"),
          usage: t("mediaUsage"),
          altText: t("mediaAltText"),
          caption: t("mediaCaption"),
          sortOrder: t("mediaSortOrder"),
          primary: t("mediaPrimary"),
          destination: t("mediaDestination"),
          dropHint: t("mediaDropHint"),
          upload: t("upload"),
          uploading: t("mediaUploading"),
          success: t("mediaUploadSuccess"),
          uploadAnother: t("mediaUploadAnother"),
          viewLibrary: t("mediaViewLibrary"),
          remove: t("mediaRemoveFile"),
          status: t("status")
        }}
      />
    </section>
  );
}
