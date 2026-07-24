"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/shared/error-state";
import {
  applyCatalogFilters,
  type CatalogFilters,
  type CatalogViewMode
} from "@/lib/url/catalog-filters";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";
import type { MapFilterOptions } from "@/lib/view-models/experience-map";
import { ExperienceMapFilters } from "./experience-map-filters";
import { ExperienceMapList } from "./experience-map-list";
import { ExperienceMapSelectedCard } from "./experience-map-selected-card";
import { MapListToggle } from "./map-list-toggle";

const ExperienceMapCanvas = dynamic(
  () =>
    import("./experience-map-canvas").then((mod) => mod.ExperienceMapCanvas),
  {
    ssr: false,
    loading: () => <div className="map-canvas map-canvas--skeleton" />
  }
);

type ExperienceMapShellProps = {
  items: ExperienceMapItem[];
  filters: CatalogFilters;
  options: MapFilterOptions;
  selectedMarkerKey: string | null;
  loadError: boolean;
  mapStyleUrl: string;
};

function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.date ||
      filters.experienceType ||
      filters.teamMember ||
      filters.location
  );
}

export function ExperienceMapShell({
  items,
  filters,
  options,
  selectedMarkerKey,
  loadError,
  mapStyleUrl
}: ExperienceMapShellProps) {
  const t = useTranslations("MapPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const view: CatalogViewMode = filters.view ?? "map";

  const selectedItem = useMemo(
    () => items.find((item) => item.markerKey === selectedMarkerKey) ?? null,
    [items, selectedMarkerKey]
  );

  useEffect(() => {
    if (!selectedMarkerKey) return;
    const node = document.getElementById(`map-list-item-${selectedMarkerKey}`);
    node?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });
  }, [selectedMarkerKey]);

  function pushPatch(patch: Partial<CatalogFilters>) {
    const next = applyCatalogFilters(
      new URLSearchParams(searchParams.toString()),
      patch
    );
    const query = next.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false
      });
    });
  }

  function handleSelect(markerKey: string | null) {
    if (!markerKey) {
      pushPatch({ experience: null, location: null });
      return;
    }
    const item = items.find((entry) => entry.markerKey === markerKey);
    if (!item) return;
    pushPatch({
      experience: item.slug,
      location: item.location.slug
    });
  }

  function handleViewChange(nextView: CatalogViewMode) {
    pushPatch({ view: nextView });
  }

  function clearFilters() {
    pushPatch({
      date: null,
      experienceType: null,
      teamMember: null,
      location: null,
      experience: null
    });
  }

  return (
    <main className="map-page">
      <header className="map-page__header">
        <Container className="map-page__hero">
          <p className="eyebrow">
            <span />
            {t("kicker")}
          </p>
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </Container>
      </header>

      <Container className="map-page__body">
        <div className="map-page__toolbar">
          <p className="map-page__count" aria-live="polite">
            {t("resultsLabel", { count: items.length })}
            {isPending ? "…" : null}
          </p>
          <MapListToggle
            view={view}
            onChange={handleViewChange}
            className="map-page__toggle"
          />
          <ExperienceMapFilters filters={filters} options={options} />
        </div>

        {loadError ? (
          <ErrorState
            title={t("error.title")}
            description={t("error.description")}
            retryLabel={t("error.retry")}
            onRetry={() => router.refresh()}
          />
        ) : (
          <div
            className={`map-page__layout is-view-${view}`}
            data-pending={isPending ? "true" : "false"}
          >
            <section
              className="map-page__list-panel"
              aria-label={t("resultsRegionLabel")}
            >
              <ExperienceMapList
                items={items}
                selectedMarkerKey={selectedMarkerKey}
                onSelect={handleSelect}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters(filters)}
              />
            </section>

            <section
              className="map-page__map-panel"
              aria-label={t("mapRegionLabel")}
            >
              <ExperienceMapCanvas
                items={items}
                selectedMarkerKey={selectedMarkerKey}
                onSelect={handleSelect}
                styleUrl={mapStyleUrl}
              />
              {selectedItem && view === "map" ? (
                <div className="map-page__mobile-card">
                  <ExperienceMapSelectedCard
                    item={selectedItem}
                    onClose={() => handleSelect(null)}
                  />
                </div>
              ) : null}
            </section>
          </div>
        )}
      </Container>
    </main>
  );
}
