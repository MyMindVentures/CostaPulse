"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { PriceDisplay } from "@/components/shared/price-display";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";

type ExperienceMapPopupProps = {
  items: ExperienceMapItem[];
  onClose: () => void;
  onSelect: (markerKey: string) => void;
};

export function ExperienceMapPopupContent({
  items,
  onClose,
  onSelect
}: ExperienceMapPopupProps) {
  const t = useTranslations("MapPage");
  const locale = useLocale();

  if (items.length === 0) return null;

  return (
    <div className="map-popup">
      <div className="map-popup__header">
        <button
          type="button"
          className="map-popup__close"
          onClick={onClose}
          aria-label={t("popupClose")}
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      <ul className="map-popup__list">
        {items.map((item) => (
          <li key={item.markerKey}>
            <button
              type="button"
              className="map-popup__item"
              onClick={() => onSelect(item.markerKey)}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="map-popup__img" />
              ) : (
                <div className="map-popup__img map-popup__img--empty" />
              )}
              <div className="map-popup__body">
                <p className="map-popup__title">{item.title}</p>
                <p className="map-popup__location">{item.location.name}</p>
                <PriceDisplay
                  amountMinor={item.price.amountMinor}
                  currency={item.price.currency}
                  locale={locale}
                  className="map-popup__price"
                />
              </div>
            </button>
            <Link href={`/experiences/${item.slug}`} className="map-popup__cta">
              {t("list.viewDetails")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
