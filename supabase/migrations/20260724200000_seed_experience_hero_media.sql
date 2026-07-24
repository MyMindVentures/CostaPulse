-- Link existing experience-media bucket heroes to catalog rows.
-- Storage objects already exist at {slug}/hero.png for all four published experiences.

WITH heroes AS (
  SELECT *
  FROM (
    VALUES
      ('boat-experience', 'boat-experience/hero.png'),
      ('bbq-experience', 'bbq-experience/hero.png'),
      ('kayak-mentor', 'kayak-mentor/hero.png'),
      ('paddlesurf-mentor', 'paddlesurf-mentor/hero.png')
  ) AS t(slug, storage_path)
),
updated AS (
  UPDATE public.experiences e
  SET
    hero_image_path = h.storage_path,
    updated_at = timezone('utc'::text, now())
  FROM heroes h
  WHERE e.slug = h.slug
    AND (
      e.hero_image_path IS NULL
      OR btrim(e.hero_image_path) = ''
      OR e.hero_image_path IS DISTINCT FROM h.storage_path
    )
  RETURNING e.id, h.storage_path
),
targets AS (
  SELECT e.id AS experience_id, h.storage_path, e.title
  FROM public.experiences e
  INNER JOIN heroes h ON h.slug = e.slug
)
INSERT INTO public.experience_media (
  experience_id,
  storage_path,
  media_type,
  alt_text,
  is_hero,
  display_order
)
SELECT
  t.experience_id,
  t.storage_path,
  'image',
  t.title,
  true,
  0
FROM targets t
ON CONFLICT (experience_id, storage_path)
DO UPDATE SET
  media_type = EXCLUDED.media_type,
  alt_text = COALESCE(public.experience_media.alt_text, EXCLUDED.alt_text),
  is_hero = true,
  display_order = EXCLUDED.display_order,
  updated_at = timezone('utc'::text, now());
