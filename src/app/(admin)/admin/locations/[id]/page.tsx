import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { LocationEditorForm } from "@/features/admin/location-editor-form";
import { fetchAdminLocations } from "@/server/repositories/admin-cms";

type Props = { params: Promise<{ id: string }> };

export default async function AdminLocationDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("Dashboards.admin");
  const locations = await fetchAdminLocations();
  const location = locations.find((row) => row.id === id);
  if (!location) notFound();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/locations" className="text-muted text-sm underline">
          {t("backToLocations")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {location.name}
        </h1>
      </div>
      <LocationEditorForm
        location={location}
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges")
        }}
      />
    </section>
  );
}
