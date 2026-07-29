import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import type { AvailabilityFilters } from "./availability-calendar.types";

export const AVAILABILITY_DISPLAY_TIME_ZONE = "Europe/Madrid";

export function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function shiftMonth(value: string, amount: number): string {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(Date.UTC(year, month - 1 + amount, 1)));
}

export function formatCategory(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function groupEntriesByDay(entries: PublicAvailabilityEntry[]) {
  const grouped = new Map<string, PublicAvailabilityEntry[]>();
  for (const entry of entries) {
    const dayEntries = grouped.get(entry.dateKey) ?? [];
    dayEntries.push(entry);
    grouped.set(entry.dateKey, dayEntries);
  }
  return grouped;
}

function availabilitySearchParams(
  month: string,
  filters: AvailabilityFilters,
  selectedDate?: string | null
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("month", month);
  if (selectedDate) params.set("date", selectedDate);
  if (filters.serviceCategory) {
    params.set("service_category", filters.serviceCategory);
  }
  if (filters.status) params.set("status", filters.status);
  if (filters.location) params.set("location", filters.location);
  if (filters.availableOnly) params.set("available_only", "true");
  return params;
}

export function availabilityUrl(
  pathname: string,
  month: string,
  filters: AvailabilityFilters,
  selectedDate?: string | null
): string {
  return `${pathname}?${availabilitySearchParams(month, filters, selectedDate).toString()}`;
}

export function availabilityDateUrl(
  pathname: string,
  selectedDate: string,
  filters: AvailabilityFilters
): string {
  const params = availabilitySearchParams(selectedDate.slice(0, 7), filters);
  const query = params.toString();

  if (pathname === "/availability") {
    return `/availability/${selectedDate}${query ? `?${query}` : ""}`;
  }

  params.set("date", selectedDate);
  return `${pathname}?${params.toString()}`;
}

export function availabilityBasePath(pathname: string): string {
  return pathname.replace(/^(\/availability)\/\d{4}-\d{2}-\d{2}$/, "$1");
}

export function filtersFromFormData(formData: FormData): AvailabilityFilters {
  return {
    serviceCategory: String(formData.get("service_category") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    availableOnly: formData.get("available_only") === "on"
  };
}
