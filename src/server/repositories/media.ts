import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mapPublishedMediaPlacement,
  type PublishedMediaPlacementRow,
  type ResolvedMediaPlacement
} from "@/lib/media/media-placement";

export async function getPublishedMediaPlacements(
  scopeType: string,
  scopeKeys: string[]
): Promise<Map<string, ResolvedMediaPlacement[]>> {
  const grouped = new Map<string, ResolvedMediaPlacement[]>();
  if (scopeKeys.length === 0) return grouped;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return grouped;

  const { data, error } = await supabase
    // The consolidated view exists in production. Generated database types are
    // refreshed independently, so keep this query build-safe during that gap.
    // @ts-expect-error published_media_assets is newer than database.ts
    .from("published_media_assets")
    .select("*")
    .eq("scope_type", scopeType)
    .in("scope_key", scopeKeys)
    .order("display_order", { ascending: true });

  if (error || !data) return grouped;

  for (const raw of data as unknown as PublishedMediaPlacementRow[]) {
    const mapped = mapPublishedMediaPlacement(raw);
    const list = grouped.get(raw.scope_key) ?? [];
    list.push(mapped);
    grouped.set(raw.scope_key, list);
  }

  return grouped;
}
