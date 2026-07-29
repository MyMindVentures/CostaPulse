"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import type { AvailabilityFilters } from "./availability-calendar.types";
import {
  availabilityUrl,
  filtersFromFormData,
  groupEntriesByDay
} from "./availability-calendar.utils";

type Options = {
  entries: PublicAvailabilityEntry[];
  initialFilters: AvailabilityFilters;
  month: string;
  selectedDate?: string | null;
};

export function useAvailabilityCalendar({
  entries,
  initialFilters,
  month,
  selectedDate
}: Options) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeEntry, setActiveEntry] =
    useState<PublicAvailabilityEntry | null>(
      selectedDate
        ? (entries.find((entry) => entry.dateKey === selectedDate) ?? null)
        : null
    );
  const entriesByDay = useMemo(() => groupEntriesByDay(entries), [entries]);
  const agendaDays = useMemo(
    () =>
      Array.from(entriesByDay.entries()).sort(([a], [b]) => a.localeCompare(b)),
    [entriesByDay]
  );

  function monthHref(targetMonth: string) {
    return availabilityUrl(pathname, targetMonth, initialFilters);
  }

  function applyFilters(formData: FormData) {
    router.push(
      availabilityUrl(pathname, month, filtersFromFormData(formData))
    );
  }

  return {
    activeEntry,
    agendaDays,
    applyFilters,
    entriesByDay,
    monthHref,
    setActiveEntry
  };
}
