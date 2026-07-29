import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import type { AvailabilityFilters } from "./availability-calendar.types";

export function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
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

export function availabilityUrl(
  pathname: string,
  month: string,
  filters: AvailabilityFilters
): string {
  const params = new URLSearchParams();
  params.set("month", month);
  if (filters.serviceCategory) {
    params.set("service_category", filters.serviceCategory);
  }
  if (filters.status) params.set("status", filters.status);
  if (filters.location) params.set("location", filters.location);
  if (filters.availableOnly) params.set("available_only", "true");
  return `${pathname}?${params.toString()}`;
}

export function filtersFromFormData(formData: FormData): AvailabilityFilters {
  return {
    serviceCategory: String(formData.get("service_category") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    availableOnly: formData.get("available_only") === "on"
  };
}
