/**
 * Deterministic calendar-day labels for SSR/CSR parity.
 * Avoids Intl punctuation differences that cause hydration mismatches.
 */

const WEEKDAYS_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
] as const;
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
] as const;

function parseUtcNoon(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const instant = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(instant.getTime())) return null;
  return instant;
}

export function formatBookingDateLong(
  date: string | null | undefined
): string | null {
  if (!date) return null;
  const instant = parseUtcNoon(date);
  if (!instant) return null;

  const weekday = WEEKDAYS_SHORT[instant.getUTCDay()];
  const day = instant.getUTCDate();
  const month = MONTHS_LONG[instant.getUTCMonth()];
  const year = instant.getUTCFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatBookingDateShort(date: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).formatToParts(new Date(`${date}T12:00:00.000Z`));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = get("weekday");
  const day = get("day");
  const month = get("month");
  const year = get("year");

  // Explicit shape so SSR/CSR never disagree on commas/spacing.
  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatMonthYearUtc(year: number, monthIndex: number): string {
  return `${MONTHS_LONG[monthIndex]} ${year}`;
}

export function formatMonthYearShortUtc(
  year: number,
  monthIndex: number
): string {
  return `${MONTHS_SHORT[monthIndex]} ${year}`;
}
