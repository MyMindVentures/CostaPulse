export type VariantPricingModel = "per_person" | "per_group";

export type ExperienceFromPrice = {
  amountMinor: number;
  currency: string;
  pricingModel: VariantPricingModel;
};

export type PricedVariantCandidate = {
  unitAmountMinor: number;
  currency: string;
  pricingModel: VariantPricingModel;
  isDefault: boolean;
  isActive: boolean;
};

/**
 * Picks the card "From" price: default active variant, else cheapest active.
 */
export function selectFromPrice(
  variants: PricedVariantCandidate[]
): ExperienceFromPrice | null {
  const active = variants.filter((variant) => variant.isActive);
  if (active.length === 0) {
    return null;
  }

  const preferred =
    active.find((variant) => variant.isDefault) ??
    [...active].sort((a, b) => a.unitAmountMinor - b.unitAmountMinor)[0];

  return {
    amountMinor: preferred.unitAmountMinor,
    currency: preferred.currency,
    pricingModel: preferred.pricingModel
  };
}

export function takeHighlightFeatures(
  highlights: unknown,
  limit = 2
): string[] {
  if (!Array.isArray(highlights)) {
    return [];
  }

  return highlights
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

export type ExperienceCardTone = 1 | 2 | 3;

const TONE_BY_EXPERIENCE_TYPE: Record<string, ExperienceCardTone> = {
  boat_experience: 1,
  paddlesurf_mentor: 2,
  kayak_mentor: 2,
  bbq_experience: 3
};

export function resolveExperienceCardTone(
  experienceType: string | null | undefined,
  fallbackIndex = 0
): ExperienceCardTone {
  if (experienceType && experienceType in TONE_BY_EXPERIENCE_TYPE) {
    return TONE_BY_EXPERIENCE_TYPE[experienceType];
  }

  return (((fallbackIndex % 3) + 1) as ExperienceCardTone);
}
