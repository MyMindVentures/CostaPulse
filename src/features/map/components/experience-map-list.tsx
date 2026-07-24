"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { ExperienceMapListItem } from "./experience-map-list-item";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";

type ExperienceMapListProps = {
  items: ExperienceMapItem[];
  selectedMarkerKey: string | null;
  onSelect: (markerKey: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

export function ExperienceMapList({
  items,
  selectedMarkerKey,
  onSelect,
  onClearFilters,
  hasActiveFilters
}: ExperienceMapListProps) {
  const t = useTranslations("MapPage");

  if (items.length === 0) {
    return (
      <EmptyState
        className="map-empty"
        title={t("empty.title")}
        description={t("empty.description")}
      >
        {hasActiveFilters ? (
          <button
            type="button"
            className="button button-coral"
            onClick={onClearFilters}
          >
            {t("empty.clear")}
          </button>
        ) : null}
      </EmptyState>
    );
  }

  return (
    <ul className="map-list" aria-label={t("resultsRegionLabel")}>
      {items.map((item) => (
        <li key={item.markerKey}>
          <ExperienceMapListItem
            item={item}
            selected={item.markerKey === selectedMarkerKey}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
