"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";
import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import { AvailabilityEntryDetails } from "./availability-entry-details";
import { dateFromKey } from "./availability-calendar.utils";
import { AvailabilityStatusBadge } from "./availability-status";

type Props = {
  activeEntry: PublicAvailabilityEntry | null;
  agendaDays: [string, PublicAvailabilityEntry[]][];
  locale: string;
  setActiveEntry: Dispatch<SetStateAction<PublicAvailabilityEntry | null>>;
};

export function AvailabilityMobileAgenda({
  activeEntry,
  agendaDays,
  locale,
  setActiveEntry
}: Props) {
  const t = useTranslations("Availability");

  return (
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
                    setActiveEntry(activeEntry?.id === entry.id ? null : entry)
                  }
                  aria-expanded={activeEntry?.id === entry.id}
                  className="focus-visible:ring-ring min-h-11 w-full rounded-md text-left focus-visible:ring-2"
                >
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <span className="text-ink font-semibold">
                      {entry.title}
                    </span>
                    <AvailabilityStatusBadge status={entry.status} />
                  </span>
                  {entry.locationLabel ? (
                    <span className="text-muted mt-2 block text-sm">
                      {entry.locationLabel}
                    </span>
                  ) : null}
                </button>
                {activeEntry?.id === entry.id ? (
                  <div className="border-border mt-4 border-t pt-4">
                    <AvailabilityEntryDetails entry={entry} locale={locale} />
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
  );
}
