import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aggregatePublishedRatings } from "@/features/experiences/card-data";
import {
  experienceCardSchema,
  type ExperienceCardViewModel
} from "@/lib/view-models/experience-card";
import { selectPreferredPlacement } from "@/lib/media/media-placement";
import { getPublishedMediaPlacements } from "@/server/repositories/media";
import { summarizeAvailabilityFromSlots } from "@/server/availability/summarize";

export type { ExperienceCardViewModel };

export type ExperienceDetailVariant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pricingModel: "per_person" | "per_group";
  unitAmountMinor: number;
  currency: string;
  minPartySize: number;
  maxPartySize: number | null;
  durationMinutes: number | null;
  subtitle: string | null;
  badgeLabel: string | null;
  isDefault: boolean;
};

export type ExperienceDetailMedia = {
  id: string;
  assetKey: string;
  placementKey: string;
  role: string;
  breakpoint: string;
  storagePath: string;
  url: string | null;
  mediaType: string;
  mimeType: string | null;
  altText: string | null;
  caption: string | null;
  focalX: number;
  focalY: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  displayOrder: number;
  isPrimary: boolean;
};

export type ExperienceDetailLocation = {
  id: string;
  name: string;
  slug: string;
  isPrimary: boolean;
  addressLine1: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  meetingInstructions: string | null;
  displayOrder: number;
};

export type ExperienceDetailViewModel = ExperienceCardViewModel & {
  highlights: string[];
  inclusions: string[];
  timezone: string;
  media: ExperienceDetailMedia[];
  variants: ExperienceDetailVariant[];
  languages: Array<{
    code: string;
    displayName: string;
    isPrimary: boolean;
  }>;
  itinerary: Array<{
    id: string;
    title: string;
    description: string | null;
    startsAfterMinutes: number | null;
    durationMinutes: number | null;
    displayOrder: number;
  }>;
  requirements: Array<{
    id: string;
    requirementType: string;
    title: string;
    description: string | null;
    isMandatory: boolean;
    displayOrder: number;
  }>;
  policies: Array<{
    id: string;
    policyType: string;
    title: string;
    description: string | null;
    valueMinutes: number | null;
    displayOrder: number;
  }>;
  locations: ExperienceDetailLocation[];
  availabilitySummary: string | null;
  reviews: {
    averageRating: number | null;
    reviewCount: number;
    items: Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      publishedAt: string | null;
    }>;
  };
};

type CardExperienceRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  duration_minutes: number;
  base_capacity: number;
  location_name: string | null;
  category_label: string | null;
  experience_type?: string | null;
  highlights?: unknown;
  provider:
    | { display_name: string | null }
    | Array<{ display_name: string | null }>
    | null;
  experience_variants: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    pricing_model: "per_person" | "per_group";
    unit_amount_minor: number;
    currency: string;
    min_party_size: number;
    max_party_size: number | null;
    is_default: boolean;
    is_active: boolean;
  }> | null;
  reviews?: Array<{
    id?: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    status: string;
    published_at?: string | null;
  }> | null;
};

type DetailExperienceRow = Omit<
  CardExperienceRow,
  "experience_variants" | "reviews"
> & {
  timezone: string;
  inclusions: unknown;
  experience_variants: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    pricing_model: "per_person" | "per_group";
    unit_amount_minor: number;
    currency: string;
    min_party_size: number;
    max_party_size: number | null;
    is_default: boolean;
    is_active: boolean;
    duration_minutes: number | null;
    subtitle: string | null;
    badge_label: string | null;
  }> | null;
  experience_languages: Array<{
    language_code: string;
    display_name: string;
    is_primary: boolean;
  }> | null;
  experience_itinerary_steps: Array<{
    id: string;
    title: string;
    description: string | null;
    starts_after_minutes: number | null;
    duration_minutes: number | null;
    display_order: number;
  }> | null;
  experience_requirements: Array<{
    id: string;
    requirement_type: string;
    title: string;
    description: string | null;
    is_mandatory: boolean;
    display_order: number;
  }> | null;
  experience_policies: Array<{
    id: string;
    policy_type: string;
    title: string;
    description: string | null;
    value_minutes: number | null;
    is_active: boolean;
    display_order: number;
  }> | null;
  experience_locations: Array<{
    is_primary: boolean;
    display_order: number;
    is_active: boolean;
    meeting_point_override: string | null;
    location: {
      id: string;
      name: string;
      slug: string;
      address_line_1: string | null;
      city: string | null;
      latitude: number | string | null;
      longitude: number | string | null;
      meeting_point_notes: string | null;
      is_active: boolean;
    } | null;
  }> | null;
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    status: string;
    published_at: string | null;
  }> | null;
};

function getProviderName(
  provider: CardExperienceRow["provider"]
): string | null {
  if (Array.isArray(provider)) return provider[0]?.display_name ?? null;
  return provider?.display_name ?? null;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCardExperience(
  row: CardExperienceRow,
  media: Awaited<ReturnType<typeof getPublishedMediaPlacements>> extends Map<
    string,
    infer T
  >
    ? T
    : never
): ExperienceCardViewModel {
  const variants = (row.experience_variants ?? [])
    .filter((variant) => variant.is_active)
    .sort((left, right) => left.unit_amount_minor - right.unit_amount_minor);
  const cheapestVariant = variants[0] ?? null;
  const hero = selectPreferredPlacement(media ?? [], ["card", "hero"]);
  const ratingSummary = aggregatePublishedRatings(row.reviews ?? []);

  return experienceCardSchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    durationMinutes: row.duration_minutes,
    baseCapacity: row.base_capacity,
    locationName: row.location_name,
    heroImagePath: hero?.storagePath ?? null,
    heroImageUrl: hero?.url ?? null,
    heroImageAlt: hero?.altText ?? null,
    heroFocalX: hero?.focalX ?? 50,
    heroFocalY: hero?.focalY ?? 50,
    categoryLabel: row.category_label,
    providerName: getProviderName(row.provider),
    experienceType: row.experience_type?.trim() || null,
    highlights: parseStringArray(row.highlights),
    startingPriceMinor: cheapestVariant?.unit_amount_minor ?? null,
    currency: cheapestVariant?.currency?.trim() ?? null,
    pricingModel: cheapestVariant?.pricing_model ?? null,
    averageRating: ratingSummary.averageRating,
    reviewCount: ratingSummary.reviewCount
  });
}

function mapDetailExperience(
  row: DetailExperienceRow,
  placements: NonNullable<Parameters<typeof mapCardExperience>[1]>,
  availabilitySummary: string | null
): ExperienceDetailViewModel {
  const card = mapCardExperience(row, placements);
  const variants = (row.experience_variants ?? [])
    .filter((variant) => variant.is_active)
    .sort((left, right) => {
      if (left.is_default !== right.is_default) return left.is_default ? -1 : 1;
      return left.unit_amount_minor - right.unit_amount_minor;
    })
    .map((variant) => ({
      id: variant.id,
      slug: variant.slug,
      name: variant.name,
      description: variant.description,
      pricingModel: variant.pricing_model,
      unitAmountMinor: variant.unit_amount_minor,
      currency: variant.currency.trim(),
      minPartySize: variant.min_party_size,
      maxPartySize: variant.max_party_size,
      durationMinutes: variant.duration_minutes,
      subtitle: variant.subtitle,
      badgeLabel: variant.badge_label,
      isDefault: variant.is_default
    }));

  const media: ExperienceDetailMedia[] = placements.map((item) => ({
    id: item.id,
    assetKey: item.assetKey,
    placementKey: item.placementKey,
    role: item.role,
    breakpoint: item.breakpoint,
    storagePath: item.storagePath,
    url: item.url,
    mediaType: item.mediaType,
    mimeType: item.mimeType,
    altText: item.altText,
    caption: item.caption,
    focalX: item.focalX,
    focalY: item.focalY,
    width: item.width,
    height: item.height,
    durationSeconds: item.durationSeconds,
    displayOrder: item.displayOrder,
    isPrimary: item.isPrimary
  }));

  const publishedReviews = (row.reviews ?? []).filter(
    (review) => review.status === "published"
  );
  const ratingSummary = aggregatePublishedRatings(publishedReviews);
  const locations = [...(row.experience_locations ?? [])]
    .filter((entry) => entry.is_active && entry.location?.is_active)
    .sort((left, right) => left.display_order - right.display_order)
    .map((entry) => ({
      id: entry.location!.id,
      name: entry.location!.name,
      slug: entry.location!.slug,
      isPrimary: entry.is_primary,
      addressLine1: entry.location!.address_line_1,
      city: entry.location!.city,
      latitude: toNullableNumber(entry.location!.latitude),
      longitude: toNullableNumber(entry.location!.longitude),
      meetingInstructions:
        entry.meeting_point_override?.trim() ||
        entry.location!.meeting_point_notes?.trim() ||
        null,
      displayOrder: entry.display_order
    }));

  return {
    ...card,
    startingPriceMinor: variants[0]?.unitAmountMinor ?? card.startingPriceMinor,
    currency: variants[0]?.currency ?? card.currency,
    pricingModel: variants[0]?.pricingModel ?? card.pricingModel,
    highlights: parseStringArray(row.highlights),
    inclusions: parseStringArray(row.inclusions),
    timezone: row.timezone || "Europe/Madrid",
    media,
    variants,
    languages: [...(row.experience_languages ?? [])]
      .sort((left, right) => Number(right.is_primary) - Number(left.is_primary))
      .map((language) => ({
        code: language.language_code,
        displayName: language.display_name,
        isPrimary: language.is_primary
      })),
    itinerary: [...(row.experience_itinerary_steps ?? [])]
      .sort((left, right) => left.display_order - right.display_order)
      .map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        startsAfterMinutes: step.starts_after_minutes,
        durationMinutes: step.duration_minutes,
        displayOrder: step.display_order
      })),
    requirements: [...(row.experience_requirements ?? [])]
      .sort((left, right) => left.display_order - right.display_order)
      .map((requirement) => ({
        id: requirement.id,
        requirementType: requirement.requirement_type,
        title: requirement.title,
        description: requirement.description,
        isMandatory: requirement.is_mandatory,
        displayOrder: requirement.display_order
      })),
    policies: [...(row.experience_policies ?? [])]
      .filter((policy) => policy.is_active)
      .sort((left, right) => left.display_order - right.display_order)
      .map((policy) => ({
        id: policy.id,
        policyType: policy.policy_type,
        title: policy.title,
        description: policy.description,
        valueMinutes: policy.value_minutes,
        displayOrder: policy.display_order
      })),
    locations,
    availabilitySummary,
    reviews: {
      averageRating: ratingSummary.averageRating,
      reviewCount: ratingSummary.reviewCount,
      items: publishedReviews
        .sort(
          (left, right) =>
            (right.published_at ? Date.parse(right.published_at) : 0) -
            (left.published_at ? Date.parse(left.published_at) : 0)
        )
        .map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          publishedAt: review.published_at
        }))
    }
  };
}

const cardSelect = `
  id,
  slug,
  title,
  short_description,
  description,
  duration_minutes,
  base_capacity,
  location_name,
  category_label,
  experience_type,
  highlights,
  provider:profiles!experiences_provider_profile_id_fkey(display_name),
  experience_variants(
    id, slug, name, description, pricing_model, unit_amount_minor, currency,
    min_party_size, max_party_size, is_default, is_active
  ),
  reviews(rating, status)
`;

const detailSelect = `
  id,
  slug,
  title,
  short_description,
  description,
  duration_minutes,
  base_capacity,
  location_name,
  category_label,
  experience_type,
  timezone,
  highlights,
  inclusions,
  provider:profiles!experiences_provider_profile_id_fkey(display_name),
  experience_variants(
    id, slug, name, description, pricing_model, unit_amount_minor, currency,
    min_party_size, max_party_size, is_default, is_active, duration_minutes,
    subtitle, badge_label
  ),
  experience_languages(language_code, display_name, is_primary),
  experience_itinerary_steps(id, title, description, starts_after_minutes, duration_minutes, display_order),
  experience_requirements(id, requirement_type, title, description, is_mandatory, display_order),
  experience_policies(id, policy_type, title, description, value_minutes, is_active, display_order),
  experience_locations(
    is_primary, display_order, is_active, meeting_point_override,
    location:locations(id, name, slug, address_line_1, city, latitude, longitude, meeting_point_notes, is_active)
  ),
  reviews(id, rating, title, comment, status, published_at)
`;

export async function getPublishedExperienceCards(
  limit?: number
): Promise<ExperienceCardViewModel[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("experiences")
    .select(cardSelect)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") query = query.limit(limit);
  const { data, error } = await query;
  if (error || !data) return [];

  const rows = data as unknown as CardExperienceRow[];
  const mediaBySlug = await getPublishedMediaPlacements(
    "experience",
    rows.map((row) => row.slug)
  );

  try {
    return rows.map((row) =>
      mapCardExperience(row, mediaBySlug.get(row.slug) ?? [])
    );
  } catch {
    return [];
  }
}

export async function getPublishedExperienceBySlug(
  slug: string
): Promise<ExperienceDetailViewModel | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("experiences")
    .select(detailSelect)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  const detailRow = data as unknown as DetailExperienceRow;
  const [{ data: slots }, mediaBySlug] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("starts_at")
      .eq("experience_id", detailRow.id)
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(90),
    getPublishedMediaPlacements("experience", [slug])
  ]);

  const availabilitySummary = summarizeAvailabilityFromSlots(
    (slots ?? []).map((slot) => slot.starts_at),
    detailRow.timezone || "Europe/Madrid"
  );

  try {
    return mapDetailExperience(
      detailRow,
      mediaBySlug.get(slug) ?? [],
      availabilitySummary
    );
  } catch {
    return null;
  }
}
