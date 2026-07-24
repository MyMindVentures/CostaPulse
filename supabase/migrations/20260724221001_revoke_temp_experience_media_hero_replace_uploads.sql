-- Revoke temporary experience-media write policies after hero replace.

DROP POLICY IF EXISTS "temp_anon_upload_experience_media" ON storage.objects;
DROP POLICY IF EXISTS "temp_anon_update_experience_media" ON storage.objects;
DROP POLICY IF EXISTS "temp_anon_delete_experience_media" ON storage.objects;
