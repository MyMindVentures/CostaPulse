-- Restrict media metadata edits to an explicit field allowlist and audit only changes.
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
  v_allowed constant text[] := ARRAY[
    'title','alt_text','caption','description','tags','status','visibility',
    'is_active','published_at','starts_at','ends_at','focal_x','focal_y',
    'dominant_color','display_order','is_primary','link_url','open_in_new_tab',
    'placement_key','scope_type','scope_key','page_path','section_key',
    'component_key','locale','breakpoint','role','variant'
  ];
  v_before_changed jsonb;
  v_after_changed jsonb;
BEGIN
  v_actor := private.assert_actor_roles(ARRAY[
    'content_manager','administrator','super_administrator'
  ]::public.app_role[]);

  IF p_payload IS NULL OR p_payload = '{}'::jsonb THEN
    RAISE EXCEPTION 'No media asset changes supplied';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_payload) key WHERE NOT key = ANY(v_allowed)) THEN
    RAISE EXCEPTION 'Media asset payload contains unsupported fields';
  END IF;

  SELECT * INTO v_before FROM public.media_assets WHERE id = p_id FOR UPDATE;
  IF v_before.id IS NULL THEN
    RAISE EXCEPTION 'Media asset not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_payload ? 'focal_x' AND (p_payload->>'focal_x')::numeric NOT BETWEEN 0 AND 100
    OR p_payload ? 'focal_y' AND (p_payload->>'focal_y')::numeric NOT BETWEEN 0 AND 100 THEN
    RAISE EXCEPTION 'Focal coordinates must be between 0 and 100';
  END IF;
  IF p_payload ? 'dominant_color' AND p_payload->>'dominant_color' IS NOT NULL
    AND p_payload->>'dominant_color' !~ '^#[0-9A-Fa-f]{6}$' THEN
    RAISE EXCEPTION 'Invalid dominant color';
  END IF;
  IF p_payload ? 'starts_at' AND p_payload ? 'ends_at'
    AND p_payload->>'starts_at' IS NOT NULL AND p_payload->>'ends_at' IS NOT NULL
    AND (p_payload->>'starts_at')::timestamptz >= (p_payload->>'ends_at')::timestamptz THEN
    RAISE EXCEPTION 'Start must be before end';
  END IF;

  UPDATE public.media_assets SET
    title = CASE WHEN p_payload ? 'title' THEN p_payload->>'title' ELSE title END,
    alt_text = CASE WHEN p_payload ? 'alt_text' THEN p_payload->>'alt_text' ELSE alt_text END,
    caption = CASE WHEN p_payload ? 'caption' THEN p_payload->>'caption' ELSE caption END,
    description = CASE WHEN p_payload ? 'description' THEN p_payload->>'description' ELSE description END,
    tags = CASE WHEN p_payload ? 'tags' THEN ARRAY(SELECT DISTINCT trim(value) FROM jsonb_array_elements_text(p_payload->'tags') value WHERE trim(value) <> '') ELSE tags END,
    status = CASE WHEN p_payload ? 'status' THEN (p_payload->>'status')::public.media_asset_status ELSE status END,
    visibility = CASE WHEN p_payload ? 'visibility' THEN (p_payload->>'visibility')::public.media_visibility ELSE visibility END,
    is_active = CASE WHEN p_payload ? 'is_active' THEN (p_payload->>'is_active')::boolean ELSE is_active END,
    published_at = CASE
      WHEN p_payload ? 'published_at' THEN (p_payload->>'published_at')::timestamptz
      WHEN p_payload ? 'status' AND p_payload->>'status' = 'published' AND published_at IS NULL THEN timezone('utc', now())
      ELSE published_at END,
    starts_at = CASE WHEN p_payload ? 'starts_at' THEN (p_payload->>'starts_at')::timestamptz ELSE starts_at END,
    ends_at = CASE WHEN p_payload ? 'ends_at' THEN (p_payload->>'ends_at')::timestamptz ELSE ends_at END,
    focal_x = CASE WHEN p_payload ? 'focal_x' THEN (p_payload->>'focal_x')::numeric ELSE focal_x END,
    focal_y = CASE WHEN p_payload ? 'focal_y' THEN (p_payload->>'focal_y')::numeric ELSE focal_y END,
    dominant_color = CASE WHEN p_payload ? 'dominant_color' THEN p_payload->>'dominant_color' ELSE dominant_color END,
    display_order = CASE WHEN p_payload ? 'display_order' THEN (p_payload->>'display_order')::integer ELSE display_order END,
    is_primary = CASE WHEN p_payload ? 'is_primary' THEN (p_payload->>'is_primary')::boolean ELSE is_primary END,
    link_url = CASE WHEN p_payload ? 'link_url' THEN p_payload->>'link_url' ELSE link_url END,
    open_in_new_tab = CASE WHEN p_payload ? 'open_in_new_tab' THEN (p_payload->>'open_in_new_tab')::boolean ELSE open_in_new_tab END,
    placement_key = CASE WHEN p_payload ? 'placement_key' THEN p_payload->>'placement_key' ELSE placement_key END,
    scope_type = CASE WHEN p_payload ? 'scope_type' THEN p_payload->>'scope_type' ELSE scope_type END,
    scope_key = CASE WHEN p_payload ? 'scope_key' THEN p_payload->>'scope_key' ELSE scope_key END,
    page_path = CASE WHEN p_payload ? 'page_path' THEN p_payload->>'page_path' ELSE page_path END,
    section_key = CASE WHEN p_payload ? 'section_key' THEN p_payload->>'section_key' ELSE section_key END,
    component_key = CASE WHEN p_payload ? 'component_key' THEN p_payload->>'component_key' ELSE component_key END,
    locale = CASE WHEN p_payload ? 'locale' THEN p_payload->>'locale' ELSE locale END,
    breakpoint = CASE WHEN p_payload ? 'breakpoint' THEN p_payload->>'breakpoint' ELSE breakpoint END,
    role = CASE WHEN p_payload ? 'role' THEN p_payload->>'role' ELSE role END,
    variant = CASE WHEN p_payload ? 'variant' THEN p_payload->>'variant' ELSE variant END,
    updated_at = timezone('utc', now())
  WHERE id = p_id RETURNING * INTO v_after;

  SELECT coalesce(jsonb_object_agg(b.key, b.value), '{}'::jsonb),
         coalesce(jsonb_object_agg(a.key, a.value), '{}'::jsonb)
  INTO v_before_changed, v_after_changed
  FROM jsonb_each(to_jsonb(v_before)) b
  JOIN jsonb_each(to_jsonb(v_after)) a USING (key)
  WHERE b.key = ANY(v_allowed) AND b.value IS DISTINCT FROM a.value;

  IF v_before_changed = '{}'::jsonb THEN
    RAISE EXCEPTION 'No media asset changes supplied';
  END IF;

  PERFORM private.write_admin_audit(v_actor, 'media_asset.updated', 'media_asset',
    p_id::text, v_before_changed, v_after_changed, NULL);
  RETURN v_after;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_upsert_media_asset(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_media_asset(uuid, jsonb) TO authenticated, service_role;
