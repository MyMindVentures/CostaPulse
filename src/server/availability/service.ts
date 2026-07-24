import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  filterSlotsForLocalDate,
  getLocalDateKey,
  type SlotCandidate
} from "./filter";
import type { AvailabilityOkResponse, AvailabilityQuery } from "./schema";
import { classifyDayAvailability, type CalendarDayLevel } from "./thresholds";

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

function toSlotCandidate(
  row: {
    availability_slot_id: string | null;
    starts_at: string | null;
    ends_at: string | null;
    timezone: string | null;
    status: string | null;
    capacity_total: number | null;
    capacity_available: number | null;
    booking_cutoff_at: string | null;
    is_instant_confirmation: boolean | null;
    is_bookable: boolean | null;
    location_id: string | null;
  },
  fallbackTimezone: string
): SlotCandidate | null {
  if (
    !row.availability_slot_id ||
    !row.starts_at ||
    !row.ends_at ||
    row.capacity_total == null ||
    row.capacity_available == null ||
    !row.status
  ) {
    return null;
  }

  return {
    id: row.availability_slot_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone || fallbackTimezone,
    status: row.status,
    capacityTotal: row.capacity_total,
    capacityAvailable: row.capacity_available,
    bookingCutoffAt: row.booking_cutoff_at,
    isInstantConfirmation: row.is_instant_confirmation ?? false,
    isBookable: row.is_bookable ?? false,
    locationId: row.location_id
  };
}

function buildCalendarDays(
  slots: SlotCandidate[],
  from: string,
  to: string,
  timeZone: string,
  partySize: number
) {
  const byDate = new Map<
    string,
    {
      capacityAvailable: number;
      capacityTotal: number;
      slotCount: number;
      hasBookableSlot: boolean;
    }
  >();

  for (const slot of slots) {
    const date = getLocalDateKey(slot.startsAt, timeZone);
    if (date < from || date > to) continue;

    const bookableForParty =
      slot.isBookable &&
      slot.status === "scheduled" &&
      slot.capacityAvailable >= partySize;

    const existing = byDate.get(date) ?? {
      capacityAvailable: 0,
      capacityTotal: 0,
      slotCount: 0,
      hasBookableSlot: false
    };

    existing.capacityAvailable += Math.max(slot.capacityAvailable, 0);
    existing.capacityTotal += Math.max(slot.capacityTotal, 0);
    existing.slotCount += 1;
    existing.hasBookableSlot = existing.hasBookableSlot || bookableForParty;
    byDate.set(date, existing);
  }

  const days: Array<{
    date: string;
    level: CalendarDayLevel;
    capacityAvailable: number;
    capacityTotal: number;
    slotCount: number;
  }> = [];

  const cursor = new Date(`${from}T12:00:00.000Z`);
  const end = new Date(`${to}T12:00:00.000Z`);

  while (cursor.getTime() <= end.getTime()) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cursor.getUTCDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;
    const aggregate = byDate.get(date);

    if (!aggregate) {
      days.push({
        date,
        level: "none",
        capacityAvailable: 0,
        capacityTotal: 0,
        slotCount: 0
      });
    } else {
      days.push({
        date,
        level: classifyDayAvailability(aggregate),
        capacityAvailable: aggregate.capacityAvailable,
        capacityTotal: aggregate.capacityTotal,
        slotCount: aggregate.slotCount
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

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
    (variant.max_party_size !== null &&
      query.partySize > variant.max_party_size)
  ) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PARTY_SIZE",
      message: "The selected party size is outside the allowed range."
    };
  }

  const timezone = experience.timezone || "Europe/Madrid";

  const { data: rows, error: slotsError } = await supabase
    .from("booking_availability")
    .select(
      "availability_slot_id, starts_at, ends_at, timezone, status, capacity_total, capacity_available, booking_cutoff_at, is_instant_confirmation, is_bookable, location_id"
    )
    .eq("experience_id", experience.id)
    .eq("experience_variant_id", query.variantId)
    .order("starts_at", { ascending: true });

  if (slotsError) {
    return {
      ok: false,
      status: 503,
      code: "AVAILABILITY_LOOKUP_FAILED",
      message: "Availability could not be loaded right now."
    };
  }

  const candidates = (rows ?? [])
    .map((row) => toSlotCandidate(row, timezone))
    .filter((slot): slot is SlotCandidate => slot !== null);

  if (query.date) {
    const filtered = filterSlotsForLocalDate(
      candidates,
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

  const from = query.from!;
  const to = query.to!;

  return {
    ok: true,
    status: 200,
    body: {
      status: "ok",
      timezone,
      days: buildCalendarDays(candidates, from, to, timezone, query.partySize)
    }
  };
}
