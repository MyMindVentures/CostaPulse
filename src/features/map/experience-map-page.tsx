import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { LoadingState } from "@/components/shared/loading-state";
import { parseCatalogFilters } from "@/lib/url/catalog-filters";
import { resolveMapStyleUrl } from "@/lib/map/config";
import { resolveSelectedMarkerKey } from "@/lib/view-models/experience-map";
import {
  getExperienceMapForFilters,
  listMapFilterOptions
} from "@/server/repositories/map";
import { ExperienceMapShell } from "./components/experience-map-shell";

type ExperienceMapPageFeatureProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function ExperienceMapPageFeature({
  searchParams
}: ExperienceMapPageFeatureProps) {
  const [t, locale] = await Promise.all([
    getTranslations("MapPage"),
    getLocale()
  ]);
  const filters = parseCatalogFilters(searchParams);

  const [mapResult, options] = await Promise.all([
    getExperienceMapForFilters(filters, locale),
    listMapFilterOptions(locale)
  ]);

  const items = mapResult.ok ? mapResult.items : [];
  const selectedMarkerKey = resolveSelectedMarkerKey(
    items,
    filters.experience,
    filters.location
  );

  return (
    <Suspense fallback={<LoadingState label={t("loading")} rows={4} />}>
      <ExperienceMapShell
        items={items}
        filters={filters}
        options={options}
        selectedMarkerKey={selectedMarkerKey}
        loadError={!mapResult.ok}
        mapStyleUrl={resolveMapStyleUrl()}
      />
    </Suspense>
  );
}
