"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import type { AvailabilityFilters } from "./availability-calendar.types";
import {
  availabilityBasePath,
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
  const basePath = availabilityBasePath(pathname);
  const router = useRouter();
  const [selection, setSelection] = useState<{
    selectedDate?: string | null;
    entryId: string | null;
  }>({
    selectedDate,
    entryId: entries.find((entry) => entry.dateKey === selectedDate)?.id ?? null
  });
  const routeEntryId =
    entries.find((entry) => entry.dateKey === selectedDate)?.id ?? null;
  const activeEntryId =
    selection.selectedDate === selectedDate ? selection.entryId : routeEntryId;
  const activeEntry =
    entries.find((entry) => entry.id === activeEntryId) ?? null;
  const entriesByDay = useMemo(() => groupEntriesByDay(entries), [entries]);
  const agendaDays = useMemo(
    () =>
      Array.from(entriesByDay.entries()).sort(([a], [b]) => a.localeCompare(b)),
    [entriesByDay]
  );

  function monthHref(targetMonth: string) {
    return availabilityUrl(basePath, targetMonth, initialFilters);
  }

  function dateHref(date: string) {
    return availabilityUrl(basePath, date.slice(0, 7), initialFilters, date);
  }

  function applyFilters(formData: FormData) {
    router.push(
      availabilityUrl(
        basePath,
        month,
        filtersFromFormData(formData),
        selectedDate
      )
    );
  }

  function setActiveEntry(entry: PublicAvailabilityEntry | null) {
    setSelection({ selectedDate, entryId: entry?.id ?? null });
  }

  return {
    activeEntry,
    agendaDays,
    applyFilters,
    entriesByDay,
    dateHref,
    monthHref,
    setActiveEntry
  };
}
