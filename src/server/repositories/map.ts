import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  filterMapItemsByLocationSlug,
  parseExperienceMapRows,
  type ExperienceMapItem
} from "@/lib/view-models/experience-map";
import {
  catalogFiltersToMapRpcParams,
  type MapRpcCallParams
} from "@/lib/url/map-rpc-params";
import type { CatalogFilters } from "@/lib/url/catalog-filters";

export type GetExperienceMapParams = MapRpcCallParams;

export type GetExperienceMapResult =
  | { ok: true; items: ExperienceMapItem[] }
  | { ok: false; error: "unavailable" | "query_failed" };

export type MapFilterTeamMemberOption = {
  id: string;
  slug: string;
  displayName: string;
};

export type MapFilterOptions = {
  experienceTypes: string[];
  teamMembers: MapFilterTeamMemberOption[];
  locations: Array<{ slug: string; name: string }>;
};

/**
 * Server-only wrapper around `get_experience_map`.
 * Distinguishes empty results from client/query failures.
 */
export async function getExperienceMapItems(
  params: GetExperienceMapParams = {}
): Promise<GetExperienceMapResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "unavailable" };
  }

  const { data, error } = await supabase.rpc("get_experience_map", {
    ...(params.from ? { p_from: params.from } : {}),
    ...(params.to ? { p_to: params.to } : {}),
    ...(params.experienceType
      ? { p_experience_type: params.experienceType }
      : {}),
    ...(params.teamMemberId ? { p_team_member_id: params.teamMemberId } : {})
  });

  if (error) {
    console.error("[getExperienceMapItems]", error.message);
    return { ok: false, error: "query_failed" };
  }

  return {
    ok: true,
    items: parseExperienceMapRows(data, process.env.NEXT_PUBLIC_SUPABASE_URL)
  };
}

/**
 * Fetch map items from catalog URL filters (RPC + optional client location slug).
 */
export async function getExperienceMapForFilters(
  filters: Pick<
    CatalogFilters,
    "date" | "experienceType" | "teamMember" | "location"
  >
): Promise<GetExperienceMapResult> {
  const rpcParams = catalogFiltersToMapRpcParams(filters);
  const result = await getExperienceMapItems(rpcParams);
  if (!result.ok) return result;

  return {
    ok: true,
    items: filterMapItemsByLocationSlug(result.items, filters.location)
  };
}

/**
 * Distinct filter options from published map inventory (no hardcoded enums).
 */
export async function listMapFilterOptions(): Promise<MapFilterOptions> {
  const empty: MapFilterOptions = {
    experienceTypes: [],
    teamMembers: [],
    locations: []
  };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;

  const result = await getExperienceMapItems({});
  if (!result.ok) return empty;

  const experienceTypes = [
    ...new Set(
      result.items
        .map((item) => item.experienceType)
        .filter((value): value is string => Boolean(value?.trim()))
    )
  ].sort((a, b) => a.localeCompare(b));

  const teamMemberMap = new Map<string, MapFilterTeamMemberOption>();
  for (const item of result.items) {
    for (const member of item.teamMembers) {
      if (!teamMemberMap.has(member.id)) {
        teamMemberMap.set(member.id, {
          id: member.id,
          slug: member.slug,
          displayName: member.displayName
        });
      }
    }
  }

  const locationMap = new Map<string, { slug: string; name: string }>();
  for (const item of result.items) {
    if (!locationMap.has(item.location.slug)) {
      locationMap.set(item.location.slug, {
        slug: item.location.slug,
        name: item.location.name
      });
    }
  }

  return {
    experienceTypes,
    teamMembers: [...teamMemberMap.values()].sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    ),
    locations: [...locationMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  };
}

export type { ExperienceMapItem };
