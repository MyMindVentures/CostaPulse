import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { PartnerQrMaterialPage } from "@/features/partner/partner-qr-material";
import { resolveAppLocale } from "@/i18n/locales";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";
import { getOwnedPartnerQrMaterial } from "@/server/repositories/partner-referrals";
import { requireAreaAccess } from "@/server/auth/protected-area";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function PartnerQrPage({
  params
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  const { userId, roles } = await requireAreaAccess("partner");
  if (!roles.includes("partner")) redirect("/login?auth=forbidden");

  const [material, siteLogo] = await Promise.all([
    getOwnedPartnerQrMaterial(
      partnerId,
      userId,
      resolveAppLocale(await getLocale())
    ),
    getSiteLogoAsset()
  ]);
  if (!material) notFound();

  return <PartnerQrMaterialPage material={material} siteLogo={siteLogo} />;
}
