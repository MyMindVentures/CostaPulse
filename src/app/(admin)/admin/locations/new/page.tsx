import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { LocationEditorForm } from "@/features/admin/location-editor-form";

export default async function AdminNewLocationPage() {
  const t = await getTranslations("Dashboards.admin");
  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/locations" className="text-muted text-sm underline">
          {t("backToLocations")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("createLocation")}
        </h1>
      </div>
      <LocationEditorForm
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges")
        }}
      />
    </section>
  );
}
