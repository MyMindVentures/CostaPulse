import "server-only";
import { z } from "zod";
import { resolveExperienceMediaUrl } from "@/lib/media/experience-media";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  aggregatePublishedRatings,
  resolveHeroMedia
} from "@/features/experiences/card-data";
import { summarizeAvailabilityFromSlots } from "@/server/availability/summarize";

const pricingModelSchema = z.enum(["per_person", "per_group"]);

const experienceCardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  durationMinutes: z.number().int().positive(),
  baseCapacity: z.number().int().positive(),
  locationName: z.string().nullable(),
  heroImagePath: z.string().nullable(),
  heroImageAlt: z.string().nullable(),
  categoryLabel: z.string().nullable(),
  providerName: z.string().nullable(),
  experienceType: z.string().nullable(),
  highlights: z.array(z.string()),
  startingPriceMinor: z.number().int().nonnegative().nullable(),
  currency: z.string().length(3).nullable(),
  pricingModel: pricingModelSchema.nullable(),
  averageRating: z.number().nullable(),
  reviewCount: z.number().int().nonnegative()
});

export type ExperienceCardViewModel = z.infer<typeof experienceCardSchema>;

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
  storagePath: string;
  url: string | null;
  mediaType: string;
  altText: string | null;
  caption: string | null;
  isHero: boolean;
  displayOrder: number;
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
  hero_image_path: string | null;
  category_label: string | null;
  experience_type?: string | null;
  highlights?: unknown;
  provider: { display_name: string | null } | Array<{ display_name: string | null }> | null;
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
  experience_media?: Array<{
    id?: string;
    storage_path: string;
    media_type: string;
    alt_text: string | null;
    caption?: string | null;
    is_hero: boolean;
    display_order: number;
    media_asset_id?: string | null;
    media_assets?: {
      bucket_id: string;
      storage_path: string;
    } | null;
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

type DetailExperienceRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  duration_minutes: number;
  base_capacity: number;
  location_name: string | null;
  hero_image_path: string | null;
  category_label: string | null;
  experience_type?: string | null;
  timezone: string;
  highlights: unknown;
  inclusions: unknown;
  provider: { display_name: string | null } | Array<{ display_name: string | null }> | null;
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
  experience_media: Array<{
    id: string;
    storage_path: string;
    media_type: string;
    alt_text: string | null;
    caption: string | null;
    is_hero: boolean;
    display_order: number;
    media_asset_id?: string | null;
    media_assets?: {
      bucket_id: string;
      storage_path: string;
    } | null;
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

function getProviderName(provider: CardExperienceRow["provider"]): string | null {
  if (Array.isArray(provider)) {
    return provider[0]?.display_name ?? null;
  }

  return provider?.display_name ?? null;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function mapCardExperience(row: CardExperienceRow): Promise<ExperienceCardViewModel> {
  const variants = (row.experience_variants ?? [])
    .filter((variant) => variant.is_active)
    .sort((left, right) => left.unit_amount_minor - right.unit_amount_minor);

  const cheapestVariant = variants[0] ?? null;

  const hero = resolveHeroMedia(
    (row.experience_media ?? []).map((item) => ({
      storagePath: item.storage_path,
      mediaType: item.media_type,
      altText: item.alt_text,
      isHero: item.is_hero,
      displayOrder: item.display_order
    })),
    row.hero_image_path
  );

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
    heroImagePath: hero.path,
    heroImageAlt: hero.path ? hero.altText : null,
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

async function mapDetailExperience(
  row: DetailExperienceRow,
  availabilitySummary: string | null
): Promise<ExperienceDetailViewModel> {
  const card = await mapCardExperience(row);

  const variants = (row.experience_variants ?? [])
    .filter((variant) => variant.is_active)
    .sort((left, right) => {
      if (left.is_default !== right.is_default) {
        return left.is_default ? -1 : 1;
      }
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

  const media = [...(row.experience_media ?? [])]
    .sort((left, right) => left.display_order - right.display_order)
    .map((item) => ({
      id: item.id,
      storagePath: item.storage_path,
      url: resolveExperienceMediaUrl(
        item.storage_path,
        item.media_assets
          ? {
              bucketId: item.media_assets.bucket_id,
              storagePath: item.media_assets.storage_path
            }
          : null
      ),
      mediaType: item.media_type,
      altText: item.alt_text,
      caption: item.caption,
      isHero: item.is_hero,
      displayOrder: item.display_order
    }));

  const hero = resolveHeroMedia(
    media.map((item) => ({
      storagePath: item.storagePath,
      mediaType: item.mediaType,
      altText: item.altText,
      isHero: item.isHero,
      displayOrder: item.displayOrder
    })),
    row.hero_image_path
  );

  const publishedReviews = (row.reviews ?? []).filter((review) => review.status === "published");
  const ratingSummary = aggregatePublishedRatings(publishedReviews);

  const locations = [...(row.experience_locations ?? [])]
    .filter((entry) => entry.is_active && entry.location && entry.location.is_active)
    .sort((left, right) => left.display_order - right.display_order)
    .map((entry) => {
      const location = entry.location!;
      return {
        id: location.id,
        name: location.name,
        slug: location.slug,
        isPrimary: entry.is_primary,
        addressLine1: location.address_line_1,
        city: location.city,
        latitude: toNullableNumber(location.latitude),
        longitude: toNullableNumber(location.longitude),
        meetingInstructions:
          entry.meeting_point_override?.trim() ||
          location.meeting_point_notes?.trim() ||
          null,
        displayOrder: entry.display_order
      };
    });

  return {
    ...card,
    heroImagePath: hero.path,
    heroImageAlt: hero.altText,
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
        .sort((left, right) => {
          const leftTime = left.published_at ? Date.parse(left.published_at) : 0;
          const rightTime = right.published_at ? Date.parse(right.published_at) : 0;
          return rightTime - leftTime;
        })
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
  hero_image_path,
  category_label,
  experience_type,
  highlights,
  provider:profiles!experiences_provider_profile_id_fkey(display_name),
  experience_variants(
    id,
    slug,
    name,
    description,
    pricing_model,
    unit_amount_minor,
    currency,
    min_party_size,
    max_party_size,
    is_default,
    is_active
  ),
  experience_media(
    id,
    storage_path,
    media_type,
    alt_text,
    caption,
    is_hero,
    display_order,
    media_asset_id,
    media_assets(
      bucket_id,
      storage_path
    )
  ),
  reviews(
    rating,
    status
  )
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
  hero_image_path,
  category_label,
  experience_type,
  timezone,
  highlights,
  inclusions,
  provider:profiles!experiences_provider_profile_id_fkey(display_name),
  experience_variants(
    id,
    slug,
    name,
    description,
    pricing_model,
    unit_amount_minor,
    currency,
    min_party_size,
    max_party_size,
    is_default,
    is_active,
    duration_minutes,
    subtitle,
    badge_label
  ),
  experience_media(
    id,
    storage_path,
    media_type,
    alt_text,
    caption,
    is_hero,
    display_order,
    media_asset_id,
    media_assets(
      bucket_id,
      storage_path
    )
  ),
  experience_languages(
    language_code,
    display_name,
    is_primary
  ),
  experience_itinerary_steps(
    id,
    title,
    description,
    starts_after_minutes,
    duration_minutes,
    display_order
  ),
  experience_requirements(
    id,
    requirement_type,
    title,
    description,
    is_mandatory,
    display_order
  ),
  experience_policies(
    id,
    policy_type,
    title,
    description,
    value_minutes,
    is_active,
    display_order
  ),
  experience_locations(
    is_primary,
    display_order,
    is_active,
    meeting_point_override,
    location:locations(
      id,
      name,
      slug,
      address_line_1,
      city,
      latitude,
      longitude,
      meeting_point_notes,
      is_active
    )
  ),
  reviews(
    id,
    rating,
    title,
    comment,
    status,
    published_at
  )
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
  if (error || !data) {
    // #region agent log
    fetch("http://127.0.0.1:7821/ingest/4a33213c-f005-42e0-867d-a7b2042de466", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "20f0e2"
      },
      body: JSON.stringify({
        sessionId: "20f0e2",
        runId: "post-fix",
        hypothesisId: "A",
        location: "catalog.ts:getPublishedExperienceCards",
        message: "catalog query failed or empty",
        data: {
          hasError: Boolean(error),
          errorMessage: error?.message ?? null,
          rowCount: data?.length ?? 0
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion
    return [];
  }

  try {
    const cards = await Promise.all(
      (data as unknown as CardExperienceRow[]).map((row) => mapCardExperience(row))
    );
    // #region agent log
    fetch("http://127.0.0.1:7821/ingest/4a33213c-f005-42e0-867d-a7b2042de466", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "20f0e2"
      },
      body: JSON.stringify({
        sessionId: "20f0e2",
        runId: "post-fix",
        hypothesisId: "A",
        location: "catalog.ts:getPublishedExperienceCards",
        message: "mapped published cards",
        data: {
          count: cards.length,
          cards: cards.map((c) => ({
            slug: c.slug,
            heroImagePath: c.heroImagePath,
            heroImageAlt: c.heroImageAlt,
            categoryLabel: c.categoryLabel,
            hasPrice: c.startingPriceMinor != null
          }))
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion
    return cards;
  } catch (mapError) {
    // #region agent log
    fetch("http://127.0.0.1:7821/ingest/4a33213c-f005-42e0-867d-a7b2042de466", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "20f0e2"
      },
      body: JSON.stringify({
        sessionId: "20f0e2",
        runId: "post-fix",
        hypothesisId: "A",
        location: "catalog.ts:getPublishedExperienceCards",
        message: "mapCardExperience threw",
        data: {
          errorMessage:
            mapError instanceof Error ? mapError.message : String(mapError)
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion
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
  const timezone = detailRow.timezone || "Europe/Madrid";

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("starts_at")
    .eq("experience_id", detailRow.id)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(90);

  const availabilitySummary = summarizeAvailabilityFromSlots(
    (slots ?? []).map((slot) => slot.starts_at),
    timezone
  );

  try {
    return await mapDetailExperience(detailRow, availabilitySummary);
  } catch {
    return null;
  }
}
