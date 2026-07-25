"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CatalogViewMode } from "@/lib/url/catalog-filters";

type MapListToggleProps = {
  view: CatalogViewMode;
  onChange: (view: CatalogViewMode) => void;
  className?: string;
};

export function MapListToggle({
  view,
  onChange,
  className
}: MapListToggleProps) {
  const t = useTranslations("MapPage");

  return (
    <div
      className={cn(
        "map-view-toggle border-border inline-flex gap-1 rounded-full border bg-white p-1",
        className
      )}
      role="group"
      aria-label={t("viewToggleLabel")}
    >
      <button
        type="button"
        className={cn("map-view-toggle__btn", view === "map" && "is-active")}
        aria-pressed={view === "map"}
        onClick={() => onChange("map")}
      >
        {t("viewMap")}
      </button>
      <button
        type="button"
        className={cn("map-view-toggle__btn", view === "list" && "is-active")}
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
      >
        {t("viewList")}
      </button>
    </div>
  );
}
