export const CATALOG_FILTER_KEYS = [
  "date",
  "experienceType",
  "location",
  "teamMember",
  "experience",
  "view"
] as const;

export type CatalogFilterKey = (typeof CATALOG_FILTER_KEYS)[number];

export type CatalogViewMode = "map" | "list";

export type CatalogFilters = {
  date: string | null;
  experienceType: string | null;
  location: string | null;
  teamMember: string | null;
  experience: string | null;
  view: CatalogViewMode | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readString(
  params: URLSearchParams,
  key: CatalogFilterKey
): string | null {
  const value = params.get(key)?.trim();
  return value ? value : null;
}

function parseView(value: string | null): CatalogViewMode | null {
  if (value === "map" || value === "list") return value;
  return null;
}

/**
 * Parse catalog/map filter state from URL search params.
 * Invalid dates and views are ignored (null) rather than thrown.
 */
export function parseCatalogFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): CatalogFilters {
  const search =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params).flatMap(([key, value]) => {
            if (typeof value === "string") return [[key, value]];
            if (Array.isArray(value) && value[0]) return [[key, value[0]]];
            return [];
          })
        );

  const dateRaw = readString(search, "date");
  const date = dateRaw && DATE_PATTERN.test(dateRaw) ? dateRaw : null;

  return {
    date,
    experienceType: readString(search, "experienceType"),
    location: readString(search, "location"),
    teamMember: readString(search, "teamMember"),
    experience: readString(search, "experience"),
    view: parseView(readString(search, "view"))
  };
}

export type CatalogFilterPatch = Partial<CatalogFilters>;

/**
 * Merge filter updates into existing search params without dropping
 * unrelated keys (locale, referral, booking context, etc.).
 * Setting a filter to null removes it.
 */
export function applyCatalogFilters(
  current: URLSearchParams,
  patch: CatalogFilterPatch
): URLSearchParams {
  const next = new URLSearchParams(current.toString());

  for (const key of CATALOG_FILTER_KEYS) {
    if (!(key in patch)) continue;
    const value = patch[key];
    if (value == null || value === "") {
      next.delete(key);
      continue;
    }
    next.set(key, value);
  }

  return next;
}

export function catalogFiltersToSearchParams(
  filters: CatalogFilters,
  base?: URLSearchParams
): URLSearchParams {
  return applyCatalogFilters(base ?? new URLSearchParams(), filters);
}

export function catalogFiltersEqual(
  a: CatalogFilters,
  b: CatalogFilters
): boolean {
  return CATALOG_FILTER_KEYS.every((key) => a[key] === b[key]);
}
