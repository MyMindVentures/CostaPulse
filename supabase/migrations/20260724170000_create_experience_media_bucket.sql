-- Public marketing media for experience tiles (curated + live heroes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'experience-media',
  'experience-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read experience media" ON storage.objects;
CREATE POLICY "Public read experience media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "Authenticated insert experience media" ON storage.objects;
CREATE POLICY "Authenticated insert experience media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "Authenticated update experience media" ON storage.objects;
CREATE POLICY "Authenticated update experience media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'experience-media')
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "Authenticated delete experience media" ON storage.objects;
CREATE POLICY "Authenticated delete experience media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'experience-media');
