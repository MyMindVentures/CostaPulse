-- Temporary write access so local repair can replace stand-in hero blobs.
-- Applied remotely; revoked by 20260724221001_revoke_temp_experience_media_hero_replace_uploads.sql.

DROP POLICY IF EXISTS "temp_anon_upload_experience_media" ON storage.objects;
CREATE POLICY "temp_anon_upload_experience_media"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "temp_anon_update_experience_media" ON storage.objects;
CREATE POLICY "temp_anon_update_experience_media"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'experience-media')
WITH CHECK (bucket_id = 'experience-media');

DROP POLICY IF EXISTS "temp_anon_delete_experience_media" ON storage.objects;
CREATE POLICY "temp_anon_delete_experience_media"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'experience-media');
