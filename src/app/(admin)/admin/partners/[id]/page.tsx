import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { PartnerEditorForm } from "@/features/admin/partner-editor-form";
import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminMedia,
  fetchAdminPartnerDetail,
  fetchPartnerOwnerProfiles
} from "@/server/repositories/admin-cms";

type Props = { params: Promise<{ id: string }> };

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.costapulse.club"
  );
}

export default async function AdminPartnerDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("Dashboards.admin");

  let partner;
  try {
    partner = await fetchAdminPartnerDetail(id);
  } catch (error) {
    if (error instanceof AdminApiError) notFound();
    throw error;
  }

  const [media, ownerProfiles] = await Promise.all([
    fetchAdminMedia({ pageSize: 48 }),
    fetchPartnerOwnerProfiles()
  ]);
  const referralUrl = partner.referral_code
    ? `${siteUrl()}/r/${encodeURIComponent(partner.referral_code)}`
    : null;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/partners" className="text-muted text-sm underline">
          {t("backToPartners")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">{partner.name}</h1>
      </div>
      <PartnerEditorForm
        partner={partner}
        mediaLibrary={media.items}
        ownerProfiles={ownerProfiles}
        referralUrl={referralUrl}
        labels={{
          save: t("save"),
          unsavedChanges: t("unsavedChanges"),
          referralQr: t("referralQr")
        }}
      />
    </section>
  );
}
