import type { CatalogFilters } from "@/lib/url/catalog-filters";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

export type MapRpcDateRange = {
  from: string;
  to: string;
};

/**
 * Map a catalog calendar date (YYYY-MM-DD) to an inclusive UTC day range
 * for `get_experience_map` `p_from` / `p_to`.
 */
export function catalogDateToRpcRange(
  date: string | null
): MapRpcDateRange | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const from = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(from.getTime())) return null;

  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);

  return {
    from: from.toISOString(),
    to: to.toISOString()
  };
}

export type MapRpcCallParams = {
  from?: string;
  to?: string;
  experienceType?: string;
  teamMemberId?: string;
};

/**
 * Build RPC args from catalog filters.
 * Omits date bounds when unset so Postgres defaults (now → +90d) apply.
 * Ignores non-UUID teamMember values safely.
 */
export function catalogFiltersToMapRpcParams(
  filters: Pick<CatalogFilters, "date" | "experienceType" | "teamMember">
): MapRpcCallParams {
  const range = catalogDateToRpcRange(filters.date);
  const experienceType = filters.experienceType?.trim() || undefined;
  const teamMemberId = isUuid(filters.teamMember)
    ? filters.teamMember.trim()
    : undefined;

  return {
    ...(range ? { from: range.from, to: range.to } : {}),
    ...(experienceType ? { experienceType } : {}),
    ...(teamMemberId ? { teamMemberId } : {})
  };
}
