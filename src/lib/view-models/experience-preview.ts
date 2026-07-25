import { z } from "zod";
import { teamMemberSummarySchema } from "@/lib/view-models/team-member";

const pricingModelSchema = z.enum(["per_person", "per_group"]);

export const experiencePreviewLocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  isPrimary: z.boolean()
});

export const experiencePreviewSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  durationMinutes: z.number().int().positive(),
  baseCapacity: z.number().int().positive(),
  locationName: z.string().nullable(),
  locations: z.array(experiencePreviewLocationSchema),
  teamMembers: z.array(teamMemberSummarySchema),
  availabilitySummary: z.string().nullable(),
  heroImagePath: z.string().nullable(),
  heroImageUrl: z.string().nullable(),
  heroImageAlt: z.string().nullable(),
  heroFocalX: z.number().min(0).max(100),
  heroFocalY: z.number().min(0).max(100),
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

export type ExperiencePreviewLocation = z.infer<
  typeof experiencePreviewLocationSchema
>;
export type ExperiencePreviewViewModel = z.infer<
  typeof experiencePreviewSchema
>;
export type ExperiencePricingModel = z.infer<typeof pricingModelSchema>;
