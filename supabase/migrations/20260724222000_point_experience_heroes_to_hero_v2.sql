-- Point published experiences at cache-busted CostaPulse hero assets (hero-v2.jpg).

UPDATE public.experience_media
SET is_hero = false,
    updated_at = timezone('utc'::text, now())
WHERE is_hero = true;

UPDATE public.experiences e
SET hero_image_path = h.storage_path,
    updated_at = timezone('utc'::text, now())
FROM (
  VALUES
    ('boat-experience', 'boat-experience/hero-v2.jpg'),
    ('paddlesurf-mentor', 'paddlesurf-mentor/hero-v2.jpg'),
    ('kayak-mentor', 'kayak-mentor/hero-v2.jpg'),
    ('bbq-experience', 'bbq-experience/hero-v2.jpg')
) AS h(slug, storage_path)
WHERE e.slug = h.slug;

INSERT INTO public.experience_media (
  experience_id,
  storage_path,
  media_type,
  alt_text,
  is_hero,
  display_order
)
SELECT e.id, e.hero_image_path, 'image', e.title, true, 0
FROM public.experiences e
WHERE e.slug IN (
  'boat-experience',
  'paddlesurf-mentor',
  'kayak-mentor',
  'bbq-experience'
)
ON CONFLICT (experience_id, storage_path)
DO UPDATE SET
  is_hero = true,
  display_order = 0,
  updated_at = timezone('utc'::text, now());
