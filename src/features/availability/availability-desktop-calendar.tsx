"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { leadingEmptyCellCountForMonth } from "@/lib/datetime/calendar-grid";
import {
  getAvailabilityStatusSemantic,
  type PublicAvailabilityEntry
} from "@/lib/view-models/team-member-availability";
import { cn } from "@/lib/utils";
import { AvailabilityEntryDetails } from "./availability-entry-details";
import { dateFromKey, formatCategory } from "./availability-calendar.utils";
import { AvailabilityStatusBadge } from "./availability-status";

type Props = {
  activeEntry: PublicAvailabilityEntry | null;
  entries: PublicAvailabilityEntry[];
  entriesByDay: Map<string, PublicAvailabilityEntry[]>;
  locale: string;
  month: string;
  selectedDate?: string | null;
  setActiveEntry: (entry: PublicAvailabilityEntry | null) => void;
  weekdayLabels: string[];
};

function CompactEntry({
  entry,
  locale
}: {
  entry: PublicAvailabilityEntry;
  locale: string;
}) {
  const t = useTranslations("Availability");
  return (
    <>
      <span className="flex min-w-0 items-center gap-1 font-semibold">
        <AvailabilityStatusBadge status={entry.status} visuallyHiddenLabel />
        <span className="truncate">{entry.title}</span>
      </span>
      <span className="block truncate">
        {entry.isAllDay
          ? t("allDay")
          : new Intl.DateTimeFormat(locale, {
              timeStyle: "short",
              timeZone: entry.timezone
            }).format(new Date(entry.startsAt))}
        {entry.capacityRemaining !== null
          ? ` · ${t("placesCompact", { count: entry.capacityRemaining })}`
          : ""}
      </span>
      {entry.locationLabel || entry.geographicScope ? (
        <span className="block truncate">
          {entry.locationLabel ?? entry.geographicScope}
        </span>
      ) : null}
      {entry.service ? (
        <span className="block truncate">
          {formatCategory(entry.service.category)}
        </span>
      ) : null}
    </>
  );
}

export function AvailabilityDesktopCalendar(props: Props) {
  const t = useTranslations("Availability");
  const [year, monthNumber] = props.month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const leading = leadingEmptyCellCountForMonth(year, monthNumber - 1);

  return (
    <div className="hidden gap-4 md:grid md:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="border-border bg-card overflow-hidden rounded-[var(--radius)] border">
        <div className="border-border grid grid-cols-7 border-b">
          {props.weekdayLabels.map((label) => (
            <div
              key={label}
              className="text-muted px-2 py-3 text-center text-xs font-semibold uppercase"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: leading }, (_, index) => (
            <div
              key={`leading-${index}`}
              className="border-border bg-sand/30 min-h-36 border-r border-b"
              aria-hidden
            />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateKey = `${props.month}-${String(day).padStart(2, "0")}`;
            const dayEntries = props.entriesByDay.get(dateKey) ?? [];
            return (
              <div
                key={dateKey}
                className="border-border min-h-36 min-w-0 border-r border-b p-2"
              >
                <Link
                  href={`/availability/${dateKey}`}
                  className="text-ink focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full text-sm font-semibold focus-visible:ring-2"
                  aria-label={new Intl.DateTimeFormat(props.locale, {
                    dateStyle: "full",
                    timeZone: "UTC"
                  }).format(dateFromKey(dateKey))}
                  aria-current={
                    props.selectedDate === dateKey ? "date" : undefined
                  }
                >
                  {day}
                </Link>
                <div className="mt-1 grid gap-1">
                  {dayEntries.slice(0, 2).map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => props.setActiveEntry(entry)}
                      className={cn(
                        "availability-entry focus-visible:ring-ring min-h-11 min-w-0 rounded-md px-2 py-1 text-left text-xs focus-visible:ring-2",
                        getAvailabilityStatusSemantic(entry.status).className
                      )}
                    >
                      <CompactEntry entry={entry} locale={props.locale} />
                    </button>
                  ))}
                  {dayEntries.length > 2 ? (
                    <Link
                      href={`/availability/${dateKey}`}
                      className="text-turquoise-deep min-h-11 px-2 py-2 text-xs font-semibold"
                    >
                      {t("more", { count: dayEntries.length - 2 })}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <aside
        className="border-border bg-card sticky top-24 h-fit rounded-[var(--radius)] border p-5"
        aria-live="polite"
      >
        {props.activeEntry ? (
          <AvailabilityEntryDetails
            entry={props.activeEntry}
            locale={props.locale}
          />
        ) : props.entries.length === 0 ? (
          <div>
            <h2 className="text-ink text-xl font-semibold">{t("empty")}</h2>
            <p className="text-muted mt-2 text-sm">{t("emptyDescription")}</p>
          </div>
        ) : (
          <div>
            <h2 className="text-ink text-xl font-semibold">{t("selectDay")}</h2>
            <p className="text-muted mt-2 text-sm">{t("selectDayHint")}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
