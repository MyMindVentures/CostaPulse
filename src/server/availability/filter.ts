/**
 * Pure helpers for availability day bounds and slot eligibility.
 * Timezone day math uses Intl parts so we stay free of extra date libs.
 */

export type SlotCandidate = {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: string;
  capacityTotal: number;
  capacityAvailable: number;
  bookingCutoffAt: string | null;
  isInstantConfirmation: boolean;
  isBookable: boolean;
  locationId: string | null;
};

export type SlotEligibilityInput = Omit<SlotCandidate, "id" | "locationId"> & {
  partySize: number;
  nowMs?: number;
};

export type EligibleSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  localStartLabel: string;
  capacityRemaining: number;
  capacityTotal: number;
  isInstantConfirmation: boolean;
  locationId: string | null;
};

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute")
  };
}

export function getLocalDateKey(iso: string, timeZone: string): string {
  const parts = getTimeZoneParts(new Date(iso), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatLocalStartLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date(iso));
}

export function isSlotEligibleForParty(
  input: SlotEligibilityInput
): { ok: true; capacityRemaining: number } | { ok: false; reason: string } {
  const nowMs = input.nowMs ?? Date.now();
  const capacityRemaining = input.capacityAvailable;

  if (input.status !== "scheduled") {
    return { ok: false, reason: "status" };
  }

  if (!input.isBookable) {
    return { ok: false, reason: "not_bookable" };
  }

  if (capacityRemaining < input.partySize) {
    return { ok: false, reason: "capacity" };
  }

  const cutoffMs = Date.parse(input.bookingCutoffAt ?? input.startsAt);
  if (!Number.isFinite(cutoffMs) || nowMs >= cutoffMs) {
    return { ok: false, reason: "cutoff" };
  }

  return { ok: true, capacityRemaining };
}

export function filterSlotsForLocalDate(
  slots: SlotCandidate[],
  date: string,
  timeZone: string,
  partySize: number,
  nowMs = Date.now()
): EligibleSlot[] {
  return slots
    .filter((slot) => getLocalDateKey(slot.startsAt, timeZone) === date)
    .map((slot) => {
      const eligibility = isSlotEligibleForParty({
        ...slot,
        partySize,
        nowMs
      });

      if (!eligibility.ok) return null;

      return {
        id: slot.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        localStartLabel: formatLocalStartLabel(slot.startsAt, timeZone),
        capacityRemaining: eligibility.capacityRemaining,
        capacityTotal: slot.capacityTotal,
        isInstantConfirmation: slot.isInstantConfirmation,
        locationId: slot.locationId
      };
    })
    .filter((slot): slot is EligibleSlot => slot !== null)
    .sort(
      (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)
    );
}
