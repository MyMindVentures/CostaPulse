import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseExperienceCalendarRows,
  type ExperienceCalendarSlot
} from "@/lib/view-models/experience-calendar";

export type GetExperienceCalendarParams = {
  experienceId: string;
  from: string;
  to: string;
  locationId?: string | null;
  teamMemberId?: string | null;
};

/**
 * Server-only wrapper around `get_experience_calendar`.
 * Returns validated view models; empty array when the client is unavailable or the RPC fails.
 */
export async function getExperienceCalendarSlots(
  params: GetExperienceCalendarParams
): Promise<ExperienceCalendarSlot[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_experience_calendar", {
    p_experience_id: params.experienceId,
    p_from: params.from,
    p_to: params.to,
    p_location_id: params.locationId ?? undefined,
    p_team_member_id: params.teamMemberId ?? undefined
  });

  if (error || !data) return [];

  return parseExperienceCalendarRows(data);
}

export type { ExperienceCalendarSlot };
