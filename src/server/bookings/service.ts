import "server-only";
import type { Json } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  mapBookingRpcError,
  type CreateBookingInput,
  type SetParticipantsInput
} from "./schema";

type CreateBookingSuccess = {
  ok: true;
  status: 201;
  booking: {
    id: string;
    bookingReference: string;
    status: string;
    paymentStatus: string;
    totalAmountMinor: number;
    currency: string;
    expiresAt: string | null;
    availabilitySlotId: string | null;
    startsAt: string | null;
    endsAt: string | null;
    idempotentReplay: boolean;
  };
};

type BookingFailure = {
  ok: false;
  status: 400 | 403 | 404 | 409 | 503;
  code: string;
  message: string;
};

export type CreateBookingResult = CreateBookingSuccess | BookingFailure;

type RpcBookingPayload = {
  booking_id?: string;
  booking_reference?: string;
  status?: string;
  payment_status?: string;
  total_amount_minor?: number;
  currency?: string;
  expires_at?: string | null;
  availability_slot_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  idempotent_replay?: boolean;
};

function asRecord(value: Json | null): RpcBookingPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as RpcBookingPayload;
}

function participantsToJson(
  participants: NonNullable<CreateBookingInput["participants"]>
): Json {
  return participants.map((participant) => ({
    first_name: participant.firstName,
    last_name: participant.lastName ?? null,
    email: participant.email ?? null,
    phone: participant.phone ?? null,
    is_lead: participant.isLead ?? false,
    dietary_notes: participant.dietaryNotes ?? null,
    medical_notes: participant.medicalNotes ?? null,
    accessibility_notes: participant.accessibilityNotes ?? null
  })) as Json;
}

export async function createExperienceBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase admin client is not configured."
    };
  }

  if (input.participants && input.participants.length !== input.partySize) {
    return {
      ok: false,
      status: 400,
      code: "PARTICIPANT_COUNT_MISMATCH",
      message: "Participant count must match party size."
    };
  }

  const { data, error } = await supabase.rpc("create_experience_booking", {
    p_availability_slot_id: input.availabilitySlotId,
    p_party_size: input.partySize,
    p_customer_email: input.customerEmail,
    p_contact_first_name: input.contactFirstName,
    p_contact_last_name: input.contactLastName,
    p_customer_phone: input.customerPhone ?? undefined,
    p_preferred_language: input.preferredLanguage,
    p_special_requests: input.specialRequests ?? undefined,
    p_terms_accepted: input.termsAccepted,
    p_idempotency_key: input.idempotencyKey,
    p_anonymous_session_id: input.anonymousSessionId ?? undefined
  });

  if (error) {
    const mapped = mapBookingRpcError(error.message);
    return {
      ok: false,
      status: mapped.status,
      code: mapped.code,
      message: error.message
    };
  }

  const payload = asRecord(data);
  if (!payload?.booking_id || !payload.booking_reference) {
    return {
      ok: false,
      status: 503,
      code: "BOOKING_CREATE_FAILED",
      message: "The booking could not be created."
    };
  }

  if (input.referralCode) {
    const { data: referral } = await supabase
      .from("referrals")
      .select("id, partner_id, status, expires_at")
      .eq("code", input.referralCode)
      .maybeSingle();

    const isExpired =
      referral?.expires_at != null &&
      new Date(referral.expires_at).getTime() <= Date.now();

    if (referral && referral.status === "active" && !isExpired) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("metadata")
        .eq("id", payload.booking_id)
        .maybeSingle();

      const existingMetadata =
        existing?.metadata &&
        typeof existing.metadata === "object" &&
        !Array.isArray(existing.metadata)
          ? existing.metadata
          : {};

      await supabase
        .from("bookings")
        .update({
          partner_id: referral.partner_id,
          referral_id: referral.id,
          metadata: {
            ...existingMetadata,
            referralCode: input.referralCode
          }
        })
        .eq("id", payload.booking_id);
    }
  }

  if (input.participants && input.participants.length > 0) {
    const participantResult = await setBookingParticipants(payload.booking_id, {
      participants: input.participants
    });
    if (!participantResult.ok) {
      return participantResult;
    }
  }

  return {
    ok: true,
    status: 201,
    booking: {
      id: payload.booking_id,
      bookingReference: payload.booking_reference,
      status: payload.status ?? "pending_payment",
      paymentStatus: payload.payment_status ?? "unpaid",
      totalAmountMinor: payload.total_amount_minor ?? 0,
      currency: payload.currency ?? "EUR",
      expiresAt: payload.expires_at ?? null,
      availabilitySlotId: payload.availability_slot_id ?? null,
      startsAt: payload.starts_at ?? null,
      endsAt: payload.ends_at ?? null,
      idempotentReplay: Boolean(payload.idempotent_replay)
    }
  };
}

export async function setBookingParticipants(
  bookingId: string,
  input: SetParticipantsInput
): Promise<
  { ok: true; status: 200; participantCount: number } | BookingFailure
> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase admin client is not configured."
    };
  }

  const { data, error } = await supabase.rpc("set_booking_participants", {
    p_booking_id: bookingId,
    p_participants: participantsToJson(input.participants)
  });

  if (error) {
    const mapped = mapBookingRpcError(error.message);
    return {
      ok: false,
      status: mapped.status,
      code: mapped.code,
      message: error.message
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { participant_count?: number })
      : null;

  return {
    ok: true,
    status: 200,
    participantCount: payload?.participant_count ?? input.participants.length
  };
}

export async function getBookingDetailForAccess(input: {
  bookingId: string;
  accessEmail?: string;
  anonymousSessionId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false as const,
      status: 503 as const,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase admin client is not configured."
    };
  }

  const { data: booking, error } = await supabase
    .from("booking_detail")
    .select("*")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (error || !booking) {
    return {
      ok: false as const,
      status: 404 as const,
      code: "BOOKING_NOT_FOUND",
      message: "The booking could not be found."
    };
  }

  const emailMatches =
    input.accessEmail &&
    booking.customer_email?.toLowerCase() === input.accessEmail.toLowerCase();

  let sessionMatches = false;
  if (input.anonymousSessionId) {
    const { data: hold } = await supabase
      .from("booking_holds")
      .select("id")
      .eq("booking_id", input.bookingId)
      .eq("anonymous_session_id", input.anonymousSessionId)
      .maybeSingle();
    sessionMatches = Boolean(hold);
  }

  if (!emailMatches && !sessionMatches) {
    return {
      ok: false as const,
      status: 403 as const,
      code: "NOT_AUTHORIZED",
      message: "You are not allowed to view this booking."
    };
  }

  return { ok: true as const, status: 200 as const, booking };
}
