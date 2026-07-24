"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { PriceDisplay } from "@/components/shared/price-display";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";

type ExperienceMapSelectedCardProps = {
  item: ExperienceMapItem;
  onClose: () => void;
};

export function ExperienceMapSelectedCard({
  item,
  onClose
}: ExperienceMapSelectedCardProps) {
  const t = useTranslations("MapPage");
  const locale = useLocale();

  return (
    <aside className="map-selected-card" aria-live="polite">
      <button
        type="button"
        className="map-selected-card__close"
        onClick={onClose}
        aria-label={t("selectedClose")}
      >
        <X size={18} aria-hidden />
      </button>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="map-selected-card__img" />
      ) : (
        <div className="map-selected-card__img map-selected-card__img--empty" />
      )}
      <div className="map-selected-card__body">
        <p className="map-selected-card__location">{item.location.name}</p>
        <h2 className="map-selected-card__title">{item.title}</h2>
        <PriceDisplay
          amountMinor={item.price.amountMinor}
          currency={item.price.currency}
          locale={locale}
        />
        <Link
          href={`/experiences/${item.slug}`}
          className="button button-coral map-selected-card__cta"
        >
          {t("list.viewDetails")}
        </Link>
      </div>
    </aside>
  );
}
