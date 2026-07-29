"use client";

import {
  Anchor,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LockKeyhole,
  MessageCircle,
  Plane,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leadingEmptyCellCountForMonth } from "@/lib/datetime/calendar-grid";
import {
  availabilityServiceFilters,
  availabilityStatuses,
  getAvailabilityStatusSemantic,
  type PublicAvailabilityEntry
} from "@/lib/view-models/team-member-availability";
import { cn } from "@/lib/utils";

const statusIcons = {
  check: Check,
  gauge: Gauge,
  message: MessageCircle,
  users: Users,
  lock: LockKeyhole,
  ban: Ban,
  plane: Plane,
  anchor: Anchor,
  x: XCircle
} as const;

type Props = {
  entries: PublicAvailabilityEntry[];
  month: string;
  locale: string;
  initialFilters: {
    serviceCategory: string;
    status: string;
    availableOnly: boolean;
    location: string;
  };
  selectedDate?: string | null;
};

function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(value: string, amount: number): string {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(Date.UTC(year, month - 1 + amount, 1)));
}

function formatCategory(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AvailabilityCalendar({
  entries,
  month,
  locale,
  initialFilters,
  selectedDate
}: Props) {
  const t = useTranslations("Availability");
  const pathname = usePathname();
  const router = useRouter();
  const [activeEntry, setActiveEntry] =
    useState<PublicAvailabilityEntry | null>(
      selectedDate
        ? (entries.find((entry) => entry.dateKey === selectedDate) ?? null)
        : null
    );
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const leading = leadingEmptyCellCountForMonth(year, monthNumber - 1);
  const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1, 12));
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(monthDate);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(2026, 0, 5 + index)))
  );
  const entriesByDay = useMemo(() => {
    const grouped = new Map<string, PublicAvailabilityEntry[]>();
    for (const entry of entries) {
      const dayEntries = grouped.get(entry.dateKey) ?? [];
      dayEntries.push(entry);
      grouped.set(entry.dateKey, dayEntries);
    }
    return grouped;
  }, [entries]);

  function monthHref(targetMonth: string): string {
    const params = new URLSearchParams();
    params.set("month", targetMonth);
    if (initialFilters.serviceCategory)
      params.set("service_category", initialFilters.serviceCategory);
    if (initialFilters.status) params.set("status", initialFilters.status);
    if (initialFilters.availableOnly) params.set("available_only", "true");
    if (initialFilters.location)
      params.set("location", initialFilters.location);
    return `${pathname}?${params.toString()}`;
  }

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    params.set("month", month);
    for (const key of ["service_category", "status", "location"] as const) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    if (formData.get("available_only") === "on") {
      params.set("available_only", "true");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function renderStatus(entry: PublicAvailabilityEntry) {
    const semantic = getAvailabilityStatusSemantic(entry.status);
    const Icon = statusIcons[semantic.icon];
    return (
      <span
        className={cn(
          "availability-status inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
          semantic.className
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {t(semantic.labelKey)}
      </span>
    );
  }

  function renderCompactEntry(entry: PublicAvailabilityEntry) {
    const semantic = getAvailabilityStatusSemantic(entry.status);
    const Icon = statusIcons[semantic.icon];
    return (
      <>
        <span className="flex min-w-0 items-center gap-1 font-semibold">
          <Icon aria-hidden className="size-3.5 shrink-0" />
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
        <span className="sr-only">{t(semantic.labelKey)}</span>
      </>
    );
  }

  function renderEntryDetails(entry: PublicAvailabilityEntry) {
    const startsAt = new Date(entry.startsAt);
    const endsAt = new Date(entry.endsAt);
    const dateLabel = new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeZone: entry.timezone
    }).format(startsAt);
    const timeLabel = entry.isAllDay
      ? t("allDay")
      : `${new Intl.DateTimeFormat(locale, {
          timeStyle: "short",
          timeZone: entry.timezone
        }).format(startsAt)} – ${new Intl.DateTimeFormat(locale, {
          timeStyle: "short",
          timeZone: entry.timezone
        }).format(endsAt)}`;

    return (
      <div className="grid gap-4">
        <div>
          <p className="text-muted text-sm">{dateLabel}</p>
          <h2 className="text-ink mt-1 text-2xl font-semibold">
            {entry.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {renderStatus(entry)}
          {entry.service ? (
            <Badge variant="outline">
              {formatCategory(entry.service.category)}
            </Badge>
          ) : null}
        </div>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-muted">{t("when")}</dt>
            <dd className="text-ink font-medium">{timeLabel}</dd>
          </div>
          {entry.locationLabel || entry.geographicScope ? (
            <div>
              <dt className="text-muted">{t("where")}</dt>
              <dd className="text-ink font-medium">
                {entry.locationLabel ?? entry.geographicScope}
              </dd>
            </div>
          ) : null}
          {entry.summary ? (
            <div>
              <dt className="text-muted">{t("what")}</dt>
              <dd className="text-ink">{entry.summary}</dd>
            </div>
          ) : null}
          {entry.capacityRemaining !== null ? (
            <div>
              <dt className="text-muted">{t("capacity")}</dt>
              <dd className="text-ink font-medium">
                {t("placesRemaining", { count: entry.capacityRemaining })}
              </dd>
            </div>
          ) : null}
          {entry.service?.audience.length ? (
            <div>
              <dt className="text-muted">{t("audience")}</dt>
              <dd className="text-ink">{entry.service.audience.join(", ")}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">{t("travel")}</dt>
            <dd className="text-ink">
              {entry.travelAvailable ? t("travelAvailable") : t("travelNo")}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/availability/${entry.dateKey}`}>{t("viewDay")}</Link>
          </Button>
          {entry.cta.path && entry.cta.type !== "none" ? (
            <Button asChild variant="outline">
              <Link href={entry.cta.path}>{entry.cta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const agendaDays = Array.from(entriesByDay.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="grid gap-6">
      <div className="border-border bg-card rounded-[var(--radius)] border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-ink text-2xl font-semibold capitalize">
            {monthLabel}
          </h2>
          <nav className="flex items-center gap-2" aria-label={t("monthNav")}>
            <Button asChild variant="outline" aria-label={t("previousMonth")}>
              <Link href={monthHref(shiftMonth(month, -1))}>
                <ChevronLeft aria-hidden className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={monthHref(monthKey(new Date()))}>{t("today")}</Link>
            </Button>
            <Button asChild variant="outline" aria-label={t("nextMonth")}>
              <Link href={monthHref(shiftMonth(month, 1))}>
                <ChevronRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>

        <form
          action={applyFilters}
          className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
        >
          <label className="grid gap-1 text-sm">
            <span className="text-muted">{t("service")}</span>
            <select
              name="service_category"
              defaultValue={initialFilters.serviceCategory}
              className="border-input bg-card min-h-11 rounded-md border px-3"
            >
              <option value="">{t("allServices")}</option>
              {availabilityServiceFilters.map((category) => (
                <option key={category} value={category}>
                  {t(`serviceFilters.${category}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">{t("statusLabel")}</span>
            <select
              name="status"
              defaultValue={initialFilters.status}
              className="border-input bg-card min-h-11 rounded-md border px-3"
            >
              <option value="">{t("allStatuses")}</option>
              {availabilityStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(getAvailabilityStatusSemantic(status).labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">{t("location")}</span>
            <input
              name="location"
              defaultValue={initialFilters.location}
              className="border-input bg-card min-h-11 rounded-md border px-3"
            />
          </label>
          <label className="flex min-h-11 items-center gap-2 self-end text-sm">
            <input
              name="available_only"
              type="checkbox"
              defaultChecked={initialFilters.availableOnly}
              className="size-5"
            />
            {t("availableOnly")}
          </label>
          <Button type="submit" className="min-h-11 self-end">
            {t("applyFilters")}
          </Button>
        </form>
      </div>

      <section
        aria-label={t("legend")}
        className="border-border bg-card flex flex-wrap gap-2 rounded-[var(--radius)] border p-3"
      >
        {availabilityStatuses.map((status) => {
          const semantic = getAvailabilityStatusSemantic(status);
          const Icon = statusIcons[semantic.icon];
          return (
            <span
              key={status}
              className={cn(
                "availability-status inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                semantic.className
              )}
            >
              <Icon aria-hidden className="size-3.5" />
              {t(semantic.labelKey)}
            </span>
          );
        })}
      </section>

      <div className="hidden gap-4 md:grid md:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="border-border bg-card overflow-hidden rounded-[var(--radius)] border">
          <div className="border-border grid grid-cols-7 border-b">
            {weekdayLabels.map((label) => (
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
              const dateKey = `${month}-${String(day).padStart(2, "0")}`;
              const dayEntries = entriesByDay.get(dateKey) ?? [];
              return (
                <div
                  key={dateKey}
                  className="border-border min-h-36 min-w-0 border-r border-b p-2"
                >
                  <Link
                    href={`/availability/${dateKey}`}
                    className="text-ink focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full text-sm font-semibold focus-visible:ring-2"
                    aria-label={new Intl.DateTimeFormat(locale, {
                      dateStyle: "full",
                      timeZone: "UTC"
                    }).format(dateFromKey(dateKey))}
                  >
                    {day}
                  </Link>
                  <div className="mt-1 grid gap-1">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setActiveEntry(entry)}
                        className={cn(
                          "availability-entry focus-visible:ring-ring min-h-11 min-w-0 rounded-md px-2 py-1 text-left text-xs focus-visible:ring-2",
                          getAvailabilityStatusSemantic(entry.status).className
                        )}
                      >
                        {renderCompactEntry(entry)}
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
          {activeEntry ? (
            renderEntryDetails(activeEntry)
          ) : entries.length === 0 ? (
            <div>
              <h2 className="text-ink text-xl font-semibold">{t("empty")}</h2>
              <p className="text-muted mt-2 text-sm">{t("emptyDescription")}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-ink text-xl font-semibold">
                {t("selectDay")}
              </h2>
              <p className="text-muted mt-2 text-sm">{t("selectDayHint")}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="grid gap-4 md:hidden">
        {agendaDays.length ? (
          agendaDays.map(([dateKey, dayEntries]) => (
            <section key={dateKey} className="grid gap-2">
              <Link
                href={`/availability/${dateKey}`}
                className="text-ink min-h-11 text-lg font-semibold"
              >
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "full",
                  timeZone: "UTC"
                }).format(dateFromKey(dateKey))}
              </Link>
              {dayEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="border-border bg-card rounded-[var(--radius)] border p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEntry(
                        activeEntry?.id === entry.id ? null : entry
                      )
                    }
                    aria-expanded={activeEntry?.id === entry.id}
                    className="focus-visible:ring-ring min-h-11 w-full rounded-md text-left focus-visible:ring-2"
                  >
                    <span className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-ink font-semibold">
                        {entry.title}
                      </span>
                      {renderStatus(entry)}
                    </span>
                    {entry.locationLabel ? (
                      <span className="text-muted mt-2 block text-sm">
                        {entry.locationLabel}
                      </span>
                    ) : null}
                  </button>
                  {activeEntry?.id === entry.id ? (
                    <div className="border-border mt-4 border-t pt-4">
                      {renderEntryDetails(entry)}
                    </div>
                  ) : null}
                </article>
              ))}
            </section>
          ))
        ) : (
          <div className="border-border bg-card rounded-[var(--radius)] border p-8 text-center">
            <h2 className="text-ink text-xl font-semibold">{t("empty")}</h2>
            <p className="text-muted mt-2">{t("emptyDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
