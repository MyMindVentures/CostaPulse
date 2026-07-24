import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ExperienceHighlight = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  durationMinutes: number;
  baseCapacity: number;
  locationName: string | null;
};

export async function getPublishedExperienceHighlights(
  limit = 3
): Promise<ExperienceHighlight[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("experiences")
    .select(
      "id, slug, title, short_description, duration_minutes, base_capacity, location_name"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((experience) => ({
    id: experience.id,
    slug: experience.slug,
    title: experience.title,
    shortDescription: experience.short_description,
    durationMinutes: experience.duration_minutes,
    baseCapacity: experience.base_capacity,
    locationName: experience.location_name
  }));
}
