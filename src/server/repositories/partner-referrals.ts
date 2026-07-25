import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/media/experience-media";
import { partnerPromoContentSchema } from "@/server/referrals/schema";
import {
  generatePartnerQrSvg,
  getPartnerReferralUrl
} from "@/server/referrals/qr";
import type { AppLocale } from "@/i18n/locales";

export type PartnerQrMaterial = {
  id: string;
  name: string;
  businessType: string | null;
  status: "draft" | "active" | "disabled";
  referralCode: string;
  referralUrl: string;
  rewardBasisPoints: number;
  qrSvg: string;
  logo: { url: string; alt: string } | null;
  background: { url: string; alt: string } | null;
  content: ReturnType<typeof partnerPromoContentSchema.parse>;
};

export async function listOwnedPartners(ownerProfileId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, business_type, status")
    .eq("owner_profile_id", ownerProfileId)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOwnedPartnerQrMaterial(
  partnerId: string,
  ownerProfileId: string,
  locale: AppLocale
): Promise<PartnerQrMaterial | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [{ data: partner, error: partnerError }, { data: contentRows }] =
    await Promise.all([
      supabase
        .from("partners")
        .select(
          "id, slug, name, business_type, status, referral_code, voucher_percent_basis_points"
        )
        .eq("id", partnerId)
        .eq("owner_profile_id", ownerProfileId)
        .maybeSingle(),
      supabase
        .from("partner_promo_content")
        .select("locale, content")
        .in("locale", [locale, "en"])
        .eq("is_published", true)
    ]);

  if (partnerError || !partner) return null;
  const localizedContent =
    contentRows?.find((row) => row.locale === locale)?.content ??
    contentRows?.find((row) => row.locale === "en")?.content;
  const parsedContent = partnerPromoContentSchema.safeParse(localizedContent);
  if (!parsedContent.success) {
    throw new Error("Published partner promotional content is invalid.");
  }

  const { data: media } = await supabase
    .from("media_assets")
    .select(
      "id, bucket_id, storage_path, role, alt_text, alt_text_override, is_primary, display_order"
    )
    .eq("scope_type", "partner")
    .eq("scope_key", partner.slug)
    .in("role", ["logo", "gallery"])
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("display_order");

  const resolveMedia = (role: "logo" | "gallery") => {
    const selected = media?.find((item) => item.role === role);
    const url = selected
      ? getPublicStorageUrl(selected.bucket_id, selected.storage_path)
      : null;
    return selected && url
      ? {
          url,
          alt: selected.alt_text_override ?? selected.alt_text ?? partner.name
        }
      : null;
  };

  return {
    id: partner.id,
    name: partner.name,
    businessType: partner.business_type,
    status: partner.status,
    referralCode: partner.referral_code,
    referralUrl: getPartnerReferralUrl(partner.referral_code),
    rewardBasisPoints: partner.voucher_percent_basis_points,
    qrSvg: await generatePartnerQrSvg(partner.referral_code),
    logo: resolveMedia("logo"),
    background: resolveMedia("gallery"),
    content: parsedContent.data
  };
}
