-- Central catalog of Storage objects, kept in sync via triggers.
-- Domain tables (e.g. experience_media) reference media_assets by id.

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  storage_object_id uuid UNIQUE,
  bucket_id text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  byte_size bigint,
  etag text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT media_assets_bucket_path_key UNIQUE (bucket_id, storage_path),
  CONSTRAINT media_assets_byte_size_nonnegative CHECK (byte_size IS NULL OR byte_size >= 0)
);

CREATE INDEX IF NOT EXISTS media_assets_bucket_path_prefix_idx
  ON public.media_assets (bucket_id, storage_path);

CREATE OR REPLACE FUNCTION public.media_assets_is_keep_object(object_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT object_name IS NULL
    OR object_name = '.keep'
    OR object_name LIKE '%.keep'
    OR object_name LIKE '%/.keep';
$$;

CREATE OR REPLACE FUNCTION public.sync_media_asset_from_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  object_id uuid;
  object_bucket text;
  object_path text;
  object_mime text;
  object_size bigint;
  object_etag text;
  object_created timestamptz;
BEGIN
  IF TG_OP = 'DELETE' THEN
    object_id := OLD.id;
    object_bucket := OLD.bucket_id;
    object_path := OLD.name;

    IF public.media_assets_is_keep_object(object_path) THEN
      RETURN OLD;
    END IF;

    DELETE FROM public.media_assets
    WHERE storage_object_id = object_id
       OR (bucket_id = object_bucket AND storage_path = object_path);

    RETURN OLD;
  END IF;

  object_id := NEW.id;
  object_bucket := NEW.bucket_id;
  object_path := NEW.name;
  object_mime := COALESCE(NEW.metadata ->> 'mimetype', NEW.metadata ->> 'contentType');
  object_size := NULLIF(NEW.metadata ->> 'size', '')::bigint;
  object_etag := NEW.metadata ->> 'eTag';
  object_created := NEW.created_at;

  IF public.media_assets_is_keep_object(object_path) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.media_assets (
    storage_object_id,
    bucket_id,
    storage_path,
    mime_type,
    byte_size,
    etag,
    created_at,
    updated_at
  )
  VALUES (
    object_id,
    object_bucket,
    object_path,
    object_mime,
    object_size,
    object_etag,
    COALESCE(object_created, timezone('utc'::text, now())),
    timezone('utc'::text, now())
  )
  ON CONFLICT (bucket_id, storage_path) DO UPDATE
  SET
    storage_object_id = EXCLUDED.storage_object_id,
    mime_type = EXCLUDED.mime_type,
    byte_size = EXCLUDED.byte_size,
    etag = EXCLUDED.etag,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_media_assets_from_storage ON storage.objects;
CREATE TRIGGER sync_media_assets_from_storage
AFTER INSERT OR UPDATE OR DELETE ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.sync_media_asset_from_storage();

-- Backfill existing non-keep objects.
INSERT INTO public.media_assets (
  storage_object_id,
  bucket_id,
  storage_path,
  mime_type,
  byte_size,
  etag,
  created_at,
  updated_at
)
SELECT
  o.id,
  o.bucket_id,
  o.name,
  COALESCE(o.metadata ->> 'mimetype', o.metadata ->> 'contentType'),
  NULLIF(o.metadata ->> 'size', '')::bigint,
  o.metadata ->> 'eTag',
  COALESCE(o.created_at, timezone('utc'::text, now())),
  timezone('utc'::text, now())
FROM storage.objects o
WHERE NOT public.media_assets_is_keep_object(o.name)
ON CONFLICT (bucket_id, storage_path) DO UPDATE
SET
  storage_object_id = EXCLUDED.storage_object_id,
  mime_type = EXCLUDED.mime_type,
  byte_size = EXCLUDED.byte_size,
  etag = EXCLUDED.etag,
  updated_at = timezone('utc'::text, now());

ALTER TABLE public.experience_media
  ADD COLUMN IF NOT EXISTS media_asset_id uuid REFERENCES public.media_assets (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS experience_media_media_asset_id_idx
  ON public.experience_media (media_asset_id)
  WHERE media_asset_id IS NOT NULL;

-- Link experience_media rows to catalogued experience-media objects.
UPDATE public.experience_media em
SET
  media_asset_id = ma.id,
  updated_at = timezone('utc'::text, now())
FROM public.media_assets ma
WHERE ma.bucket_id = 'experience-media'
  AND ma.storage_path = em.storage_path
  AND (em.media_asset_id IS DISTINCT FROM ma.id);

-- Prefer live costapulse PNG heroes over placeholder hero.jpg rows.
UPDATE public.experience_media
SET
  is_hero = false,
  updated_at = timezone('utc'::text, now())
WHERE is_hero = true
  AND storage_path LIKE '%/hero.jpg';

UPDATE public.experience_media em
SET
  is_hero = true,
  display_order = 0,
  updated_at = timezone('utc'::text, now())
FROM (
  VALUES
    ('boat-experience', 'boat-experience/costapulse-boat-experience-hero.png'),
    ('bbq-experience', 'bbq-experience/costapulse-bbq-experience-cobb-hero.png'),
    ('kayak-mentor', 'kayak-mentor/costapulse-kayak-mentor-hero.png'),
    ('paddlesurf-mentor', 'paddlesurf-mentor/costapulse-paddlesurf-mentor-hero.png')
) AS heroes(slug, storage_path)
INNER JOIN public.experiences e ON e.slug = heroes.slug
WHERE em.experience_id = e.id
  AND em.storage_path = heroes.storage_path;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media assets in public buckets" ON public.media_assets;
CREATE POLICY "Public can read media assets in public buckets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM storage.buckets b
    WHERE b.id = media_assets.bucket_id
      AND b.public = true
  )
);

GRANT SELECT ON public.media_assets TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.media_assets FROM anon, authenticated;
