-- Keep the admin media list contract unchanged while ensuring each statement
-- defines the CTE it reads. PostgreSQL CTEs are scoped to one statement.
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
        p_search IS NULL
        OR length(trim(p_search)) = 0
        OR m.asset_key ILIKE '%' || p_search || '%'
        OR coalesce(m.title, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.alt_text, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.storage_path, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.original_filename, '') ILIKE '%' || p_search || '%'
      )
      AND (
        v_entity_type IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.media_placements mp
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
        OR (
          p_usage = 'used'
          AND jsonb_array_length(private.media_asset_used_by(m.id)) > 0
        )
        OR (
          p_usage = 'unused'
          AND jsonb_array_length(private.media_asset_used_by(m.id)) = 0
        )
      )
  )
  SELECT count(*) INTO v_total FROM filtered;

  WITH filtered AS (
    SELECT m.*
    FROM public.media_assets m
    WHERE (p_media_type IS NULL OR m.media_type = p_media_type)
      AND (p_mime_type IS NULL OR m.mime_type ILIKE p_mime_type || '%')
      AND (
        p_search IS NULL
        OR length(trim(p_search)) = 0
        OR m.asset_key ILIKE '%' || p_search || '%'
        OR coalesce(m.title, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.alt_text, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.storage_path, '') ILIKE '%' || p_search || '%'
        OR coalesce(m.original_filename, '') ILIKE '%' || p_search || '%'
      )
      AND (
        v_entity_type IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.media_placements mp
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
        OR (
          p_usage = 'used'
          AND jsonb_array_length(private.media_asset_used_by(m.id)) > 0
        )
        OR (
          p_usage = 'unused'
          AND jsonb_array_length(private.media_asset_used_by(m.id)) = 0
        )
      )
  )
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

REVOKE ALL ON FUNCTION public.admin_list_media(
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  uuid,
  text,
  text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_list_media(
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  uuid,
  text,
  text
) TO authenticated, service_role;
