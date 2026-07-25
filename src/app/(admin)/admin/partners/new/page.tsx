import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { PartnerEditorForm } from "@/features/admin/partner-editor-form";
import { fetchPartnerOwnerProfiles } from "@/server/repositories/admin-cms";

export default async function AdminNewPartnerPage() {
  const t = await getTranslations("Dashboards.admin");
  const ownerProfiles = await fetchPartnerOwnerProfiles();
  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/partners" className="text-muted text-sm underline">
          {t("backToPartners")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("createPartner")}
        </h1>
      </div>
      <PartnerEditorForm
        ownerProfiles={ownerProfiles}
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges"),
          referralQr: t("referralQr")
        }}
      />
    </section>
  );
}
