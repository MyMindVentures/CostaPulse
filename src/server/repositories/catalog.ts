import "server-only";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  categoryLabel: z.string().nullable(),
  providerName: z.string().nullable(),
  startingPriceMinor: z.number().int().nonnegative().nullable(),
  currency: z.string().length(3).nullable(),
  pricingModel: pricingModelSchema.nullable()
});

export type ExperienceCardViewModel = z.infer<typeof experienceCardSchema>;

export type ExperienceDetailViewModel = ExperienceCardViewModel & {
  variants: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    pricingModel: "per_person" | "per_group";
    unitAmountMinor: number;
    currency: string;
    minPartySize: number;
    maxPartySize: number | null;
  }>;
};

type ExperienceRow = {
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
};

function getProviderName(provider: ExperienceRow["provider"]): string | null {
  if (Array.isArray(provider)) {
    return provider[0]?.display_name ?? null;
  }

  return provider?.display_name ?? null;
}

function mapExperience(row: ExperienceRow): ExperienceDetailViewModel {
  const variants = (row.experience_variants ?? [])
    .filter((variant) => variant.is_active)
    .sort((left, right) => left.unit_amount_minor - right.unit_amount_minor)
    .map((variant) => ({
      id: variant.id,
      slug: variant.slug,
      name: variant.name,
      description: variant.description,
      pricingModel: variant.pricing_model,
      unitAmountMinor: variant.unit_amount_minor,
      currency: variant.currency.trim(),
      minPartySize: variant.min_party_size,
      maxPartySize: variant.max_party_size
    }));

  const cheapestVariant = variants[0] ?? null;
  const card = experienceCardSchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    durationMinutes: row.duration_minutes,
    baseCapacity: row.base_capacity,
    locationName: row.location_name,
    heroImagePath: row.hero_image_path,
    categoryLabel: row.category_label,
    providerName: getProviderName(row.provider),
    startingPriceMinor: cheapestVariant?.unitAmountMinor ?? null,
    currency: cheapestVariant?.currency ?? null,
    pricingModel: cheapestVariant?.pricingModel ?? null
  });

  return { ...card, variants };
}

const experienceSelect = `
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
  )
`;

export async function getPublishedExperienceCards(
  limit?: number
): Promise<ExperienceCardViewModel[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("experiences")
    .select(experienceSelect)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return [];

  try {
    return (data as unknown as ExperienceRow[]).map(mapExperience);
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
    .select(experienceSelect)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  try {
    return mapExperience(data as unknown as ExperienceRow);
  } catch {
    return null;
  }
}
