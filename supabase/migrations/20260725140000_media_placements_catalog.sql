-- Media placements: many-to-many links between media_assets and domain entities.
-- media_assets remains the Storage catalog; placements hold entity UUID + usage.

-- ---------------------------------------------------------------------------
-- 1) Catalog filename columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS generated_filename text;

-- ---------------------------------------------------------------------------
-- 2) Site content sections registry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content_sections (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  section_key text NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT site_content_sections_section_key_key UNIQUE (section_key),
  CONSTRAINT site_content_sections_section_key_format_check
    CHECK (section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

INSERT INTO public.site_content_sections (section_key, label)
VALUES
  ('home', 'Home'),
  ('website', 'Website'),
  ('logos', 'Logos'),
  ('documents', 'Documents'),
  ('partners', 'Partners (site)'),
  ('team', 'Team (site)')
ON CONFLICT (section_key) DO NOTHING;

ALTER TABLE public.site_content_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active site content sections" ON public.site_content_sections;
CREATE POLICY "Public can read active site content sections"
ON public.site_content_sections
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Staff can read all site content sections" ON public.site_content_sections;
CREATE POLICY "Staff can read all site content sections"
ON public.site_content_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.profile_id = auth.uid()
      AND ur.role = ANY (ARRAY[
        'content_manager'::public.app_role,
        'administrator'::public.app_role,
        'super_administrator'::public.app_role,
        'operations_staff'::public.app_role
      ])
  )
);

GRANT SELECT ON public.site_content_sections TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) media_placements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_placements (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  media_asset_id uuid NOT NULL REFERENCES public.media_assets (id) ON DELETE RESTRICT,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  parent_entity_id uuid NULL,
  usage text NOT NULL,
  alt_text_override text,
  caption_override text,
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  locale text,
  breakpoint text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT media_placements_entity_type_check CHECK (
    entity_type = ANY (ARRAY[
      'experience'::text,
      'experience_variant'::text,
      'location'::text,
      'team_member'::text,
      'partner'::text,
      'site_content'::text
    ])
  ),
  CONSTRAINT media_placements_usage_check CHECK (
    usage = ANY (ARRAY[
      'hero'::text,
      'gallery'::text,
      'card_thumbnail'::text,
      'background'::text,
      'footage'::text,
      'logo'::text,
      'avatar'::text,
      'qr_flyer'::text,
      'document'::text
    ])
  ),
  CONSTRAINT media_placements_variant_parent_check CHECK (
    (entity_type = 'experience_variant' AND parent_entity_id IS NOT NULL)
    OR (entity_type <> 'experience_variant')
  )
);

CREATE INDEX IF NOT EXISTS media_placements_asset_idx
  ON public.media_placements (media_asset_id);

CREATE INDEX IF NOT EXISTS media_placements_entity_idx
  ON public.media_placements (entity_type, entity_id, usage, display_order);

CREATE UNIQUE INDEX IF NOT EXISTS media_placements_one_primary_idx
  ON public.media_placements (entity_type, entity_id, usage)
  WHERE is_primary = true AND is_active = true;

-- ---------------------------------------------------------------------------
-- 4) Entity existence + variant parent validation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.media_placement_entity_exists(
  p_entity_type text,
  p_entity_id uuid,
  p_parent_entity_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  CASE p_entity_type
    WHEN 'experience' THEN
      RETURN EXISTS (SELECT 1 FROM public.experiences e WHERE e.id = p_entity_id);
    WHEN 'experience_variant' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.experience_variants v
        WHERE v.id = p_entity_id
          AND v.experience_id = p_parent_entity_id
      );
    WHEN 'location' THEN
      RETURN EXISTS (SELECT 1 FROM public.locations l WHERE l.id = p_entity_id);
    WHEN 'team_member' THEN
      RETURN EXISTS (SELECT 1 FROM public.team_members t WHERE t.id = p_entity_id);
    WHEN 'partner' THEN
      RETURN EXISTS (SELECT 1 FROM public.partners p WHERE p.id = p_entity_id);
    WHEN 'site_content' THEN
      RETURN EXISTS (SELECT 1 FROM public.site_content_sections s WHERE s.id = p_entity_id);
    ELSE
      RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION private.validate_media_placement()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'private', 'pg_catalog'
AS $$
BEGIN
  IF NOT private.media_placement_entity_exists(
    NEW.entity_type,
    NEW.entity_id,
    NEW.parent_entity_id
  ) THEN
    RAISE EXCEPTION 'Invalid media placement entity % / %', NEW.entity_type, NEW.entity_id
      USING ERRCODE = '23514';
  END IF;
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS media_placements_validate ON public.media_placements;
CREATE TRIGGER media_placements_validate
BEFORE INSERT OR UPDATE ON public.media_placements
FOR EACH ROW
EXECUTE FUNCTION private.validate_media_placement();

-- Demote other primaries when setting is_primary
CREATE OR REPLACE FUNCTION private.media_placement_demote_primary()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  IF NEW.is_primary AND NEW.is_active THEN
    UPDATE public.media_placements
    SET is_primary = false, updated_at = timezone('utc', now())
    WHERE entity_type = NEW.entity_type
      AND entity_id = NEW.entity_id
      AND usage = NEW.usage
      AND is_active = true
      AND id IS DISTINCT FROM NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS media_placements_demote_primary ON public.media_placements;
CREATE TRIGGER media_placements_demote_primary
AFTER INSERT OR UPDATE OF is_primary, is_active, entity_type, entity_id, usage
ON public.media_placements
FOR EACH ROW
WHEN (NEW.is_primary = true AND NEW.is_active = true)
EXECUTE FUNCTION private.media_placement_demote_primary();

ALTER TABLE public.media_placements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active published placements" ON public.media_placements;
CREATE POLICY "Public can read active published placements"
ON public.media_placements
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.media_assets ma
    WHERE ma.id = media_placements.media_asset_id
      AND ma.status = 'published'::public.media_asset_status
      AND ma.visibility = 'public'::public.media_visibility
      AND ma.is_active = true
  )
);

DROP POLICY IF EXISTS "Staff can read all media placements" ON public.media_placements;
CREATE POLICY "Staff can read all media placements"
ON public.media_placements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.profile_id = auth.uid()
      AND ur.role = ANY (ARRAY[
        'content_manager'::public.app_role,
        'administrator'::public.app_role,
        'super_administrator'::public.app_role,
        'operations_staff'::public.app_role
      ])
  )
);

GRANT SELECT ON public.media_placements TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) Resolve entity slug for public view compatibility
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.media_entity_slug(
  p_entity_type text,
  p_entity_id uuid
)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_slug text;
BEGIN
  CASE p_entity_type
    WHEN 'experience' THEN
      SELECT e.slug INTO v_slug FROM public.experiences e WHERE e.id = p_entity_id;
    WHEN 'experience_variant' THEN
      SELECT v.slug INTO v_slug FROM public.experience_variants v WHERE v.id = p_entity_id;
    WHEN 'location' THEN
      SELECT l.slug INTO v_slug FROM public.locations l WHERE l.id = p_entity_id;
    WHEN 'team_member' THEN
      SELECT t.slug INTO v_slug FROM public.team_members t WHERE t.id = p_entity_id;
    WHEN 'partner' THEN
      SELECT p.slug INTO v_slug FROM public.partners p WHERE p.id = p_entity_id;
    WHEN 'site_content' THEN
      SELECT s.section_key INTO v_slug FROM public.site_content_sections s WHERE s.id = p_entity_id;
    ELSE
      v_slug := NULL;
  END CASE;
  RETURN v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION private.normalize_media_usage(p_role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(p_role, 'gallery'))
    WHEN 'hero' THEN 'hero'
    WHEN 'gallery' THEN 'gallery'
    WHEN 'card_thumbnail' THEN 'card_thumbnail'
    WHEN 'thumbnail' THEN 'card_thumbnail'
    WHEN 'background' THEN 'background'
    WHEN 'footage' THEN 'footage'
    WHEN 'video' THEN 'footage'
    WHEN 'logo' THEN 'logo'
    WHEN 'avatar' THEN 'avatar'
    WHEN 'photo' THEN 'avatar'
    WHEN 'signature' THEN 'document'
    WHEN 'qr_flyer' THEN 'qr_flyer'
    WHEN 'document' THEN 'document'
    WHEN 'content' THEN 'gallery'
    ELSE 'gallery'
  END;
$$;

-- ---------------------------------------------------------------------------
-- 6) Backfill placements from embedded scope columns
-- ---------------------------------------------------------------------------
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
  is_active,
  locale,
  breakpoint
)
SELECT
  ma.id,
  CASE
    WHEN ma.scope_type = 'experience' THEN 'experience'
    WHEN ma.scope_type = 'team_member' THEN 'team_member'
    WHEN ma.scope_type = 'partner' THEN 'partner'
    WHEN ma.scope_type = 'location' THEN 'location'
    WHEN ma.scope_type = 'experience_variant' THEN 'experience_variant'
    WHEN ma.scope_type = 'site_content' THEN 'site_content'
    ELSE NULL
  END,
  CASE
    WHEN ma.scope_type = 'experience' THEN e.id
    WHEN ma.scope_type = 'team_member' THEN tm.id
    WHEN ma.scope_type = 'partner' THEN p.id
    WHEN ma.scope_type = 'location' THEN loc.id
    WHEN ma.scope_type = 'experience_variant' THEN ev.id
    WHEN ma.scope_type = 'site_content' THEN sc.id
    ELSE NULL
  END,
  CASE
    WHEN ma.scope_type = 'experience_variant' THEN ev.experience_id
    ELSE NULL
  END,
  private.normalize_media_usage(ma.role),
  ma.alt_text_override,
  ma.caption_override,
  ma.display_order,
  ma.is_primary,
  ma.is_active,
  ma.locale,
  coalesce(ma.breakpoint, 'default')
FROM public.media_assets ma
LEFT JOIN public.experiences e
  ON ma.scope_type = 'experience' AND e.slug = ma.scope_key
LEFT JOIN public.team_members tm
  ON ma.scope_type = 'team_member' AND tm.slug = ma.scope_key
LEFT JOIN public.partners p
  ON ma.scope_type = 'partner' AND p.slug = ma.scope_key
LEFT JOIN public.locations loc
  ON ma.scope_type = 'location' AND loc.slug = ma.scope_key
LEFT JOIN public.experience_variants ev
  ON ma.scope_type = 'experience_variant' AND ev.slug = ma.scope_key
LEFT JOIN public.site_content_sections sc
  ON ma.scope_type = 'site_content' AND sc.section_key = ma.scope_key
WHERE ma.scope_type IS NOT NULL
  AND ma.scope_type <> 'global'
  AND coalesce(ma.scope_key, '') <> ''
  AND coalesce(ma.scope_key, '') <> 'media-library'
  AND CASE
    WHEN ma.scope_type = 'experience' THEN e.id
    WHEN ma.scope_type = 'team_member' THEN tm.id
    WHEN ma.scope_type = 'partner' THEN p.id
    WHEN ma.scope_type = 'location' THEN loc.id
    WHEN ma.scope_type = 'experience_variant' THEN ev.id
    WHEN ma.scope_type = 'site_content' THEN sc.id
    ELSE NULL
  END IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.media_placements existing
    WHERE existing.media_asset_id = ma.id
      AND existing.entity_type = CASE
        WHEN ma.scope_type = 'experience' THEN 'experience'
        WHEN ma.scope_type = 'team_member' THEN 'team_member'
        WHEN ma.scope_type = 'partner' THEN 'partner'
        WHEN ma.scope_type = 'location' THEN 'location'
        WHEN ma.scope_type = 'experience_variant' THEN 'experience_variant'
        WHEN ma.scope_type = 'site_content' THEN 'site_content'
        ELSE NULL
      END
  );

-- Ensure one primary per entity/usage after backfill
UPDATE public.media_placements mp
SET is_primary = false, updated_at = timezone('utc', now())
FROM (
  SELECT id,
    row_number() OVER (
      PARTITION BY entity_type, entity_id, usage
      ORDER BY display_order ASC, created_at ASC
    ) AS rn
  FROM public.media_placements
  WHERE is_active = true AND is_primary = true
) d
WHERE mp.id = d.id AND d.rn > 1;

-- ---------------------------------------------------------------------------
-- 7) Rewrite published_media_assets as placements join
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.published_media_assets
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.id AS placement_id,
  coalesce(nullif(ma.placement_key, ''), p.usage) AS placement_key,
  p.entity_type AS scope_type,
  private.media_entity_slug(p.entity_type, p.entity_id) AS scope_key,
  ma.page_path,
  ma.section_key,
  ma.component_key,
  p.locale,
  p.breakpoint,
  p.usage AS role,
  ma.variant,
  COALESCE(p.alt_text_override, ma.alt_text) AS alt_text,
  COALESCE(p.caption_override, ma.caption) AS caption,
  ma.link_url,
  ma.open_in_new_tab,
  p.display_order,
  p.is_primary,
  ma.metadata AS placement_metadata,
  ma.id AS media_asset_id,
  ma.asset_key,
  ma.bucket_id,
  ma.storage_path,
  ma.media_type,
  ma.mime_type,
  ma.width,
  ma.height,
  ma.duration_seconds,
  ma.dominant_color,
  ma.blurhash,
  ma.focal_x,
  ma.focal_y,
  ma.visibility,
  ma.metadata AS asset_metadata,
  ma.folder_path,
  p.entity_id,
  p.parent_entity_id,
  p.usage
FROM public.media_placements p
JOIN public.media_assets ma ON ma.id = p.media_asset_id
WHERE p.is_active = true
  AND ma.is_active = true
  AND ma.status = 'published'::public.media_asset_status
  AND ma.visibility = 'public'::public.media_visibility
  AND (ma.starts_at IS NULL OR ma.starts_at <= now())
  AND (ma.ends_at IS NULL OR ma.ends_at > now());

GRANT SELECT ON public.published_media_assets TO anon, authenticated;
