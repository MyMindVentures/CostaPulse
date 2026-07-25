import "server-only";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicStorageUrl } from "@/lib/media/experience-media";
import type { Json } from "@/types/database";
import {
  issuedVoucherSchema,
  publicReferralLandingSchema,
  verifiedReferralContextSchema,
  type IssuedVoucher,
  type PublicReferralLanding,
  type ReferralContactInput,
  type VerifiedReferralContext
} from "./schema";
import { hashReferralToken, REFERRAL_SESSION_COOKIE } from "./cookies";

function requireAdminClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }
  return supabase;
}

export async function registerReferralVisit(input: {
  partnerCode: string;
  visitorTokenHash: string;
}) {
  const { data, error } = await requireAdminClient().rpc(
    "register_partner_referral_visit",
    {
      p_partner_code: input.partnerCode,
      p_visitor_token_hash: input.visitorTokenHash,
      p_landing_path: "/experiences"
    }
  );
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Referral visit response was invalid.");
  }
  const payload = data as Record<string, Json | undefined>;
  if (typeof payload.visit_token !== "string") {
    throw new Error("Referral visit token was missing.");
  }
  return { visitToken: payload.visit_token };
}

export async function getPublicReferralLanding(
  visitToken: string,
  locale: string
): Promise<PublicReferralLanding | null> {
  const { data, error } = await requireAdminClient().rpc(
    "get_public_referral_landing",
    {
      p_visit_token: visitToken,
      p_locale: locale
    }
  );
  if (error || !data) return null;
  const parsed = publicReferralLandingSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export function resolveReferralMedia(
  landing: PublicReferralLanding,
  role: "logo" | "gallery"
) {
  const matches = landing.media.filter((item) => item.role === role);
  const selected =
    matches.find((item) => item.is_primary) ??
    matches.sort((a, b) => a.display_order - b.display_order)[0];
  return selected
    ? {
        url: getPublicStorageUrl(selected.bucket_id, selected.storage_path),
        alt: selected.alt_text ?? landing.partner.name
      }
    : null;
}

export async function submitReferralContact(
  input: ReferralContactInput,
  verificationTokenHash: string,
  expiresAt: Date
) {
  const { data, error } = await requireAdminClient().rpc(
    "submit_referral_contact",
    {
      p_visit_token: input.visitToken,
      p_verification_token_hash: verificationTokenHash,
      p_email: input.email,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_phone: input.phone ?? "",
      p_preferred_locale: input.locale,
      p_marketing_consent: input.marketingConsent,
      p_whatsapp_opt_in: input.whatsappConsent,
      p_expires_at: expiresAt.toISOString()
    }
  );
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Contact verification response was invalid.");
  }
  return data as Record<string, Json | undefined>;
}

export async function verifyReferralContact(
  verificationTokenHash: string,
  sessionTokenHash: string
) {
  const { data, error } = await requireAdminClient().rpc(
    "verify_referral_contact",
    {
      p_verification_token_hash: verificationTokenHash,
      p_session_token_hash: sessionTokenHash
    }
  );
  if (error) throw new Error(error.message);
  return data;
}

export async function recordVerificationEmailOutcome(input: {
  verificationTokenHash: string;
  succeeded: boolean;
  providerMessageId?: string;
}) {
  const { error } = await requireAdminClient().rpc(
    "record_referral_verification_email_outcome",
    {
      p_verification_token_hash: input.verificationTokenHash,
      p_succeeded: input.succeeded,
      p_provider_message_id: input.providerMessageId
    }
  );
  if (error) throw new Error(error.message);
}

export async function getVerifiedReferralContext(): Promise<VerifiedReferralContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFERRAL_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await requireAdminClient().rpc(
    "get_verified_referral_context",
    { p_session_token_hash: hashReferralToken(token) }
  );
  if (error || !data) return null;
  const parsed = verifiedReferralContextSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export async function getVoucherForBooking(
  bookingId: string
): Promise<IssuedVoucher | null> {
  const { data, error } = await requireAdminClient()
    .from("vouchers")
    .select(
      "id, code, booking_id, voucher_amount_minor, currency, status, issued_at, expires_at, partner:partners(id, name)"
    )
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error || !data) return null;
  const normalized = {
    ...data,
    partner: Array.isArray(data.partner) ? data.partner[0] : data.partner
  };
  const parsed = issuedVoucherSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export async function recordVoucherEmailOutcome(input: {
  voucher: IssuedVoucher;
  customerId: string | null;
  referralId: string | null;
  eventType: "voucher_email_sent" | "voucher_email_failed";
  providerMessageId?: string;
}) {
  const { error } = await requireAdminClient()
    .from("partner_referral_events")
    .insert({
      event_type: input.eventType,
      partner_id: input.voucher.partner.id,
      referral_id: input.referralId,
      customer_id: input.customerId,
      booking_id: input.voucher.booking_id,
      voucher_id: input.voucher.id,
      metadata: input.providerMessageId
        ? { provider_message_id: input.providerMessageId }
        : {}
    });
  if (error) throw new Error(error.message);
}
