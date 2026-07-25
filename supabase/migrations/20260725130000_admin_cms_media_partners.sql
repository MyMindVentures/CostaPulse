-- Admin CMS: fix experience detail media, partner CRM fields, media admin RPCs.

-- ---------------------------------------------------------------------------
-- 1) Partner CRM columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address_line_1 text,
  ADD COLUMN IF NOT EXISTS address_line_2 text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS country_code character(2) DEFAULT 'ES';

ALTER TABLE public.partners
  DROP CONSTRAINT IF EXISTS partners_country_code_upper_chk;

ALTER TABLE public.partners
  ADD CONSTRAINT partners_country_code_upper_chk
  CHECK (country_code IS NULL OR country_code::text = upper(country_code::text));

-- ---------------------------------------------------------------------------
-- 2) Harden storage → media_assets sync (asset_key + media_type required)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_media_asset_from_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $function$
DECLARE
  object_id uuid;
  object_bucket text;
  object_path text;
  object_mime text;
  object_size bigint;
  object_etag text;
  object_created timestamptz;
  derived_key text;
  derived_type text;
  folder text;
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

  derived_key := lower(regexp_replace(replace(object_path, '/', '-'), '[^a-z0-9]+', '-', 'g'));
  derived_key := trim(both '-' from derived_key);
  IF derived_key IS NULL OR length(derived_key) = 0 THEN
    derived_key := 'asset-' || replace(object_id::text, '-', '');
  END IF;

  derived_type := CASE
    WHEN object_mime ILIKE 'image/%' THEN 'image'
    WHEN object_mime ILIKE 'video/%' THEN 'video'
    WHEN object_mime ILIKE 'audio/%' THEN 'audio'
    WHEN object_mime ILIKE 'application/pdf' OR object_mime ILIKE '%document%' OR object_mime ILIKE 'text/%' THEN 'document'
    WHEN object_mime ILIKE 'image/svg%' THEN 'vector'
    ELSE 'other'
  END;

  folder := NULLIF(split_part(object_path, '/', 1), '');

  INSERT INTO public.media_assets (
    storage_object_id,
    bucket_id,
    storage_path,
    mime_type,
    byte_size,
    etag,
    asset_key,
    media_type,
    folder_path,
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
    derived_key,
    derived_type,
    folder,
    COALESCE(object_created, timezone('utc'::text, now())),
    timezone('utc'::text, now())
  )
  ON CONFLICT (bucket_id, storage_path) DO UPDATE
  SET
    storage_object_id = EXCLUDED.storage_object_id,
    mime_type = COALESCE(EXCLUDED.mime_type, public.media_assets.mime_type),
    byte_size = COALESCE(EXCLUDED.byte_size, public.media_assets.byte_size),
    etag = COALESCE(EXCLUDED.etag, public.media_assets.etag),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 3) Fix admin_experience_detail to use media_assets
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_experience_detail(p_experience_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_result jsonb;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'operations_staff',
    'customer_support',
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT to_jsonb(e) || jsonb_build_object(
    'variants', COALESCE((
      SELECT jsonb_agg(to_jsonb(v) ORDER BY v.is_default DESC, v.name)
      FROM public.experience_variants v
      WHERE v.experience_id = e.id
    ), '[]'::jsonb),
    'media', COALESCE((
      SELECT jsonb_agg(to_jsonb(m) ORDER BY m.is_primary DESC, m.display_order, m.created_at)
      FROM public.media_assets m
      WHERE m.scope_type = 'experience'
        AND m.scope_key = e.slug
        AND m.is_active = true
    ), '[]'::jsonb),
    'locations', COALESCE((
      SELECT jsonb_agg(to_jsonb(el) || jsonb_build_object('location', to_jsonb(l)) ORDER BY el.is_primary DESC, el.display_order)
      FROM public.experience_locations el
      JOIN public.locations l ON l.id = el.location_id
      WHERE el.experience_id = e.id
    ), '[]'::jsonb),
    'itinerary', COALESCE((
      SELECT jsonb_agg(to_jsonb(i) ORDER BY i.display_order)
      FROM public.experience_itinerary_steps i
      WHERE i.experience_id = e.id
    ), '[]'::jsonb),
    'requirements', COALESCE((
      SELECT jsonb_agg(to_jsonb(r) ORDER BY r.display_order)
      FROM public.experience_requirements r
      WHERE r.experience_id = e.id
    ), '[]'::jsonb),
    'policies', COALESCE((
      SELECT jsonb_agg(to_jsonb(p) ORDER BY p.display_order)
      FROM public.experience_policies p
      WHERE p.experience_id = e.id
    ), '[]'::jsonb),
    'languages', COALESCE((
      SELECT jsonb_agg(to_jsonb(lg) ORDER BY lg.is_primary DESC, lg.display_name)
      FROM public.experience_languages lg
      WHERE lg.experience_id = e.id
    ), '[]'::jsonb),
    'addons', COALESCE((
      SELECT jsonb_agg(to_jsonb(a) ORDER BY a.display_order)
      FROM public.experience_addons a
      WHERE a.experience_id = e.id
    ), '[]'::jsonb),
    'team_members', COALESCE((
      SELECT jsonb_agg(to_jsonb(tme) || jsonb_build_object('team_member', to_jsonb(tm)) ORDER BY tme.is_primary DESC, tme.display_order)
      FROM public.team_member_experiences tme
      JOIN public.team_members tm ON tm.id = tme.team_member_id
      WHERE tme.experience_id = e.id
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.experiences e
  WHERE e.id = p_experience_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Experience not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_result;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 4) Update admin_upsert_partner for CRM fields
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_upsert_partner(
  p_id uuid DEFAULT NULL::uuid,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS partners
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before public.partners;
  v_after public.partners;
  v_id uuid := coalesce(p_id, extensions.gen_random_uuid());
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'operations_staff',
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_before FROM public.partners WHERE id = v_id;

  INSERT INTO public.partners (
    id,
    owner_profile_id,
    slug,
    name,
    referral_code,
    status,
    attribution_window_hours,
    voucher_percent_basis_points,
    website_url,
    business_type,
    contact_name,
    phone,
    email,
    address_line_1,
    address_line_2,
    postal_code,
    city,
    province,
    country_code
  )
  VALUES (
    v_id,
    (p_payload->>'owner_profile_id')::uuid,
    p_payload->>'slug',
    p_payload->>'name',
    coalesce(p_payload->>'referral_code', public.generate_public_code('REF')),
    coalesce((p_payload->>'status')::public.partner_status, 'draft'),
    coalesce((p_payload->>'attribution_window_hours')::int, 720),
    coalesce((p_payload->>'voucher_percent_basis_points')::int, 1000),
    p_payload->>'website_url',
    p_payload->>'business_type',
    p_payload->>'contact_name',
    p_payload->>'phone',
    p_payload->>'email',
    p_payload->>'address_line_1',
    p_payload->>'address_line_2',
    p_payload->>'postal_code',
    p_payload->>'city',
    p_payload->>'province',
    coalesce(p_payload->>'country_code', 'ES')
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_profile_id = excluded.owner_profile_id,
    slug = excluded.slug,
    name = excluded.name,
    referral_code = excluded.referral_code,
    status = excluded.status,
    attribution_window_hours = excluded.attribution_window_hours,
    voucher_percent_basis_points = excluded.voucher_percent_basis_points,
    website_url = excluded.website_url,
    business_type = excluded.business_type,
    contact_name = excluded.contact_name,
    phone = excluded.phone,
    email = excluded.email,
    address_line_1 = excluded.address_line_1,
    address_line_2 = excluded.address_line_2,
    postal_code = excluded.postal_code,
    city = excluded.city,
    province = excluded.province,
    country_code = excluded.country_code,
    updated_at = timezone('utc', now())
  RETURNING * INTO v_after;

  PERFORM private.write_admin_audit(
    v_actor,
    CASE WHEN v_before.id IS NULL THEN 'partner.created' ELSE 'partner.updated' END,
    'partner',
    v_id::text,
    to_jsonb(v_before),
    to_jsonb(v_after),
    NULL
  );

  RETURN v_after;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 5) Experience list for CMS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_experiences(
  p_search text DEFAULT NULL,
  p_status public.publication_status DEFAULT NULL
)
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
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  RETURN COALESCE((
    SELECT jsonb_agg(to_jsonb(h) ORDER BY h.sort_order, h.title)
    FROM public.admin_experience_health h
    WHERE (p_status IS NULL OR h.status = p_status)
      AND (
        p_search IS NULL
        OR length(trim(p_search)) = 0
        OR h.title ILIKE '%' || trim(p_search) || '%'
        OR h.slug ILIKE '%' || trim(p_search) || '%'
      )
  ), '[]'::jsonb);
END;
$function$;

-- ---------------------------------------------------------------------------
-- 6) Media usage helper
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
        'kind', 'scope',
        'scope_type', p_asset.scope_type,
        'scope_key', p_asset.scope_key,
        'role', p_asset.role,
        'label', p_asset.scope_type || ':' || coalesce(p_asset.scope_key, '')
      ) AS x
      WHERE p_asset.scope_type IS NOT NULL
        AND p_asset.scope_type <> 'global'
        AND coalesce(p_asset.scope_key, '') <> ''
        AND coalesce(p_asset.scope_key, '') <> 'media-library'

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

      UNION ALL

      SELECT jsonb_build_object(
        'kind', 'team_photo',
        'entity_id', tm.id,
        'label', 'team_photo:' || tm.slug
      )
      FROM public.team_members tm
      WHERE tm.photo_path = p_asset.storage_path
         OR tm.hero_image_path = p_asset.storage_path
         OR tm.signature_path = p_asset.storage_path
    ) refs
  ), '[]'::jsonb);
END;
$function$;

-- ---------------------------------------------------------------------------
-- 7) admin_list_media
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_media(
  p_search text DEFAULT NULL,
  p_media_type text DEFAULT NULL,
  p_usage text DEFAULT NULL,
  p_scope_type text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 24
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
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'operations_staff',
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  v_offset := (v_page - 1) * v_size;

  WITH filtered AS (
    SELECT m.*, private.media_asset_used_by(m.id) AS used_by
    FROM public.media_assets m
    WHERE (p_media_type IS NULL OR m.media_type = p_media_type)
      AND (p_scope_type IS NULL OR m.scope_type = p_scope_type)
      AND (
        p_search IS NULL
        OR length(trim(p_search)) = 0
        OR m.title ILIKE '%' || trim(p_search) || '%'
        OR m.alt_text ILIKE '%' || trim(p_search) || '%'
        OR m.storage_path ILIKE '%' || trim(p_search) || '%'
        OR m.asset_key ILIKE '%' || trim(p_search) || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(m.tags) t WHERE t ILIKE '%' || trim(p_search) || '%'
        )
      )
      AND (
        p_usage IS NULL
        OR p_usage = ''
        OR (p_usage = 'used' AND jsonb_array_length(private.media_asset_used_by(m.id)) > 0)
        OR (p_usage = 'unused' AND jsonb_array_length(private.media_asset_used_by(m.id)) = 0)
      )
  )
  SELECT count(*) INTO v_total FROM filtered;

  WITH filtered AS (
    SELECT m.*, private.media_asset_used_by(m.id) AS used_by
    FROM public.media_assets m
    WHERE (p_media_type IS NULL OR m.media_type = p_media_type)
      AND (p_scope_type IS NULL OR m.scope_type = p_scope_type)
      AND (
        p_search IS NULL
        OR length(trim(p_search)) = 0
        OR m.title ILIKE '%' || trim(p_search) || '%'
        OR m.alt_text ILIKE '%' || trim(p_search) || '%'
        OR m.storage_path ILIKE '%' || trim(p_search) || '%'
        OR m.asset_key ILIKE '%' || trim(p_search) || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(m.tags) t WHERE t ILIKE '%' || trim(p_search) || '%'
        )
      )
      AND (
        p_usage IS NULL
        OR p_usage = ''
        OR (p_usage = 'used' AND jsonb_array_length(private.media_asset_used_by(m.id)) > 0)
        OR (p_usage = 'unused' AND jsonb_array_length(private.media_asset_used_by(m.id)) = 0)
      )
  )
  SELECT COALESCE(
    jsonb_agg(
      (to_jsonb(f) - 'used_by') || jsonb_build_object('used_by', f.used_by)
      ORDER BY f.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_items
  FROM (
    SELECT *
    FROM filtered
    ORDER BY created_at DESC
    LIMIT v_size OFFSET v_offset
  ) f;

  RETURN jsonb_build_object(
    'items', v_items,
    'page', v_page,
    'page_size', v_size,
    'total', v_total
  );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 8) admin_upsert_media_asset
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_upsert_media_asset(
  p_id uuid,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS public.media_assets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before public.media_assets;
  v_after public.media_assets;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_before FROM public.media_assets WHERE id = p_id;
  IF v_before.id IS NULL THEN
    RAISE EXCEPTION 'Media asset not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.media_assets SET
    title = CASE WHEN p_payload ? 'title' THEN p_payload->>'title' ELSE title END,
    alt_text = CASE WHEN p_payload ? 'alt_text' THEN p_payload->>'alt_text' ELSE alt_text END,
    caption = CASE WHEN p_payload ? 'caption' THEN p_payload->>'caption' ELSE caption END,
    description = CASE WHEN p_payload ? 'description' THEN p_payload->>'description' ELSE description END,
    tags = CASE
      WHEN p_payload ? 'tags' AND jsonb_typeof(p_payload->'tags') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'tags'))
      ELSE tags
    END,
    status = CASE
      WHEN p_payload ? 'status' THEN (p_payload->>'status')::public.media_asset_status
      ELSE status
    END,
    visibility = CASE
      WHEN p_payload ? 'visibility' THEN (p_payload->>'visibility')::public.media_visibility
      ELSE visibility
    END,
    width = CASE WHEN p_payload ? 'width' THEN NULLIF(p_payload->>'width', '')::int ELSE width END,
    height = CASE WHEN p_payload ? 'height' THEN NULLIF(p_payload->>'height', '')::int ELSE height END,
    focal_x = CASE WHEN p_payload ? 'focal_x' THEN (p_payload->>'focal_x')::numeric ELSE focal_x END,
    focal_y = CASE WHEN p_payload ? 'focal_y' THEN (p_payload->>'focal_y')::numeric ELSE focal_y END,
    placement_key = CASE WHEN p_payload ? 'placement_key' THEN p_payload->>'placement_key' ELSE placement_key END,
    scope_type = CASE WHEN p_payload ? 'scope_type' THEN p_payload->>'scope_type' ELSE scope_type END,
    scope_key = CASE WHEN p_payload ? 'scope_key' THEN p_payload->>'scope_key' ELSE scope_key END,
    role = CASE WHEN p_payload ? 'role' THEN coalesce(p_payload->>'role', role) ELSE role END,
    display_order = CASE
      WHEN p_payload ? 'display_order' THEN coalesce((p_payload->>'display_order')::int, display_order)
      ELSE display_order
    END,
    is_primary = CASE
      WHEN p_payload ? 'is_primary' THEN coalesce((p_payload->>'is_primary')::boolean, is_primary)
      ELSE is_primary
    END,
    is_active = CASE
      WHEN p_payload ? 'is_active' THEN coalesce((p_payload->>'is_active')::boolean, is_active)
      ELSE is_active
    END,
    alt_text_override = CASE
      WHEN p_payload ? 'alt_text_override' THEN p_payload->>'alt_text_override'
      ELSE alt_text_override
    END,
    caption_override = CASE
      WHEN p_payload ? 'caption_override' THEN p_payload->>'caption_override'
      ELSE caption_override
    END,
    folder_path = CASE WHEN p_payload ? 'folder_path' THEN p_payload->>'folder_path' ELSE folder_path END,
    published_at = CASE
      WHEN p_payload ? 'status' AND (p_payload->>'status') = 'published' AND published_at IS NULL
      THEN timezone('utc', now())
      ELSE published_at
    END,
    updated_at = timezone('utc', now())
  WHERE id = p_id
  RETURNING * INTO v_after;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.updated',
    'media_asset',
    p_id::text,
    to_jsonb(v_before),
    to_jsonb(v_after),
    NULL
  );

  RETURN v_after;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 9) admin_link_media_to_scope — replace ordered placements for a scope/role
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

  SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order), '[]'::jsonb)
  INTO v_before
  FROM public.media_assets m
  WHERE m.scope_type = p_scope_type
    AND m.scope_key = p_scope_key
    AND m.role = p_role;

  -- Clear existing placement for this scope/role (return to library)
  UPDATE public.media_assets
  SET
    scope_type = 'global',
    scope_key = 'media-library',
    role = 'content',
    placement_key = 'library',
    is_primary = false,
    updated_at = timezone('utc', now())
  WHERE scope_type = p_scope_type
    AND scope_key = p_scope_key
    AND role = p_role;

  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  LOOP
    v_id := (v_item->>'id')::uuid;
    IF v_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.media_assets
    SET
      scope_type = p_scope_type,
      scope_key = p_scope_key,
      role = p_role,
      placement_key = coalesce(v_item->>'placement_key', p_role),
      display_order = coalesce((v_item->>'display_order')::int, v_order),
      is_primary = coalesce((v_item->>'is_primary')::boolean, v_order = 0),
      alt_text_override = CASE WHEN v_item ? 'alt_text_override' THEN v_item->>'alt_text_override' ELSE alt_text_override END,
      caption_override = CASE WHEN v_item ? 'caption_override' THEN v_item->>'caption_override' ELSE caption_override END,
      is_active = coalesce((v_item->>'is_active')::boolean, true),
      status = CASE
        WHEN status = 'draft'::public.media_asset_status THEN 'published'::public.media_asset_status
        ELSE status
      END,
      published_at = coalesce(published_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    WHERE id = v_id;

    v_order := v_order + 1;
  END LOOP;

  SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order), '[]'::jsonb)
  INTO v_after
  FROM public.media_assets m
  WHERE m.scope_type = p_scope_type
    AND m.scope_key = p_scope_key
    AND m.role = p_role;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.scope_linked',
    p_scope_type,
    p_scope_key,
    v_before,
    v_after,
    p_role
  );

  RETURN v_after;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 10) admin_delete_media — refuse if used; delete storage object
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_media(
  p_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'storage', 'pg_catalog'
AS $function$
DECLARE
  v_actor uuid;
  v_before public.media_assets;
  v_used jsonb;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager',
    'administrator',
    'super_administrator'
  ]::public.app_role[]);

  SELECT * INTO v_before FROM public.media_assets WHERE id = p_id;
  IF v_before.id IS NULL THEN
    RAISE EXCEPTION 'Media asset not found' USING ERRCODE = 'P0002';
  END IF;

  v_used := private.media_asset_used_by(v_before.id);
  IF jsonb_array_length(v_used) > 0 THEN
    RAISE EXCEPTION 'Media asset is still in use: %', v_used::text
      USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = v_before.bucket_id
    AND name = v_before.storage_path;

  DELETE FROM public.media_assets WHERE id = p_id;

  PERFORM private.write_admin_audit(
    v_actor,
    'media.deleted',
    'media_asset',
    p_id::text,
    to_jsonb(v_before) || jsonb_build_object('used_by', v_used),
    NULL,
    p_reason
  );

  RETURN true;
END;
$function$;

-- ---------------------------------------------------------------------------
-- Grants (match existing admin RPC surface)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_list_experiences(text, public.publication_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_media(text, text, text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_media_asset(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_link_media_to_scope(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_media(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_experiences(text, public.publication_status) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_media(text, text, text, text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_media_asset(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_link_media_to_scope(text, text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_media(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_experience_detail(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_partner(uuid, jsonb) TO authenticated, service_role;
