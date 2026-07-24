-- Temporary repair window for orphaned experience-media objects.
-- Paired with 20260724210001_revoke_temp_experience_media_repair_uploads.sql.

DROP POLICY IF EXISTS "Temp repair upload experience media" ON storage.objects;
CREATE POLICY "Temp repair upload experience media"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "Temp repair update experience media" ON storage.objects;
CREATE POLICY "Temp repair update experience media"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'experience-media')
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "Temp repair delete experience media" ON storage.objects;
CREATE POLICY "Temp repair delete experience media"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'experience-media');
