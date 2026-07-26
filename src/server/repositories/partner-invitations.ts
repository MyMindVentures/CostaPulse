import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parsePartnerInvitation,
  type PartnerInvitation
} from "@/lib/view-models/partner-invitation";

export async function getPublicPartnerInvitation(
  partnerSlug: string,
  locale: string
): Promise<PartnerInvitation | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_public_partner_invitation", {
    p_partner_slug: partnerSlug,
    p_locale: locale
  });
  if (error) {
    console.error("[getPublicPartnerInvitation]", error.message);
    return null;
  }

  return parsePartnerInvitation(data, process.env.NEXT_PUBLIC_SUPABASE_URL);
}
