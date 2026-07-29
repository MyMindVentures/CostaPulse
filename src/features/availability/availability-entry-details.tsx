"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import { formatCategory } from "./availability-calendar.utils";
import { AvailabilityStatusBadge } from "./availability-status";

export function AvailabilityEntryDetails({
  entry,
  locale
}: {
  entry: PublicAvailabilityEntry;
  locale: string;
}) {
  const t = useTranslations("Availability");
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
        <h2 className="text-ink mt-1 text-2xl font-semibold">{entry.title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <AvailabilityStatusBadge status={entry.status} />
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
