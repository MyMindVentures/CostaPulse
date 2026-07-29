import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parsePublicAvailabilityEntries,
  type AvailabilityServiceFilter,
  type AvailabilityStatus,
  type PublicAvailabilityEntry
} from "@/lib/view-models/team-member-availability";

export class AvailabilityRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityRepositoryError";
  }
}

export type PublicAvailabilityQuery = {
  teamMemberSlug: string;
  rangeStart: string;
  rangeEnd: string;
  locale: string;
  serviceCategory?: AvailabilityServiceFilter | null;
  status?: AvailabilityStatus | null;
  availableOnly?: boolean;
  location?: string | null;
};

export async function getPrimaryAvailabilityOwnerSlug(): Promise<
  string | null
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("team_members")
    .select("slug")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AvailabilityRepositoryError(error.message);
  }

  return data?.slug ?? null;
}

export async function getPublicTeamMemberAvailability(
  query: PublicAvailabilityQuery
): Promise<PublicAvailabilityEntry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new AvailabilityRepositoryError("Availability service unavailable");
  }

  const { data, error } = await supabase.rpc(
    "get_public_team_member_availability",
    {
      p_team_member_slug: query.teamMemberSlug,
      p_range_start: query.rangeStart,
      p_range_end: query.rangeEnd,
      p_locale: query.locale,
      p_service_category: "",
      p_status: query.status ?? "",
      p_available_only: query.availableOnly ?? false,
      p_location: query.location ?? "",
      p_service_filter: query.serviceCategory ?? ""
    }
  );

  if (error) {
    throw new AvailabilityRepositoryError(error.message);
  }

  return parsePublicAvailabilityEntries(data ?? []);
}
