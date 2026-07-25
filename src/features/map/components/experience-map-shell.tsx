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
    <main className="map-page min-h-svh">
      <header className="map-page__header">
        <Container className="map-page__hero py-8 pb-12">
          <p className="eyebrow">
            <span />
            {t("kicker")}
          </p>
          <h1 className="my-4 max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95]">
            {t("title")}
          </h1>
          <p className="max-w-xl leading-relaxed text-white/75">
            {t("description")}
          </p>
        </Container>
      </header>

      <Container className="map-page__body grid gap-5 py-6 pb-12">
        <div className="map-page__toolbar grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <p
            className="map-page__count text-navy m-0 font-semibold"
            aria-live="polite"
          >
            {t("resultsLabel", { count: items.length })}
            {isPending ? "…" : null}
          </p>
          <MapListToggle
            view={view}
            onChange={handleViewChange}
            className="map-page__toggle md:!hidden"
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
            className={`map-page__layout is-view-${view} grid min-h-[min(70svh,40rem)] gap-4 md:min-h-[min(72svh,44rem)] md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]`}
            data-pending={isPending ? "true" : "false"}
          >
            <section
              className={
                view === "map"
                  ? "map-page__list-panel hidden min-h-0 md:block"
                  : "map-page__list-panel min-h-0"
              }
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
              className={
                view === "list"
                  ? "map-page__map-panel border-border bg-sand relative hidden min-h-[22rem] overflow-hidden rounded-[1.25rem] border md:sticky md:top-[calc(var(--shell-nav-height)+0.75rem)] md:block md:h-[min(72svh,44rem)] md:min-h-[min(72svh,44rem)]"
                  : "map-page__map-panel border-border bg-sand relative min-h-[22rem] overflow-hidden rounded-[1.25rem] border md:sticky md:top-[calc(var(--shell-nav-height)+0.75rem)] md:h-[min(72svh,44rem)] md:min-h-[min(72svh,44rem)]"
              }
              aria-label={t("mapRegionLabel")}
            >
              <ExperienceMapCanvas
                items={items}
                selectedMarkerKey={selectedMarkerKey}
                onSelect={handleSelect}
                styleUrl={mapStyleUrl}
              />
              {selectedItem && view === "map" ? (
                <div className="map-page__mobile-card md:hidden">
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
