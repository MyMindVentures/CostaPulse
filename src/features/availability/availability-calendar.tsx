"use client";

import { AvailabilityDesktopCalendar } from "./availability-desktop-calendar";
import { AvailabilityLegend } from "./availability-status";
import type { AvailabilityCalendarProps } from "./availability-calendar.types";
import { AvailabilityMobileAgenda } from "./availability-mobile-agenda";
import { AvailabilityToolbar } from "./availability-toolbar";
import { useAvailabilityCalendar } from "./use-availability-calendar";

export function AvailabilityCalendar(props: AvailabilityCalendarProps) {
  const calendar = useAvailabilityCalendar(props);
  const [year, monthNumber] = props.month.split("-").map(Number);
  const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1, 12));
  const monthLabel = new Intl.DateTimeFormat(props.locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(monthDate);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(props.locale, {
      weekday: "short",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(2026, 0, 5 + index)))
  );

  return (
    <div className="grid gap-6">
      <AvailabilityToolbar
        applyFilters={calendar.applyFilters}
        initialFilters={props.initialFilters}
        month={props.month}
        monthHref={calendar.monthHref}
        monthLabel={monthLabel}
      />
      <AvailabilityLegend />
      <AvailabilityDesktopCalendar
        activeEntry={calendar.activeEntry}
        entries={props.entries}
        entriesByDay={calendar.entriesByDay}
        locale={props.locale}
        month={props.month}
        setActiveEntry={calendar.setActiveEntry}
        weekdayLabels={weekdayLabels}
      />
      <AvailabilityMobileAgenda
        activeEntry={calendar.activeEntry}
        agendaDays={calendar.agendaDays}
        locale={props.locale}
        setActiveEntry={calendar.setActiveEntry}
      />
    </div>
  );
}
