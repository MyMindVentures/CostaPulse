"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowUpRight,
  CalendarClock,
  ImageIcon,
  MapPin,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { cn } from "@/lib/utils";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";

type ExperienceMapListItemProps = {
  item: ExperienceMapItem;
  selected: boolean;
  onSelect: (markerKey: string) => void;
};

function formatAvailabilityDate(
  iso: string | null,
  locale: string
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function ExperienceMapListItem({
  item,
  selected,
  onSelect
}: ExperienceMapListItemProps) {
  const t = useTranslations("MapPage.list");
  const locale = useLocale();
  const locationLabel = item.location.name || t("locationFallback");
  const nextAvailable = formatAvailabilityDate(
    item.availability.nextAvailableAt,
    locale
  );
  const hostNames = item.teamMembers
    .map((member) => member.displayName)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  return (
    <article
      id={`map-list-item-${item.markerKey}`}
      className={cn("map-list-item", selected && "is-selected")}
      data-marker-key={item.markerKey}
    >
      <button
        type="button"
        className="map-list-item__select"
        aria-pressed={selected}
        aria-label={t("selectAria", {
          title: item.title,
          location: locationLabel
        })}
        onClick={() => onSelect(item.markerKey)}
      >
        <div className="map-list-item__media" aria-hidden={!item.imageUrl}>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Storage URLs; next/image optional later
            <img
              src={item.imageUrl}
              alt=""
              className="map-list-item__img"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="map-list-item__img-fallback">
              <ImageIcon aria-hidden />
            </div>
          )}
        </div>
        <div className="map-list-item__body">
          <div className="map-list-item__meta">
            {item.category ? (
              <Badge variant="secondary">{item.category}</Badge>
            ) : null}
            <span className="map-list-item__location">
              <MapPin size={14} aria-hidden />
              {locationLabel}
            </span>
          </div>
          <h3 className="map-list-item__title">{item.title}</h3>
          {item.price.amountMinor != null ? (
            <div className="map-list-item__price">
              <span className="map-list-item__price-label">
                {t("fromPrice")}
              </span>
              <PriceDisplay
                amountMinor={item.price.amountMinor}
                currency={item.price.currency}
                locale={locale}
              />
            </div>
          ) : null}
          <div className="map-list-item__availability">
            <CalendarClock aria-hidden />
            <span>
              {nextAvailable
                ? t("availabilityNext", { date: nextAvailable })
                : t("availabilityNone")}
              {item.availability.slotCount > 0
                ? ` · ${t("slotsAvailable", { count: item.availability.slotCount })}`
                : null}
            </span>
          </div>
          {hostNames ? (
            <p className="map-list-item__hosts">
              <Users aria-hidden />
              <span>{t("hostedBy", { names: hostNames })}</span>
            </p>
          ) : null}
        </div>
      </button>
      <Link
        href={`/experiences/${item.slug}`}
        className="map-list-item__cta button button-outline"
      >
        <span>{t("viewDetails")}</span>
        <ArrowUpRight aria-hidden />
      </Link>
    </article>
  );
}
