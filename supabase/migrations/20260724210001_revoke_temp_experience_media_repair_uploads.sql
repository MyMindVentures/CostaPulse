-- Revoke temporary experience-media repair policies.

DROP POLICY IF EXISTS "Temp repair upload experience media" ON storage.objects;
DROP POLICY IF EXISTS "Temp repair update experience media" ON storage.objects;
DROP POLICY IF EXISTS "Temp repair delete experience media" ON storage.objects;
