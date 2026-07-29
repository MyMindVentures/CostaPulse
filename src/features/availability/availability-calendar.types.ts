import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";

export type AvailabilityFilters = {
  serviceCategory: string;
  status: string;
  availableOnly: boolean;
  location: string;
};

export type AvailabilityCalendarProps = {
  entries: PublicAvailabilityEntry[];
  month: string;
  locale: string;
  initialFilters: AvailabilityFilters;
  selectedDate?: string | null;
  todayDateKey: string;
};
