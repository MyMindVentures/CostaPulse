import { z } from "zod";
import { getExperienceMediaUrl } from "@/lib/media/experience-media";
import {
  parseTeamMemberSummaries,
  type TeamMemberSummary
} from "@/lib/view-models/team-member";

/** Raw row shape from `get_experience_map` (generated Database Functions types). */
export const experienceMapRpcRowSchema = z.object({
  experience_id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  short_description: z.string().nullable(),
  experience_type: z.string().nullable(),
  category_label: z.string().nullable(),
  hero_image_path: z.string().nullable(),
  duration_minutes: z.number().int().positive().nullable(),
  base_capacity: z.number().int().positive().nullable(),
  base_currency: z.string().nullable(),
  is_featured: z.boolean(),
  location_id: z.string().uuid(),
  location_slug: z.string().min(1),
  location_name: z.string().min(1),
  city: z.string().nullable(),
  province: z.string().nullable(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  map_zoom: z.coerce.number().int(),
  meeting_point: z.string().nullable(),
  team_members: z.unknown().nullable(),
  next_available_at: z.string().nullable(),
  available_slot_count: z.coerce.number().int().nonnegative(),
  from_price_minor: z.number().int().nonnegative().nullable()
});

export type ExperienceMapRpcRow = z.infer<typeof experienceMapRpcRowSchema>;

export type ExperienceMapItem = {
  /** Experience UUID — use for detail links. */
  id: string;
  /** Unique per experience × location row for map/list selection. */
  markerKey: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  experienceType: string | null;
  imageUrl: string | null;
  heroImagePath: string | null;
  durationMinutes: number | null;
  baseCapacity: number | null;
  isFeatured: boolean;
  price: {
    amountMinor: number | null;
    currency: string;
  };
  location: {
    id: string;
    slug: string;
    name: string;
    city: string | null;
    province: string | null;
    latitude: number;
    longitude: number;
    zoom: number;
    meetingPoint: string | null;
  };
  availability: {
    nextAvailableAt: string | null;
    slotCount: number;
  };
  teamMembers: TeamMemberSummary[];
};

const DEFAULT_MAP_CURRENCY = "EUR";

export function buildExperienceMapMarkerKey(
  experienceId: string,
  locationId: string
): string {
  return `${experienceId}:${locationId}`;
}

export function hasValidMapCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function mapExperienceMapRow(
  row: ExperienceMapRpcRow,
  supabaseUrl?: string
): ExperienceMapItem | null {
  if (!hasValidMapCoordinates(row.latitude, row.longitude)) {
    return null;
  }

  const currency =
    row.base_currency?.trim().toUpperCase().slice(0, 3) || DEFAULT_MAP_CURRENCY;

  return {
    id: row.experience_id,
    markerKey: buildExperienceMapMarkerKey(row.experience_id, row.location_id),
    slug: row.slug,
    title: row.title,
    description: row.short_description,
    category: row.category_label,
    experienceType: row.experience_type,
    imageUrl: getExperienceMediaUrl(row.hero_image_path, supabaseUrl),
    heroImagePath: row.hero_image_path,
    durationMinutes: row.duration_minutes,
    baseCapacity: row.base_capacity,
    isFeatured: row.is_featured,
    price: {
      amountMinor: row.from_price_minor,
      currency
    },
    location: {
      id: row.location_id,
      slug: row.location_slug,
      name: row.location_name,
      city: row.city,
      province: row.province,
      latitude: row.latitude,
      longitude: row.longitude,
      zoom: row.map_zoom,
      meetingPoint: row.meeting_point
    },
    availability: {
      nextAvailableAt: row.next_available_at,
      slotCount: row.available_slot_count
    },
    teamMembers: parseTeamMemberSummaries(row.team_members)
  };
}

export function parseExperienceMapRows(
  rows: unknown,
  supabaseUrl?: string
): ExperienceMapItem[] {
  if (!Array.isArray(rows)) return [];

  const items: ExperienceMapItem[] = [];
  for (const row of rows) {
    const parsed = experienceMapRpcRowSchema.safeParse(row);
    if (!parsed.success) continue;
    const item = mapExperienceMapRow(parsed.data, supabaseUrl);
    if (item) items.push(item);
  }
  return items;
}

/**
 * Resolve selected marker from URL `experience` (slug) + optional `location` (slug).
 */
export function resolveSelectedMarkerKey(
  items: ExperienceMapItem[],
  experienceSlug: string | null,
  locationSlug: string | null
): string | null {
  if (!experienceSlug) return null;

  const matches = items.filter((item) => item.slug === experienceSlug);
  if (matches.length === 0) return null;

  if (locationSlug) {
    const withLocation = matches.find(
      (item) => item.location.slug === locationSlug
    );
    if (withLocation) return withLocation.markerKey;
  }

  return matches[0]?.markerKey ?? null;
}

export function filterMapItemsByLocationSlug(
  items: ExperienceMapItem[],
  locationSlug: string | null
): ExperienceMapItem[] {
  if (!locationSlug) return items;
  return items.filter((item) => item.location.slug === locationSlug);
}
