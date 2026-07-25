"use client";

import { useEffect, useId, useMemo, useRef, type FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Compass,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  X
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  applyCatalogFilters,
  type CatalogFilters
} from "@/lib/url/catalog-filters";
import type { MapFilterOptions } from "@/lib/view-models/experience-map";

type ExperienceMapFiltersProps = {
  filters: CatalogFilters;
  options: MapFilterOptions;
};

function humanizeType(value: string): string {
  return value.replace(/_/g, " ");
}

export function ExperienceMapFilters({
  filters,
  options
}: ExperienceMapFiltersProps) {
  const t = useTranslations("MapPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const activeFilterCount = [
    filters.date,
    filters.experienceType,
    filters.teamMember,
    filters.location
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const filterKey = useMemo(
    () =>
      [
        filters.date,
        filters.experienceType,
        filters.teamMember,
        filters.location
      ].join("|"),
    [filters.date, filters.experienceType, filters.teamMember, filters.location]
  );

  useEffect(() => {
    // Desktop: keep dialog open as a static panel (non-modal).
    const dialog = dialogRef.current;
    if (!dialog) return;
    const mq = window.matchMedia("(min-width: 768px)");
    function sync() {
      if (!dialog) return;
      if (mq.matches) {
        if (!dialog.open) dialog.show();
      } else if (dialog.open && !dialog.matches(":modal")) {
        dialog.close();
      }
    }
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function pushPatch(patch: Partial<CatalogFilters>) {
    const next = applyCatalogFilters(
      new URLSearchParams(searchParams.toString()),
      patch
    );
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    pushPatch({
      date: String(form.get("date") ?? "").trim() || null,
      experienceType: String(form.get("experienceType") ?? "").trim() || null,
      teamMember: String(form.get("teamMember") ?? "").trim() || null,
      location: String(form.get("location") ?? "").trim() || null
    });
    const dialog = dialogRef.current;
    if (dialog?.matches(":modal")) dialog.close();
  }

  function handleClear() {
    pushPatch({
      date: null,
      experienceType: null,
      teamMember: null,
      location: null
    });
    const dialog = dialogRef.current;
    if (dialog?.matches(":modal")) dialog.close();
  }

  return (
    <div className="map-filters-wrap">
      <div className="md:hidden">
        <button
          type="button"
          className="button button-outline map-filters-open"
          onClick={() => dialogRef.current?.showModal()}
        >
          <SlidersHorizontal aria-hidden />
          {t("openFilters")}
          {hasActiveFilters ? (
            <span className="map-filters-open__count" aria-hidden>
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <dialog ref={dialogRef} className="map-filters-dialog">
        <div className="map-filters-dialog__inner">
          <div className="map-filters-dialog__header">
            <h2>{t("filtersTitle")}</h2>
            <button
              type="button"
              className="map-filters-dialog__close"
              onClick={() => dialogRef.current?.close()}
              aria-label={t("closeFilters")}
            >
              <X aria-hidden />
            </button>
          </div>

          <form
            key={filterKey}
            id={formId}
            className="map-filters"
            onSubmit={handleSubmit}
            aria-label={t("filtersTitle")}
          >
            <div className="map-filters__field">
              <Label htmlFor={`${formId}-date`}>{t("filters.date")}</Label>
              <div className="map-filters__control">
                <CalendarDays aria-hidden />
                <Input
                  id={`${formId}-date`}
                  name="date"
                  type="date"
                  className="map-filters__input"
                  defaultValue={filters.date ?? ""}
                  aria-describedby={`${formId}-date-hint`}
                />
              </div>
              <p id={`${formId}-date-hint`} className="sr-only">
                {t("filters.dateHint")}
              </p>
            </div>

            <div className="map-filters__field">
              <Label htmlFor={`${formId}-type`}>
                {t("filters.experienceType")}
              </Label>
              <div className="map-filters__control">
                <Compass aria-hidden />
                <select
                  id={`${formId}-type`}
                  name="experienceType"
                  className="map-filters__select"
                  defaultValue={filters.experienceType ?? ""}
                >
                  <option value="">{t("filters.experienceTypeAll")}</option>
                  {options.experienceTypes.map((type) => (
                    <option key={type} value={type}>
                      {humanizeType(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="map-filters__field">
              <Label htmlFor={`${formId}-team`}>
                {t("filters.teamMember")}
              </Label>
              <div className="map-filters__control">
                <UserRound aria-hidden />
                <select
                  id={`${formId}-team`}
                  name="teamMember"
                  className="map-filters__select"
                  defaultValue={filters.teamMember ?? ""}
                >
                  <option value="">{t("filters.teamMemberAll")}</option>
                  {options.teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="map-filters__field">
              <Label htmlFor={`${formId}-location`}>
                {t("filters.location")}
              </Label>
              <div className="map-filters__control">
                <MapPin aria-hidden />
                <select
                  id={`${formId}-location`}
                  name="location"
                  className="map-filters__select"
                  defaultValue={filters.location ?? ""}
                >
                  <option value="">{t("filters.locationAll")}</option>
                  {options.locations.map((location) => (
                    <option key={location.slug} value={location.slug}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="map-filters__actions">
              <button
                type="submit"
                className="button button-coral map-filters__apply"
              >
                <Search aria-hidden />
                {t("filters.apply")}
              </button>
              <button
                type="button"
                className="button button-outline map-filters__clear"
                onClick={handleClear}
                disabled={!hasActiveFilters}
              >
                <RotateCcw aria-hidden />
                {t("filters.clear")}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
