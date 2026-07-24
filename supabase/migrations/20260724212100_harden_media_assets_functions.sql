-- Harden media_assets sync helpers (search_path + revoke public EXECUTE).

CREATE OR REPLACE FUNCTION public.media_assets_is_keep_object(object_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT object_name IS NULL
    OR object_name = '.keep'
    OR object_name LIKE '%.keep'
    OR object_name LIKE '%/.keep';
$$;

REVOKE ALL ON FUNCTION public.media_assets_is_keep_object(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.media_assets_is_keep_object(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.media_assets_is_keep_object(text) TO postgres, service_role;

REVOKE ALL ON FUNCTION public.sync_media_asset_from_storage() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_media_asset_from_storage() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_media_asset_from_storage() TO postgres, service_role;
