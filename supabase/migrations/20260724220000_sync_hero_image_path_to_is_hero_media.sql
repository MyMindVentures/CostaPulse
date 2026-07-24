-- Keep experiences.hero_image_path aligned with the is_hero experience_media row.

UPDATE public.experiences e
SET
  hero_image_path = em.storage_path,
  updated_at = timezone('utc'::text, now())
FROM public.experience_media em
WHERE em.experience_id = e.id
  AND em.is_hero = true
  AND em.media_type = 'image'
  AND e.hero_image_path IS DISTINCT FROM em.storage_path;
