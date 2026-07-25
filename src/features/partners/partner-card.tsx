"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, ImageIcon, MapPin, Star } from "lucide-react";
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

  return (
    <article
      id={`partner-card-${item.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_50px_rgba(2,28,43,0.08)] transition-[transform,box-shadow] duration-300",
        selected
          ? "-translate-y-1 shadow-[0_24px_65px_rgba(2,28,43,0.16)]"
          : "hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(2,28,43,0.14)]"
      )}
    >
      <button
        type="button"
        className="focus-visible:ring-ring block w-full text-left focus-visible:ring-2 focus-visible:outline-none"
        aria-pressed={selected}
        aria-label={t("selectPartner", { name: item.name })}
        onClick={() => onSelect(item.slug)}
      >
        <PartnerCardImage item={item} />

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-turquoise-deep text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
                {item.category
                  ? formatPartnerCategory(item.category)
                  : t("trustedPartner")}
              </p>
              <h2 className="text-navy mt-1 line-clamp-2 font-serif text-2xl leading-tight">
                {item.name}
              </h2>
            </div>

            <span className="bg-sand text-navy flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </div>

          <p className="text-muted line-clamp-2 text-sm leading-6">
            {item.description || t("description")}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-navy text-white inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold">
              <Star className="size-3 fill-current" aria-hidden />
              {t("trustedPartner")}
            </span>
            {item.isFeatured ? (
              <span className="bg-gold text-navy rounded-full px-3 py-1.5 font-semibold">
                {t("featured")}
              </span>
            ) : null}
          </div>

          <div className="border-border flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-muted flex min-w-0 items-center gap-2 text-sm">
              <MapPin className="text-turquoise size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.location.city}</span>
            </p>
            <span className="text-navy text-sm font-semibold">{t("seeAll")}</span>
          </div>
        </div>
      </button>
    </article>
  );
}

function PartnerCardImage({ item }: { item: PartnerDirectoryItem }) {
  return (
    <div className="bg-sand relative aspect-[4/3] overflow-hidden">
      {item.image.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
        <img
          src={item.image.url}
          alt={item.image.alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="from-navy-soft via-turquoise-deep to-navy relative flex h-full items-center justify-center bg-gradient-to-br text-white">
          <span className="relative font-serif text-5xl" aria-hidden>
            {item.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toLocaleUpperCase()}
          </span>
          <ImageIcon className="absolute right-4 bottom-4 size-5 opacity-65" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

      {item.logo.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- canonical Supabase media URL
        <img
          src={item.logo.url}
          alt={item.logo.alt}
          className="absolute bottom-4 left-4 size-12 rounded-full border-2 border-white bg-white object-contain p-1.5 shadow-lg"
        />
      ) : null}
    </div>
  );
}
