-- Replace a placement's media asset with a newly uploaded storage object.
-- Retargets the placement row; deletes the previous asset when unused.

CREATE OR REPLACE FUNCTION public.admin_replace_media_placement(
  p_placement_id uuid,
  p_bucket_id text,
  p_storage_path text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'storage', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_placement public.media_placements;
  v_old_asset public.media_assets;
  v_new_asset public.media_assets;
  v_old_used jsonb;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_placement
  FROM public.media_placements
  WHERE id = p_placement_id
    AND is_active = true;

  IF v_placement.id IS NULL THEN
    RAISE EXCEPTION 'Placement not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_old_asset
  FROM public.media_assets
  WHERE id = v_placement.media_asset_id;

  SELECT * INTO v_new_asset
  FROM public.media_assets
  WHERE bucket_id = p_bucket_id
    AND storage_path = p_storage_path;

  IF v_new_asset.id IS NULL THEN
    RAISE EXCEPTION 'Media asset not found for storage path' USING ERRCODE = 'P0002';
  END IF;

  IF v_old_asset.id IS NOT NULL AND v_new_asset.id = v_old_asset.id THEN
    RAISE EXCEPTION 'Replacement asset must differ from the current asset';
  END IF;

  UPDATE public.media_assets SET
    original_filename = coalesce(p_payload->>'original_filename', original_filename),
    generated_filename = coalesce(p_payload->>'generated_filename', generated_filename),
    alt_text = coalesce(p_payload->>'alt_text', alt_text),
    caption = coalesce(p_payload->>'caption', caption),
    title = coalesce(p_payload->>'title', title),
    width = coalesce(NULLIF(p_payload->>'width', '')::int, width),
    height = coalesce(NULLIF(p_payload->>'height', '')::int, height),
    created_by = coalesce(created_by, v_actor),
    status = 'published'::public.media_asset_status,
    visibility = 'public'::public.media_visibility,
    is_active = true,
    published_at = coalesce(published_at, timezone('utc', now())),
    folder_path = coalesce(p_payload->>'folder_path', folder_path),
    updated_at = timezone('utc', now())
  WHERE id = v_new_asset.id
  RETURNING * INTO v_new_asset;

  UPDATE public.media_placements SET
    media_asset_id = v_new_asset.id,
    alt_text_override = coalesce(NULLIF(p_payload->>'alt_text', ''), alt_text_override),
    caption_override = coalesce(NULLIF(p_payload->>'caption', ''), caption_override),
    updated_at = timezone('utc', now())
  WHERE id = v_placement.id
  RETURNING * INTO v_placement;

  IF v_placement.entity_type = 'experience'
     AND v_placement.usage = 'hero'
     AND v_placement.is_primary THEN
    UPDATE public.experiences
    SET hero_image_path = v_new_asset.storage_path,
        updated_at = timezone('utc', now())
    WHERE id = v_placement.entity_id;
  END IF;

  IF v_placement.entity_type = 'team_member'
     AND v_placement.usage = 'avatar'
     AND v_placement.is_primary THEN
    UPDATE public.team_members
    SET photo_path = v_new_asset.storage_path,
        updated_at = timezone('utc', now())
    WHERE id = v_placement.entity_id;
  END IF;

  v_old_used := CASE
    WHEN v_old_asset.id IS NULL THEN '[]'::jsonb
    ELSE private.media_asset_used_by(v_old_asset.id)
  END;

  IF v_old_asset.id IS NOT NULL AND jsonb_array_length(v_old_used) = 0 THEN
    DELETE FROM storage.objects
    WHERE bucket_id = v_old_asset.bucket_id
      AND name = v_old_asset.storage_path;
    DELETE FROM public.media_assets WHERE id = v_old_asset.id;
  END IF;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.replaced',
    'media_placement',
    v_placement.id::text,
    jsonb_build_object(
      'old_asset_id', v_old_asset.id,
      'old_used_by', v_old_used
    ),
    jsonb_build_object(
      'placement', to_jsonb(v_placement),
      'asset', to_jsonb(v_new_asset)
    ),
    NULL
  );

  RETURN jsonb_build_object(
    'asset', to_jsonb(v_new_asset),
    'placement', to_jsonb(v_placement),
    'old_asset_id', v_old_asset.id,
    'old_asset_deleted',
      (v_old_asset.id IS NOT NULL AND jsonb_array_length(v_old_used) = 0),
    'used_by', private.media_asset_used_by(v_new_asset.id)
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_replace_media_placement(uuid, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_replace_media_placement(uuid, text, text, jsonb)
  TO authenticated, service_role;
