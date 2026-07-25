-- Media placement admin RPCs, used_by rewrite, list_media filters, storage policies

-- ---------------------------------------------------------------------------
-- 1) media_asset_used_by — placements + legacy path refs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.media_asset_used_by(p_asset_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  p_asset public.media_assets;
BEGIN
  SELECT * INTO p_asset FROM public.media_assets WHERE id = p_asset_id;
  IF p_asset.id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(x ORDER BY x->>'kind', x->>'label')
    FROM (
      SELECT jsonb_build_object(
        'kind', 'placement',
        'placement_id', mp.id,
        'entity_type', mp.entity_type,
        'entity_id', mp.entity_id,
        'usage', mp.usage,
        'label', mp.entity_type || ':' || coalesce(private.media_entity_slug(mp.entity_type, mp.entity_id), mp.entity_id::text) || ':' || mp.usage
      ) AS x
      FROM public.media_placements mp
      WHERE mp.media_asset_id = p_asset.id
        AND mp.is_active = true

      UNION ALL

      SELECT jsonb_build_object(
        'kind', 'experience_hero',
        'entity_id', e.id,
        'label', 'experience_hero:' || e.slug
      )
      FROM public.experiences e
      WHERE e.hero_image_path IS NOT NULL
        AND (
          e.hero_image_path = p_asset.storage_path
          OR e.hero_image_path = p_asset.bucket_id || '/' || p_asset.storage_path
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.media_placements mp
          WHERE mp.media_asset_id = p_asset.id
            AND mp.entity_type = 'experience'
            AND mp.entity_id = e.id
            AND mp.is_active = true
        )

      UNION ALL

      SELECT jsonb_build_object(
        'kind', 'team_photo',
        'entity_id', tm.id,
        'label', 'team_photo:' || tm.slug
      )
      FROM public.team_members tm
      WHERE (
          tm.photo_path = p_asset.storage_path
          OR tm.hero_image_path = p_asset.storage_path
          OR tm.signature_path = p_asset.storage_path
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.media_placements mp
          WHERE mp.media_asset_id = p_asset.id
            AND mp.entity_type = 'team_member'
            AND mp.entity_id = tm.id
            AND mp.is_active = true
        )
    ) refs
  ), '[]'::jsonb);
END;
$function$;

-- ---------------------------------------------------------------------------
-- 2) Resolve entity id from legacy scope_type + scope_key (slug)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.resolve_media_entity_id(
  p_entity_type text,
  p_scope_key text
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_id uuid;
BEGIN
  CASE p_entity_type
    WHEN 'experience' THEN
      SELECT e.id INTO v_id FROM public.experiences e WHERE e.slug = p_scope_key;
    WHEN 'experience_variant' THEN
      SELECT v.id INTO v_id FROM public.experience_variants v WHERE v.slug = p_scope_key;
    WHEN 'location' THEN
      SELECT l.id INTO v_id FROM public.locations l WHERE l.slug = p_scope_key;
    WHEN 'team_member' THEN
      SELECT t.id INTO v_id FROM public.team_members t WHERE t.slug = p_scope_key;
    WHEN 'partner' THEN
      SELECT p.id INTO v_id FROM public.partners p WHERE p.slug = p_scope_key;
    WHEN 'site_content' THEN
      SELECT s.id INTO v_id FROM public.site_content_sections s WHERE s.section_key = p_scope_key;
    ELSE
      v_id := NULL;
  END CASE;
  RETURN v_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3) admin_link_media_to_scope — placements by entity UUID (resolve slug)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_link_media_to_scope(
  p_scope_type text,
  p_scope_key text,
  p_role text,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before jsonb;
  v_after jsonb;
  v_item jsonb;
  v_id uuid;
  v_order integer := 0;
  v_entity_id uuid;
  v_parent_id uuid;
  v_usage text;
  v_entity_type text;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  IF p_scope_type IS NULL OR length(trim(p_scope_type)) = 0 THEN
    RAISE EXCEPTION 'scope_type is required';
  END IF;
  IF p_scope_key IS NULL OR length(trim(p_scope_key)) = 0 THEN
    RAISE EXCEPTION 'scope_key is required';
  END IF;
  IF p_role IS NULL OR length(trim(p_role)) = 0 THEN
    RAISE EXCEPTION 'role is required';
  END IF;

  v_entity_type := p_scope_type;
  v_usage := private.normalize_media_usage(p_role);
  v_entity_id := private.resolve_media_entity_id(v_entity_type, p_scope_key);

  -- Also accept UUID scope_key
  IF v_entity_id IS NULL THEN
    BEGIN
      v_entity_id := p_scope_key::uuid;
    EXCEPTION WHEN others THEN
      v_entity_id := NULL;
    END;
  END IF;

  IF v_entity_id IS NULL
     OR NOT private.media_placement_entity_exists(v_entity_type, v_entity_id, NULL) THEN
    -- For variants, parent may be needed — try resolving variant alone
    IF v_entity_type = 'experience_variant' THEN
      SELECT v.id, v.experience_id INTO v_entity_id, v_parent_id
      FROM public.experience_variants v
      WHERE v.slug = p_scope_key OR v.id::text = p_scope_key
      LIMIT 1;
    END IF;
  END IF;

  IF v_entity_type = 'experience_variant' AND v_parent_id IS NULL THEN
    SELECT v.experience_id INTO v_parent_id
    FROM public.experience_variants v WHERE v.id = v_entity_id;
  END IF;

  IF v_entity_id IS NULL
     OR NOT private.media_placement_entity_exists(v_entity_type, v_entity_id, v_parent_id) THEN
    RAISE EXCEPTION 'Unknown entity for % / %', v_entity_type, p_scope_key
      USING ERRCODE = 'P0002';
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(mp) ORDER BY mp.display_order), '[]'::jsonb)
  INTO v_before
  FROM public.media_placements mp
  WHERE mp.entity_type = v_entity_type
    AND mp.entity_id = v_entity_id
    AND mp.usage = v_usage
    AND mp.is_active = true;

  -- Detach existing placements for this entity/usage (keep assets)
  UPDATE public.media_placements
  SET is_active = false, is_primary = false, updated_at = timezone('utc', now())
  WHERE entity_type = v_entity_type
    AND entity_id = v_entity_id
    AND usage = v_usage
    AND is_active = true;

  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  LOOP
    v_id := (v_item->>'id')::uuid;
    IF v_id IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.media_assets m WHERE m.id = v_id) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.media_placements (
      media_asset_id,
      entity_type,
      entity_id,
      parent_entity_id,
      usage,
      display_order,
      is_primary,
      alt_text_override,
      caption_override,
      is_active
    )
    VALUES (
      v_id,
      v_entity_type,
      v_entity_id,
      v_parent_id,
      v_usage,
      coalesce((v_item->>'display_order')::int, v_order),
      coalesce((v_item->>'is_primary')::boolean, v_order = 0),
      CASE WHEN v_item ? 'alt_text_override' THEN v_item->>'alt_text_override' ELSE NULL END,
      CASE WHEN v_item ? 'caption_override' THEN v_item->>'caption_override' ELSE NULL END,
      coalesce((v_item->>'is_active')::boolean, true)
    );

    UPDATE public.media_assets
    SET
      status = CASE
        WHEN status = 'draft'::public.media_asset_status THEN 'published'::public.media_asset_status
        ELSE status
      END,
      published_at = coalesce(published_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    WHERE id = v_id;

    v_order := v_order + 1;
  END LOOP;

  SELECT COALESCE(jsonb_agg(to_jsonb(mp) ORDER BY mp.display_order), '[]'::jsonb)
  INTO v_after
  FROM public.media_placements mp
  WHERE mp.entity_type = v_entity_type
    AND mp.entity_id = v_entity_id
    AND mp.usage = v_usage
    AND mp.is_active = true;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.scope_linked',
    v_entity_type,
    v_entity_id::text,
    v_before,
    v_after,
    v_usage
  );

  RETURN v_after;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 4) admin_detach_media_placement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_detach_media_placement(
  p_placement_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before public.media_placements;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_before FROM public.media_placements WHERE id = p_placement_id;
  IF v_before.id IS NULL THEN
    RAISE EXCEPTION 'Placement not found' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.media_placements WHERE id = p_placement_id;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.placement_detached',
    v_before.entity_type,
    v_before.entity_id::text,
    to_jsonb(v_before),
    NULL,
    v_before.media_asset_id::text
  );

  RETURN true;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 5) admin_set_media_primary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_media_primary(
  p_placement_id uuid
)
RETURNS public.media_placements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before public.media_placements;
  v_after public.media_placements;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_before FROM public.media_placements WHERE id = p_placement_id AND is_active = true;
  IF v_before.id IS NULL THEN
    RAISE EXCEPTION 'Placement not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.media_placements
  SET is_primary = true, updated_at = timezone('utc', now())
  WHERE id = p_placement_id
  RETURNING * INTO v_after;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.primary_set',
    v_after.entity_type,
    v_after.entity_id::text,
    to_jsonb(v_before),
    to_jsonb(v_after),
    NULL
  );

  RETURN v_after;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 6) admin_finalize_media_upload — create/update asset metadata + placement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_finalize_media_upload(
  p_bucket_id text,
  p_storage_path text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_asset public.media_assets;
  v_placement public.media_placements;
  v_entity_type text;
  v_entity_id uuid;
  v_parent_id uuid;
  v_usage text;
  v_is_primary boolean;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  v_entity_type := p_payload->>'entity_type';
  v_entity_id := (p_payload->>'entity_id')::uuid;
  v_parent_id := NULLIF(p_payload->>'parent_entity_id', '')::uuid;
  v_usage := private.normalize_media_usage(coalesce(p_payload->>'usage', 'gallery'));
  v_is_primary := coalesce((p_payload->>'is_primary')::boolean, false);

  IF v_entity_type IS NULL OR v_entity_id IS NULL THEN
    RAISE EXCEPTION 'entity_type and entity_id are required';
  END IF;

  IF v_entity_type = 'experience_variant' AND v_parent_id IS NULL THEN
    SELECT v.experience_id INTO v_parent_id
    FROM public.experience_variants v WHERE v.id = v_entity_id;
  END IF;

  IF NOT private.media_placement_entity_exists(v_entity_type, v_entity_id, v_parent_id) THEN
    RAISE EXCEPTION 'Invalid entity for placement' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_asset
  FROM public.media_assets
  WHERE bucket_id = p_bucket_id AND storage_path = p_storage_path;

  IF v_asset.id IS NULL THEN
    RAISE EXCEPTION 'Media asset not found for storage path' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.media_assets SET
    original_filename = coalesce(p_payload->>'original_filename', original_filename),
    generated_filename = coalesce(p_payload->>'generated_filename', generated_filename),
    alt_text = coalesce(p_payload->>'alt_text', alt_text),
    caption = coalesce(p_payload->>'caption', caption),
    title = coalesce(p_payload->>'title', title),
    width = coalesce(NULLIF(p_payload->>'width', '')::int, width),
    height = coalesce(NULLIF(p_payload->>'height', '')::int, height),
    duration_seconds = coalesce(NULLIF(p_payload->>'duration_seconds', '')::numeric, duration_seconds),
    created_by = coalesce(created_by, v_actor),
    status = 'published'::public.media_asset_status,
    visibility = 'public'::public.media_visibility,
    is_active = true,
    published_at = coalesce(published_at, timezone('utc', now())),
    folder_path = coalesce(p_payload->>'folder_path', folder_path),
    updated_at = timezone('utc', now())
  WHERE id = v_asset.id
  RETURNING * INTO v_asset;

  INSERT INTO public.media_placements (
    media_asset_id,
    entity_type,
    entity_id,
    parent_entity_id,
    usage,
    alt_text_override,
    caption_override,
    display_order,
    is_primary,
    is_active
  )
  VALUES (
    v_asset.id,
    v_entity_type,
    v_entity_id,
    v_parent_id,
    v_usage,
    NULLIF(p_payload->>'alt_text', ''),
    NULLIF(p_payload->>'caption', ''),
    coalesce((p_payload->>'display_order')::int, 0),
    v_is_primary,
    true
  )
  RETURNING * INTO v_placement;

  -- Sync legacy hero path for experiences when primary hero
  IF v_entity_type = 'experience' AND v_usage = 'hero' AND v_placement.is_primary THEN
    UPDATE public.experiences
    SET hero_image_path = v_asset.storage_path, updated_at = timezone('utc', now())
    WHERE id = v_entity_id;
  END IF;

  IF v_entity_type = 'team_member' AND v_usage = 'avatar' AND v_placement.is_primary THEN
    UPDATE public.team_members
    SET photo_path = v_asset.storage_path, updated_at = timezone('utc', now())
    WHERE id = v_entity_id;
  END IF;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.uploaded',
    'media_asset',
    v_asset.id::text,
    NULL,
    jsonb_build_object('asset', to_jsonb(v_asset), 'placement', to_jsonb(v_placement)),
    NULL
  );

  RETURN jsonb_build_object(
    'asset', to_jsonb(v_asset),
    'placement', to_jsonb(v_placement),
    'used_by', private.media_asset_used_by(v_asset.id)
  );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 7) admin_list_media — extended filters (drop + recreate for arity change)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_list_media(text, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_media(
  p_search text DEFAULT NULL,
  p_media_type text DEFAULT NULL,
  p_usage text DEFAULT NULL,
  p_scope_type text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 24,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_placement_usage text DEFAULT NULL,
  p_mime_type text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_page integer := GREATEST(coalesce(p_page, 1), 1);
  v_size integer := LEAST(GREATEST(coalesce(p_page_size, 24), 1), 100);
  v_offset integer;
  v_total bigint;
  v_items jsonb;
  v_entity_type text := coalesce(NULLIF(p_entity_type, ''), p_scope_type);
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'operations_staff',
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  v_offset := (v_page - 1) * v_size;

  WITH filtered AS (
    SELECT m.*
    FROM public.media_assets m
    WHERE (p_media_type IS NULL OR m.media_type = p_media_type)
      AND (p_mime_type IS NULL OR m.mime_type ILIKE p_mime_type || '%')
      AND (
        p_search IS NULL OR length(trim(p_search)) = 0
        OR m.asset_key ILIKE '%' || p_search || '%'
        OR coalesce(m.title, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.alt_text, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.storage_path, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.original_filename, '') ILIKE '%' || p_search || '%'
      )
      AND (
        v_entity_type IS NULL
        OR EXISTS (
          SELECT 1 FROM public.media_placements mp
          WHERE mp.media_asset_id = m.id
            AND mp.is_active = true
            AND mp.entity_type = v_entity_type
            AND (p_entity_id IS NULL OR mp.entity_id = p_entity_id)
            AND (
              p_placement_usage IS NULL
              OR mp.usage = private.normalize_media_usage(p_placement_usage)
            )
        )
      )
      AND (
        p_usage IS NULL
        OR (p_usage = 'used' AND jsonb_array_length(private.media_asset_used_by(m.id)) > 0)
        OR (p_usage = 'unused' AND jsonb_array_length(private.media_asset_used_by(m.id)) = 0)
      )
  )
  SELECT count(*) INTO v_total FROM filtered;

  SELECT COALESCE(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT
      f.*,
      private.media_asset_used_by(f.id) AS used_by
    FROM filtered f
    ORDER BY f.updated_at DESC
    LIMIT v_size OFFSET v_offset
  ) x;

  RETURN jsonb_build_object(
    'items', v_items,
    'page', v_page,
    'page_size', v_size,
    'total', v_total
  );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 8) Extend admin_reference_data with selectors for upload
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_reference_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'operations_staff',
    'customer_support',
    'finance_manager',
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  RETURN jsonb_build_object(
    'experiences', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', e.id,
        'slug', e.slug,
        'title', e.title,
        'name', e.title,
        'status', e.status,
        'experience_type', e.experience_type,
        'thumbnail', (
          SELECT ma.bucket_id || '/' || ma.storage_path
          FROM public.media_placements mp
          JOIN public.media_assets ma ON ma.id = mp.media_asset_id
          WHERE mp.entity_type = 'experience'
            AND mp.entity_id = e.id
            AND mp.usage = 'hero'
            AND mp.is_active = true
          ORDER BY mp.is_primary DESC, mp.display_order
          LIMIT 1
        )
      ) ORDER BY e.sort_order, e.title), '[]'::jsonb)
      FROM public.experiences e
    ),
    'variants', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', v.id,
        'experience_id', v.experience_id,
        'parent_id', v.experience_id,
        'name', v.name,
        'slug', v.slug,
        'status', CASE WHEN v.is_active THEN 'active' ELSE 'inactive' END,
        'is_active', v.is_active
      ) ORDER BY v.name), '[]'::jsonb)
      FROM public.experience_variants v
    ),
    'locations', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', l.id,
        'name', l.name,
        'slug', l.slug,
        'status', CASE WHEN l.is_active THEN 'active' ELSE 'inactive' END,
        'is_active', l.is_active,
        'city', l.city
      ) ORDER BY l.city, l.name), '[]'::jsonb)
      FROM public.locations l
    ),
    'team_members', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', t.id,
        'display_name', coalesce(t.display_name, t.first_name || ' ' || t.last_name),
        'name', coalesce(t.display_name, t.first_name || ' ' || t.last_name),
        'slug', t.slug,
        'role_title', t.role_title,
        'status', CASE WHEN t.is_active THEN 'active' ELSE 'inactive' END,
        'is_active', t.is_active,
        'thumbnail', t.photo_path
      ) ORDER BY t.display_order, t.display_name), '[]'::jsonb)
      FROM public.team_members t
    ),
    'partners', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'slug', p.slug,
        'status', p.status,
        'referral_code', p.referral_code
      ) ORDER BY p.name), '[]'::jsonb)
      FROM public.partners p
    ),
    'site_content_sections', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', s.id,
        'section_key', s.section_key,
        'slug', s.section_key,
        'name', s.label,
        'label', s.label,
        'status', CASE WHEN s.is_active THEN 'active' ELSE 'inactive' END,
        'is_active', s.is_active
      ) ORDER BY s.label), '[]'::jsonb)
      FROM public.site_content_sections s
    ),
    'roles', (
      SELECT jsonb_agg(x) FROM unnest(enum_range(NULL::public.app_role)) x
    )
  );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 9) Grants
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_detach_media_placement(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_media_primary(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_finalize_media_upload(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_media(text, text, text, text, integer, integer, text, uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_detach_media_placement(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_media_primary(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_finalize_media_upload(text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_media(text, text, text, text, integer, integer, text, uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_link_media_to_scope(text, text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reference_data() TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 10) brand-assets storage policies: allow locations + site folders
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Brand assets authenticated uploads" ON storage.objects;
CREATE POLICY "Brand assets authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = ANY (ARRAY[
    'logos'::text,
    'team'::text,
    'partners'::text,
    'website'::text,
    'documents'::text,
    'locations'::text,
    'site'::text
  ])
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.profile_id = (SELECT auth.uid())
      AND ur.role = ANY (ARRAY[
        'content_manager'::public.app_role,
        'administrator'::public.app_role,
        'super_administrator'::public.app_role
      ])
  )
);

DROP POLICY IF EXISTS "Brand assets authenticated updates" ON storage.objects;
CREATE POLICY "Brand assets authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.profile_id = (SELECT auth.uid())
      AND ur.role = ANY (ARRAY[
        'content_manager'::public.app_role,
        'administrator'::public.app_role,
        'super_administrator'::public.app_role
      ])
  )
)
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = ANY (ARRAY[
    'logos'::text,
    'team'::text,
    'partners'::text,
    'website'::text,
    'documents'::text,
    'locations'::text,
    'site'::text
  ])
);
