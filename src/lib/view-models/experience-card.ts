import { z } from "zod";

const pricingModelSchema = z.enum(["per_person", "per_group"]);

/**
 * Shared experience card view-model schema (catalog, home, cards).
 * Repositories parse into this shape at the backend boundary.
 */
export const experienceCardSchema = z.object({
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
export type ExperiencePricingModel = z.infer<typeof pricingModelSchema>;
