export const PARTNER_SORTS = [
  "bookings",
  "scans",
  "conversion",
  "newest",
  "alphabetical"
] as const;
export type PartnerSort = (typeof PARTNER_SORTS)[number];
export type PartnerView = "map" | "list";
export type PartnerDirectoryFilters = {
  partner: string | null;
  category: string | null;
  area: string | null;
  featured: boolean;
  sort: PartnerSort;
  view: PartnerView;
  query: string | null;
};

export function parsePartnerDirectoryFilters(
  input: URLSearchParams | Record<string, string | string[] | undefined>
): PartnerDirectoryFilters {
  const params =
    input instanceof URLSearchParams
      ? input
      : new URLSearchParams(
          Object.entries(input).flatMap(([key, value]) =>
            typeof value === "string" ? [[key, value]] : []
          )
        );
  const read = (key: string) => params.get(key)?.trim() || null;
  const sort = read("sort");
  return {
    partner: read("partner"),
    category: read("category"),
    area: read("area"),
    featured: read("featured") === "true",
    sort: PARTNER_SORTS.includes(sort as PartnerSort)
      ? (sort as PartnerSort)
      : "bookings",
    view: read("view") === "list" ? "list" : "map",
    query: read("q")
  };
}

export function applyPartnerDirectoryFilters(
  current: URLSearchParams,
  patch: Partial<PartnerDirectoryFilters>
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    const queryKey = key === "query" ? "q" : key;
    if (
      value == null ||
      value === "" ||
      value === false ||
      (key === "view" && value === "map") ||
      (key === "sort" && value === "bookings")
    ) {
      next.delete(queryKey);
    } else {
      next.set(queryKey, String(value));
    }
  }
  return next;
}
