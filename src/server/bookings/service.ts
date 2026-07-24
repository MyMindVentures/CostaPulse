import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateDraftBookingAmounts } from "./pricing";
import type { CreateDraftBookingInput } from "./schema";

type DraftBookingSuccess = {
  ok: true;
  status: 201;
  booking: {
    id: string;
    bookingReference: string;
    currency: string;
    partySize: number;
    subtotalAmountMinor: number;
    voucherAmountMinor: number;
    totalAmountMinor: number;
    status: "pending_payment";
    paymentStatus: "pending";
    manualConfirmationRequired: boolean;
  };
};

type DraftBookingFailure = {
  ok: false;
  status: 400 | 404 | 409 | 503;
  code: string;
  message: string;
};

export type DraftBookingResult = DraftBookingSuccess | DraftBookingFailure;

export async function createDraftBooking(
  input: CreateDraftBookingInput
): Promise<DraftBookingResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase admin client is not configured."
    };
  }

  const { data: experience, error: experienceError } = await supabase
    .from("experiences")
    .select("id, status, manual_confirmation_required")
    .eq("id", input.experienceId)
    .maybeSingle();

  if (experienceError || !experience || experience.status !== "published") {
    return {
      ok: false,
      status: 404,
      code: "EXPERIENCE_NOT_AVAILABLE",
      message: "The selected experience is not available."
    };
  }

  const { data: variant, error: variantError } = await supabase
    .from("experience_variants")
    .select(
      "id, experience_id, currency, pricing_model, unit_amount_minor, min_party_size, max_party_size, is_active"
    )
    .eq("id", input.experienceVariantId)
    .eq("experience_id", input.experienceId)
    .maybeSingle();

  if (variantError || !variant || !variant.is_active) {
    return {
      ok: false,
      status: 404,
      code: "VARIANT_NOT_AVAILABLE",
      message: "The selected experience option is not available."
    };
  }

  if (
    input.partySize < variant.min_party_size ||
    (variant.max_party_size !== null &&
      input.partySize > variant.max_party_size)
  ) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PARTY_SIZE",
      message: "The selected party size is outside the allowed range."
    };
  }

  if (input.availabilitySlotId) {
    const { data: slot, error: slotError } = await supabase
      .from("availability_slots")
      .select(
        "id, experience_id, experience_variant_id, status, capacity_total, capacity_reserved"
      )
      .eq("id", input.availabilitySlotId)
      .eq("experience_variant_id", input.experienceVariantId)
      .maybeSingle();

    if (slotError || !slot || slot.experience_id !== input.experienceId) {
      return {
        ok: false,
        status: 404,
        code: "SLOT_NOT_AVAILABLE",
        message: "The selected availability slot is not available."
      };
    }

    const remainingCapacity = slot.capacity_total - slot.capacity_reserved;
    if (slot.status !== "scheduled" || remainingCapacity < input.partySize) {
      return {
        ok: false,
        status: 409,
        code: "SLOT_CAPACITY_UNAVAILABLE",
        message: "The selected availability slot no longer has enough capacity."
      };
    }
  }

  let partnerId: string | null = null;
  let referralId: string | null = null;

  if (input.referralCode) {
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("id, partner_id, status, expires_at")
      .eq("code", input.referralCode)
      .maybeSingle();

    const isExpired =
      referral?.expires_at !== null &&
      referral?.expires_at !== undefined &&
      new Date(referral.expires_at).getTime() <= Date.now();

    if (
      referralError ||
      !referral ||
      referral.status !== "active" ||
      isExpired
    ) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_REFERRAL_CODE",
        message: "The referral code is invalid or no longer active."
      };
    }

    partnerId = referral.partner_id;
    referralId = referral.id;
  }

  const amounts = calculateDraftBookingAmounts({
    pricingModel: variant.pricing_model,
    unitAmountMinor: variant.unit_amount_minor,
    partySize: input.partySize
  });

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      customer_email: input.customerEmail,
      experience_id: input.experienceId,
      experience_variant_id: input.experienceVariantId,
      availability_slot_id: input.availabilitySlotId ?? null,
      partner_id: partnerId,
      referral_id: referralId,
      status: "pending_payment",
      payment_status: "pending",
      currency: variant.currency,
      unit_amount_minor: amounts.unitAmountMinor,
      subtotal_amount_minor: amounts.subtotalAmountMinor,
      total_amount_minor: amounts.totalAmountMinor,
      voucher_amount_minor: amounts.voucherAmountMinor,
      party_size: input.partySize,
      participant_notes: input.participantNotes ?? null,
      metadata: {
        bookingSource: "api",
        referralCode: input.referralCode ?? null
      }
    })
    .select(
      "id, booking_reference, currency, party_size, subtotal_amount_minor, voucher_amount_minor, total_amount_minor, status, payment_status"
    )
    .single();

  if (insertError || !booking) {
    return {
      ok: false,
      status: 503,
      code: "BOOKING_INSERT_FAILED",
      message: "The booking draft could not be created."
    };
  }

  return {
    ok: true,
    status: 201,
    booking: {
      id: booking.id,
      bookingReference: booking.booking_reference,
      currency: booking.currency,
      partySize: booking.party_size,
      subtotalAmountMinor: booking.subtotal_amount_minor,
      voucherAmountMinor: booking.voucher_amount_minor,
      totalAmountMinor: booking.total_amount_minor,
      status: "pending_payment",
      paymentStatus: "pending",
      manualConfirmationRequired: experience.manual_confirmation_required
    }
  };
}
