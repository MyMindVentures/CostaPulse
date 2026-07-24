-- Catalog media metadata for published experiences (Storage paths live in experience-media bucket).
-- Idempotent for environments where the table already exists.

CREATE TABLE IF NOT EXISTS public.experience_media (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  alt_text text,
  caption text,
  is_hero boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT experience_media_experience_id_storage_path_key UNIQUE (experience_id, storage_path),
  CONSTRAINT experience_media_media_type_check CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text]))
);

CREATE UNIQUE INDEX IF NOT EXISTS experience_media_one_hero_idx
  ON public.experience_media (experience_id)
  WHERE is_hero;

CREATE INDEX IF NOT EXISTS experience_media_order_idx
  ON public.experience_media (experience_id, display_order);

ALTER TABLE public.experience_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view media of published experiences"
  ON public.experience_media;

CREATE POLICY "Public can view media of published experiences"
ON public.experience_media
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experiences e
    WHERE e.id = experience_media.experience_id
      AND e.status = 'published'::public.publication_status
  )
);
