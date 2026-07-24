import "server-only";
import {
  aggregatePublishedRatings,
  resolveHeroMedia
} from "@/features/experiences/card-data";
import {
  resolveExperienceCardTone,
  selectFromPrice,
  takeHighlightFeatures,
  type ExperienceCardTone,
  type ExperienceFromPrice
} from "@/features/experiences/from-price";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ExperienceHighlight = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  durationMinutes: number;
  baseCapacity: number;
  locationName: string | null;
  heroImagePath: string | null;
};

export type ExperienceCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  durationMinutes: number;
  baseCapacity: number;
  locationName: string | null;
  heroImagePath: string | null;
  heroImageAlt: string | null;
  categoryLabel: string | null;
  experienceType: string | null;
  highlightFeatures: string[];
  fromPrice: ExperienceFromPrice | null;
  tone: ExperienceCardTone;
  averageRating: number | null;
  reviewCount: number;
};

type VariantRow = {
  unit_amount_minor: number;
  currency: string;
  pricing_model: "per_person" | "per_group";
  is_default: boolean;
  is_active: boolean;
};

type MediaRow = {
  storage_path: string;
  media_type: string;
  alt_text: string | null;
  is_hero: boolean;
  display_order: number;
};

type ReviewRow = {
  rating: number;
  status: string;
};

export async function getPublishedExperienceHighlights(
  limit = 3
): Promise<ExperienceHighlight[]> {
  const cards = await getPublishedExperienceCards(limit);
  return cards.map((card) => ({
    id: card.id,
    slug: card.slug,
    title: card.title,
    shortDescription: card.shortDescription,
    durationMinutes: card.durationMinutes,
    baseCapacity: card.baseCapacity,
    locationName: card.locationName,
    heroImagePath: card.heroImagePath
  }));
}

export async function getPublishedExperienceCards(
  limit = 12
): Promise<ExperienceCard[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("experiences")
    .select(
      `
      id,
      slug,
      title,
      short_description,
      duration_minutes,
      base_capacity,
      location_name,
      hero_image_path,
      category_label,
      experience_type,
      highlights,
      sort_order,
      experience_variants (
        unit_amount_minor,
        currency,
        pricing_model,
        is_default,
        is_active
      ),
      experience_media (
        storage_path,
        media_type,
        alt_text,
        is_hero,
        display_order
      ),
      reviews (
        rating,
        status
      )
    `
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((experience, index) => {
    const variants = (experience.experience_variants ?? []) as VariantRow[];
    const media = (experience.experience_media ?? []) as MediaRow[];
    const reviews = (experience.reviews ?? []) as ReviewRow[];
    const hero = resolveHeroMedia(
      media.map((item) => ({
        storagePath: item.storage_path,
        mediaType: item.media_type,
        altText: item.alt_text,
        isHero: item.is_hero,
        displayOrder: item.display_order
      })),
      experience.hero_image_path
    );
    const rating = aggregatePublishedRatings(reviews);

    return {
      id: experience.id,
      slug: experience.slug,
      title: experience.title,
      shortDescription: experience.short_description,
      durationMinutes: experience.duration_minutes,
      baseCapacity: experience.base_capacity,
      locationName: experience.location_name,
      heroImagePath: hero.path,
      heroImageAlt: hero.altText,
      categoryLabel: experience.category_label,
      experienceType: experience.experience_type,
      highlightFeatures: takeHighlightFeatures(experience.highlights),
      fromPrice: selectFromPrice(
        variants.map((variant) => ({
          unitAmountMinor: variant.unit_amount_minor,
          currency: variant.currency,
          pricingModel: variant.pricing_model,
          isDefault: variant.is_default,
          isActive: variant.is_active
        }))
      ),
      tone: resolveExperienceCardTone(experience.experience_type, index),
      averageRating: rating.averageRating,
      reviewCount: rating.reviewCount
    };
  });
}
