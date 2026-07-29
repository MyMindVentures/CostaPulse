import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAvailabilityReferenceData = {
  teamMembers: Array<{ id: string; name: string }>;
  professionalServices: Array<{ id: string; title: string }>;
  experiences: Array<{ id: string; title: string }>;
  variants: Array<{ id: string; experienceId: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
};

export type AdminAvailabilityRow = {
  id: string;
  team_member_id: string;
  professional_service_id: string | null;
  experience_id: string | null;
  experience_variant_id: string | null;
  availability_slot_id: string | null;
  entry_type: string;
  status: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  is_all_day: boolean;
  public_title: string | null;
  public_summary: string | null;
  public_location_label: string | null;
  geographic_scope: string | null;
  travel_available: boolean;
  capacity_total: number | null;
  capacity_reserved: number;
  visibility: string;
  cta_type: string | null;
  cta_path: string | null;
  internal_notes: string | null;
};

export async function fetchAdminAvailabilityReferenceData(): Promise<AdminAvailabilityReferenceData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is unavailable");

  const [team, services, experiences, variants, locations] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, display_name, first_name, last_name")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("professional_services")
      .select("id, title")
      .order("sort_order"),
    supabase.from("experiences").select("id, title").order("title"),
    supabase
      .from("experience_variants")
      .select("id, experience_id, name")
      .eq("is_active", true)
      .order("name"),
    supabase.from("locations").select("id, name").order("name")
  ]);

  const firstError = [
    team.error,
    services.error,
    experiences.error,
    variants.error,
    locations.error
  ].find(Boolean);
  if (firstError) throw new Error(firstError.message);

  return {
    teamMembers: (team.data ?? []).map((row) => ({
      id: row.id,
      name: row.display_name ?? `${row.first_name} ${row.last_name}`.trim()
    })),
    professionalServices: services.data ?? [],
    experiences: experiences.data ?? [],
    variants: (variants.data ?? []).map((row) => ({
      id: row.id,
      experienceId: row.experience_id,
      name: row.name
    })),
    locations: locations.data ?? []
  };
}

export async function fetchAdminTeamMemberAvailability(input: {
  from: string;
  to: string;
  teamMemberId?: string | null;
}): Promise<AdminAvailabilityRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is unavailable");

  let query = supabase
    .from("team_member_availability")
    .select(
      "id, team_member_id, professional_service_id, experience_id, experience_variant_id, availability_slot_id, entry_type, status, starts_at, ends_at, timezone, is_all_day, public_title, public_summary, public_location_label, geographic_scope, travel_available, capacity_total, capacity_reserved, visibility, cta_type, cta_path, internal_notes"
    )
    .lt("starts_at", input.to)
    .gt("ends_at", input.from)
    .order("starts_at");

  if (input.teamMemberId) {
    query = query.eq("team_member_id", input.teamMemberId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminAvailabilityRow[];
}
