/**
 * Central availability thresholds for calendar day colouring.
 * Values are remaining capacity ratios (0–1) relative to capacity_total.
 */
export const AVAILABILITY_CAPACITY_THRESHOLDS = {
  /** Remaining capacity at or below this ratio → limited (orange). */
  limitedRatio: 0.35,
  /** Absolute remaining seats at or below this count → limited. */
  limitedAbsolute: 3
} as const;

export type CalendarDayLevel = "good" | "limited" | "full" | "none";

export function classifyDayAvailability(input: {
  capacityTotal: number;
  capacityAvailable: number;
  hasBookableSlot: boolean;
}): CalendarDayLevel {
  if (!input.hasBookableSlot || input.capacityAvailable <= 0) {
    return input.capacityTotal > 0 ? "full" : "none";
  }

  const ratio =
    input.capacityTotal > 0 ? input.capacityAvailable / input.capacityTotal : 0;

  if (
    input.capacityAvailable <=
      AVAILABILITY_CAPACITY_THRESHOLDS.limitedAbsolute ||
    ratio <= AVAILABILITY_CAPACITY_THRESHOLDS.limitedRatio
  ) {
    return "limited";
  }

  return "good";
}
