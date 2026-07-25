"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, ImageIcon, MapPin, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPartnerCategory } from "@/lib/view-models/partner-directory";
import type { PartnerDirectoryItem } from "@/lib/view-models/partner-directory";

type PartnerCardProps = {
  item: PartnerDirectoryItem;
  selected: boolean;
  onSelect: (slug: string) => void;
};

export function PartnerCard({ item, selected, onSelect }: PartnerCardProps) {
  const t = useTranslations("PartnerDirectory");
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1
  });

  return (
    <article
      id={`partner-card-${item.slug}`}
      className={cn(
        "border-border bg-panel relative overflow-hidden rounded-xl border transition-[border-color,box-shadow,transform]",
        selected
          ? "border-turquoise shadow-[0_0_0_1px_var(--turquoise)]"
          : "hover:border-turquoise/45 hover:-translate-y-px hover:shadow-sm"
      )}
    >
      <button
        type="button"
        className="group focus-visible:ring-ring grid min-h-30 w-full grid-cols-[7.25rem_minmax(0,1fr)] text-left focus-visible:ring-2 focus-visible:outline-none"
        aria-pressed={selected}
        aria-label={t("selectPartner", { name: item.name })}
        onClick={() => onSelect(item.slug)}
      >
        <PartnerCardImage item={item} />
        <div className="flex min-w-0 flex-col p-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-navy line-clamp-1 font-serif text-base leading-tight">
                {item.name}
              </h2>
              <p className="text-muted mt-1 flex min-w-0 items-center gap-1 text-[0.7rem]">
                <span className="truncate">
                  {item.category
                    ? formatPartnerCategory(item.category)
                    : t("trustedPartner")}
                </span>
                <span aria-hidden>•</span>
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{item.location.city}</span>
              </p>
            </div>
            {item.isFeatured ? (
              <span className="bg-gold text-navy shrink-0 rounded px-1.5 py-1 text-[0.55rem] font-bold tracking-wide uppercase">
                {t("featured")}
              </span>
            ) : null}
          </div>

          <dl className="border-border mt-auto grid grid-cols-3 divide-x border-t pt-2">
            <CompactMetric
              icon={<QrCode aria-hidden />}
              value={number.format(item.metrics.scans)}
              label={t("scans")}
            />
            <CompactMetric
              icon={<CalendarCheck aria-hidden />}
              value={number.format(item.metrics.bookings)}
              label={t("bookings")}
            />
            <CompactMetric
              value={`${percent.format(item.metrics.conversionRate)}%`}
              label={t("conversion")}
              accent
            />
          </dl>
        </div>
      </button>
    </article>
  );
}

function PartnerCardImage({ item }: { item: PartnerDirectoryItem }) {
  return (
    <div className="bg-sand relative h-full min-h-30 overflow-hidden">
      {item.image.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
        <img
          src={item.image.url}
          alt={item.image.alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="from-navy-soft via-turquoise-deep to-navy relative flex h-full items-center justify-center bg-gradient-to-br text-white">
          <span className="relative font-serif text-3xl" aria-hidden>
            {item.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toLocaleUpperCase()}
          </span>
          <ImageIcon className="absolute right-2 bottom-2 size-3.5 opacity-65" />
        </div>
      )}
      {item.logo.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
        <img
          src={item.logo.url}
          alt={item.logo.alt}
          className="border-panel absolute bottom-2 left-2 size-8 rounded-full border-2 bg-white object-contain p-1 shadow-sm"
        />
      ) : null}
    </div>
  );
}

function CompactMetric({
  icon,
  value,
  label,
  accent = false
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 px-2 first:pl-0 last:pr-0">
      <dt
        className={cn(
          "flex items-center gap-1 text-sm font-semibold",
          accent ? "text-turquoise-deep" : "text-navy"
        )}
      >
        {icon ? (
          <span className="text-turquoise [&>svg]:size-3.5">{icon}</span>
        ) : null}
        {value}
      </dt>
      <dd className="text-muted mt-0.5 truncate text-[0.58rem]">{label}</dd>
    </div>
  );
}
