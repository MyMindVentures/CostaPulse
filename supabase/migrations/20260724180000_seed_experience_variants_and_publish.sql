-- Temporary From-prices for homepage cards (owner may correct later).
-- pricing_model: per_group = mockup "per experience"; per_person = "per person".

UPDATE public.experiences
SET
  status = 'published',
  updated_at = timezone('utc', now())
WHERE slug IN (
  'paddlesurf-mentor',
  'boat-experience',
  'bbq-experience',
  'kayak-mentor'
);

INSERT INTO public.experience_variants (
  experience_id,
  slug,
  name,
  pricing_model,
  unit_amount_minor,
  currency,
  min_party_size,
  max_party_size,
  is_default,
  is_active
)
SELECT
  e.id,
  seed.variant_slug,
  seed.variant_name,
  seed.pricing_model::public.variant_pricing_model,
  seed.unit_amount_minor,
  e.base_currency,
  seed.min_party_size,
  seed.max_party_size,
  true,
  true
FROM public.experiences AS e
INNER JOIN (
  VALUES
    (
      'boat-experience',
      'standard',
      'Standard charter',
      'per_group',
      49500,
      1,
      8
    ),
    (
      'paddlesurf-mentor',
      'standard',
      'Guided session',
      'per_person',
      6500,
      1,
      6
    ),
    (
      'bbq-experience',
      'standard',
      'Hosted BBQ',
      'per_group',
      18000,
      1,
      10
    ),
    (
      'kayak-mentor',
      'standard',
      'Guided session',
      'per_person',
      6500,
      1,
      6
    )
) AS seed (
  experience_slug,
  variant_slug,
  variant_name,
  pricing_model,
  unit_amount_minor,
  min_party_size,
  max_party_size
)
  ON e.slug = seed.experience_slug
ON CONFLICT (experience_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  pricing_model = EXCLUDED.pricing_model,
  unit_amount_minor = EXCLUDED.unit_amount_minor,
  currency = EXCLUDED.currency,
  min_party_size = EXCLUDED.min_party_size,
  max_party_size = EXCLUDED.max_party_size,
  is_default = true,
  is_active = true,
  updated_at = timezone('utc', now());
