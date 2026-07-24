/**
 * Builds an availability label from scheduled slot start times in the experience timezone.
 * Returns null when there are no slots — never invents a schedule.
 */

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 7] as const; // Monday=1 … Sunday=7 (ISO)

function getIsoWeekday(iso: string, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short"
  }).format(new Date(iso));

  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };

  return map[weekday] ?? 0;
}

function formatWeekdayLabel(isoWeekday: number, timeZone: string): string {
  // Pick a known Monday-based reference week in UTC and format in the target zone.
  const mondayUtc = Date.parse("2024-01-01T12:00:00.000Z"); // Monday
  const dayOffset = isoWeekday - 1;
  const instant = new Date(mondayUtc + dayOffset * 24 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short"
  }).format(instant);
}

export function summarizeAvailabilityFromSlots(
  slotStartsAt: string[],
  timeZone: string
): string | null {
  if (slotStartsAt.length === 0) return null;

  const weekdays = new Set(
    slotStartsAt
      .map((startsAt) => getIsoWeekday(startsAt, timeZone))
      .filter((day) => day >= 1 && day <= 7)
  );

  if (weekdays.size === 0) return null;

  if (weekdays.size === 7) {
    return "Daily";
  }

  return WEEKDAY_ORDER.filter((day) => weekdays.has(day))
    .map((day) => formatWeekdayLabel(day, timeZone))
    .join(", ");
}
