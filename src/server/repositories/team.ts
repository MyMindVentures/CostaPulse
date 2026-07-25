import "server-only";

import { getTeamMemberPhotoUrl } from "@/lib/media/experience-media";
import {
  mapPublishedTeamMember,
  publishedTeamMemberSchema,
  type TeamMemberViewModel
} from "@/lib/view-models/team-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PUBLISHED_TEAM_SELECT = `
  id,
  slug,
  first_name,
  last_name,
  display_name,
  role_title,
  short_bio,
  bio,
  tagline,
  photo_path,
  photo_alt_text,
  home_base,
  languages,
  years_experience,
  certifications,
  hobbies,
  is_featured,
  display_order,
  team_member_specialties (
    id,
    title,
    description,
    icon_key,
    display_order
  )
`;

export async function getPublishedTeamMembers(): Promise<
  TeamMemberViewModel[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select(PUBLISHED_TEAM_SELECT)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load published team members: ${error.message}`);
  }

  return publishedTeamMemberSchema
    .array()
    .parse(data ?? [])
    .map((row) =>
      mapPublishedTeamMember(row, getTeamMemberPhotoUrl(row.photo_path))
    );
}
