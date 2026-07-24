import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { filterSlotsForLocalDate } from "./filter";
import type { AvailabilityOkResponse, AvailabilityQuery } from "./schema";

type AvailabilitySuccess = {
  ok: true;
  status: 200;
  body: AvailabilityOkResponse;
};

type AvailabilityFailure = {
  ok: false;
  status: 400 | 404 | 503;
  code: string;
  message: string;
};

export type AvailabilityResult = AvailabilitySuccess | AvailabilityFailure;

export async function getAvailabilityForExperience(
  slug: string,
  query: AvailabilityQuery
): Promise<AvailabilityResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Supabase is not configured."
    };
  }

  const { data: experience, error: experienceError } = await supabase
    .from("experiences")
    .select("id, timezone, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (experienceError || !experience) {
    return {
      ok: false,
      status: 404,
      code: "EXPERIENCE_NOT_FOUND",
      message: "The selected experience is not available."
    };
  }

  const { data: variant, error: variantError } = await supabase
    .from("experience_variants")
    .select("id, experience_id, is_active, min_party_size, max_party_size")
    .eq("id", query.variantId)
    .eq("experience_id", experience.id)
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
    query.partySize < variant.min_party_size ||
    (variant.max_party_size !== null && query.partySize > variant.max_party_size)
  ) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PARTY_SIZE",
      message: "The selected party size is outside the allowed range."
    };
  }

  const timezone = experience.timezone || "Europe/Madrid";

  const { data: slots, error: slotsError } = await supabase
    .from("availability_slots")
    .select(
      "id, starts_at, ends_at, timezone, status, capacity_total, capacity_reserved, booking_cutoff_at, is_instant_confirmation"
    )
    .eq("experience_id", experience.id)
    .eq("experience_variant_id", query.variantId)
    .eq("status", "scheduled")
    .order("starts_at", { ascending: true });

  if (slotsError) {
    return {
      ok: false,
      status: 503,
      code: "AVAILABILITY_LOOKUP_FAILED",
      message: "Availability could not be loaded right now."
    };
  }

  const filtered = filterSlotsForLocalDate(
    (slots ?? []).map((slot) => ({
      id: slot.id,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      timezone: slot.timezone || timezone,
      status: slot.status,
      capacityTotal: slot.capacity_total,
      capacityReserved: slot.capacity_reserved,
      bookingCutoffAt: slot.booking_cutoff_at,
      isInstantConfirmation: slot.is_instant_confirmation
    })),
    query.date,
    timezone,
    query.partySize
  );

  return {
    ok: true,
    status: 200,
    body: {
      status: "ok",
      timezone,
      slots: filtered.map((slot) => ({
        ...slot,
        startsAt: new Date(slot.startsAt).toISOString(),
        endsAt: new Date(slot.endsAt).toISOString()
      }))
    }
  };
}
