-- Localized experience inventory (scope 2): core + policies/itinerary/requirements/addons/variants.
-- Pattern mirrors site_navigation_item_translations. Base columns remain English fallback.

CREATE TABLE IF NOT EXISTS public.experience_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL
    REFERENCES public.experiences (id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  short_description text,
  description text,
  category_label text,
  location_name text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  inclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_translations_title_nonempty
    CHECK (length(trim(title)) > 0),
  CONSTRAINT experience_translations_experience_locale_key
    UNIQUE (experience_id, locale),
  CONSTRAINT experience_translations_highlights_array
    CHECK (jsonb_typeof(highlights) = 'array'),
  CONSTRAINT experience_translations_inclusions_array
    CHECK (jsonb_typeof(inclusions) = 'array')
);

CREATE TABLE IF NOT EXISTS public.experience_policy_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL
    REFERENCES public.experience_policies (id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_policy_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_policy_translations_title_nonempty
    CHECK (length(trim(title)) > 0),
  CONSTRAINT experience_policy_translations_policy_locale_key
    UNIQUE (policy_id, locale)
);

CREATE TABLE IF NOT EXISTS public.experience_itinerary_step_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_step_id uuid NOT NULL
    REFERENCES public.experience_itinerary_steps (id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_itinerary_step_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_itinerary_step_translations_title_nonempty
    CHECK (length(trim(title)) > 0),
  CONSTRAINT experience_itinerary_step_translations_step_locale_key
    UNIQUE (itinerary_step_id, locale)
);

CREATE TABLE IF NOT EXISTS public.experience_requirement_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL
    REFERENCES public.experience_requirements (id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_requirement_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_requirement_translations_title_nonempty
    CHECK (length(trim(title)) > 0),
  CONSTRAINT experience_requirement_translations_requirement_locale_key
    UNIQUE (requirement_id, locale)
);

CREATE TABLE IF NOT EXISTS public.experience_addon_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id uuid NOT NULL
    REFERENCES public.experience_addons (id) ON DELETE CASCADE,
  locale text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_addon_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_addon_translations_name_nonempty
    CHECK (length(trim(name)) > 0),
  CONSTRAINT experience_addon_translations_addon_locale_key
    UNIQUE (addon_id, locale)
);

CREATE TABLE IF NOT EXISTS public.experience_variant_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL
    REFERENCES public.experience_variants (id) ON DELETE CASCADE,
  locale text NOT NULL,
  name text NOT NULL,
  description text,
  subtitle text,
  badge_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_variant_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT experience_variant_translations_name_nonempty
    CHECK (length(trim(name)) > 0),
  CONSTRAINT experience_variant_translations_variant_locale_key
    UNIQUE (variant_id, locale)
);

CREATE INDEX IF NOT EXISTS experience_translations_locale_idx
  ON public.experience_translations (locale);
CREATE INDEX IF NOT EXISTS experience_policy_translations_locale_idx
  ON public.experience_policy_translations (locale);
CREATE INDEX IF NOT EXISTS experience_itinerary_step_translations_locale_idx
  ON public.experience_itinerary_step_translations (locale);
CREATE INDEX IF NOT EXISTS experience_requirement_translations_locale_idx
  ON public.experience_requirement_translations (locale);
CREATE INDEX IF NOT EXISTS experience_addon_translations_locale_idx
  ON public.experience_addon_translations (locale);
CREATE INDEX IF NOT EXISTS experience_variant_translations_locale_idx
  ON public.experience_variant_translations (locale);

DROP TRIGGER IF EXISTS experience_translations_set_updated_at
  ON public.experience_translations;
CREATE TRIGGER experience_translations_set_updated_at
  BEFORE UPDATE ON public.experience_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experience_policy_translations_set_updated_at
  ON public.experience_policy_translations;
CREATE TRIGGER experience_policy_translations_set_updated_at
  BEFORE UPDATE ON public.experience_policy_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experience_itinerary_step_translations_set_updated_at
  ON public.experience_itinerary_step_translations;
CREATE TRIGGER experience_itinerary_step_translations_set_updated_at
  BEFORE UPDATE ON public.experience_itinerary_step_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experience_requirement_translations_set_updated_at
  ON public.experience_requirement_translations;
CREATE TRIGGER experience_requirement_translations_set_updated_at
  BEFORE UPDATE ON public.experience_requirement_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experience_addon_translations_set_updated_at
  ON public.experience_addon_translations;
CREATE TRIGGER experience_addon_translations_set_updated_at
  BEFORE UPDATE ON public.experience_addon_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experience_variant_translations_set_updated_at
  ON public.experience_variant_translations;
CREATE TRIGGER experience_variant_translations_set_updated_at
  BEFORE UPDATE ON public.experience_variant_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.experience_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_policy_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_itinerary_step_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_requirement_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_addon_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_variant_translations ENABLE ROW LEVEL SECURITY;

-- Public read when parent experience is published
DROP POLICY IF EXISTS "experience_translations_published_select"
  ON public.experience_translations;
CREATE POLICY "experience_translations_published_select"
ON public.experience_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = experience_translations.experience_id
      AND e.status = 'published'
  )
);

DROP POLICY IF EXISTS "experience_policy_translations_published_select"
  ON public.experience_policy_translations;
CREATE POLICY "experience_policy_translations_published_select"
ON public.experience_policy_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experience_policies p
    JOIN public.experiences e ON e.id = p.experience_id
    WHERE p.id = experience_policy_translations.policy_id
      AND e.status = 'published'
  )
);

DROP POLICY IF EXISTS "experience_itinerary_step_translations_published_select"
  ON public.experience_itinerary_step_translations;
CREATE POLICY "experience_itinerary_step_translations_published_select"
ON public.experience_itinerary_step_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experience_itinerary_steps s
    JOIN public.experiences e ON e.id = s.experience_id
    WHERE s.id = experience_itinerary_step_translations.itinerary_step_id
      AND e.status = 'published'
  )
);

DROP POLICY IF EXISTS "experience_requirement_translations_published_select"
  ON public.experience_requirement_translations;
CREATE POLICY "experience_requirement_translations_published_select"
ON public.experience_requirement_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experience_requirements r
    JOIN public.experiences e ON e.id = r.experience_id
    WHERE r.id = experience_requirement_translations.requirement_id
      AND e.status = 'published'
  )
);

DROP POLICY IF EXISTS "experience_addon_translations_published_select"
  ON public.experience_addon_translations;
CREATE POLICY "experience_addon_translations_published_select"
ON public.experience_addon_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experience_addons a
    JOIN public.experiences e ON e.id = a.experience_id
    WHERE a.id = experience_addon_translations.addon_id
      AND e.status = 'published'
  )
);

DROP POLICY IF EXISTS "experience_variant_translations_published_select"
  ON public.experience_variant_translations;
CREATE POLICY "experience_variant_translations_published_select"
ON public.experience_variant_translations
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experience_variants v
    JOIN public.experiences e ON e.id = v.experience_id
    WHERE v.id = experience_variant_translations.variant_id
      AND e.status = 'published'
  )
);

-- Staff CRUD (content/admin)
DO $$
DECLARE
  tbl text;
  role_check text := $c$
    private.has_role(
      ARRAY[
        'content_manager'::public.app_role,
        'administrator'::public.app_role,
        'super_administrator'::public.app_role
      ]
    )
  $c$;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'experience_translations',
    'experience_policy_translations',
    'experience_itinerary_step_translations',
    'experience_requirement_translations',
    'experience_addon_translations',
    'experience_variant_translations'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_staff_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)',
      tbl || '_staff_select', tbl, role_check
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_staff_insert', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
      tbl || '_staff_insert', tbl, role_check
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_staff_update', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
      tbl || '_staff_update', tbl, role_check, role_check
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_staff_delete', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)',
      tbl || '_staff_delete', tbl, role_check
    );

    EXECUTE format(
      'GRANT SELECT ON public.%I TO anon, authenticated',
      tbl
    );
    EXECUTE format(
      'GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated',
      tbl
    );
  END LOOP;
END $$;

-- Seed English from existing columns
INSERT INTO public.experience_translations (
  experience_id, locale, title, short_description, description,
  category_label, location_name, highlights, inclusions
)
SELECT
  e.id,
  'en',
  e.title,
  e.short_description,
  e.description,
  e.category_label,
  e.location_name,
  coalesce(e.highlights, '[]'::jsonb),
  coalesce(e.inclusions, '[]'::jsonb)
FROM public.experiences e
WHERE e.status = 'published'
ON CONFLICT (experience_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  category_label = EXCLUDED.category_label,
  location_name = EXCLUDED.location_name,
  highlights = EXCLUDED.highlights,
  inclusions = EXCLUDED.inclusions;

INSERT INTO public.experience_variant_translations (
  variant_id, locale, name, description, subtitle, badge_label
)
SELECT v.id, 'en', v.name, v.description, v.subtitle, v.badge_label
FROM public.experience_variants v
JOIN public.experiences e ON e.id = v.experience_id
WHERE e.status = 'published'
ON CONFLICT (variant_id, locale) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subtitle = EXCLUDED.subtitle,
  badge_label = EXCLUDED.badge_label;

INSERT INTO public.experience_policy_translations (
  policy_id, locale, title, description
)
SELECT p.id, 'en', p.title, p.description
FROM public.experience_policies p
JOIN public.experiences e ON e.id = p.experience_id
WHERE e.status = 'published'
ON CONFLICT (policy_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO public.experience_itinerary_step_translations (
  itinerary_step_id, locale, title, description
)
SELECT s.id, 'en', s.title, s.description
FROM public.experience_itinerary_steps s
JOIN public.experiences e ON e.id = s.experience_id
WHERE e.status = 'published'
ON CONFLICT (itinerary_step_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO public.experience_requirement_translations (
  requirement_id, locale, title, description
)
SELECT r.id, 'en', r.title, r.description
FROM public.experience_requirements r
JOIN public.experiences e ON e.id = r.experience_id
WHERE e.status = 'published'
ON CONFLICT (requirement_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO public.experience_addon_translations (
  addon_id, locale, name, description
)
SELECT a.id, 'en', a.name, a.description
FROM public.experience_addons a
JOIN public.experiences e ON e.id = a.experience_id
WHERE e.status = 'published'
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Map RPC: locale-aware title/short_description/category_label
CREATE OR REPLACE FUNCTION public.get_experience_map(
  p_from timestamp with time zone DEFAULT now(),
  p_to timestamp with time zone DEFAULT (now() + '90 days'::interval),
  p_experience_type text DEFAULT NULL,
  p_team_member_id uuid DEFAULT NULL,
  p_locale text DEFAULT 'en'
)
RETURNS TABLE (
  experience_id uuid,
  slug text,
  title text,
  short_description text,
  experience_type text,
  category_label text,
  hero_image_path text,
  duration_minutes integer,
  base_capacity integer,
  base_currency character,
  is_featured boolean,
  location_id uuid,
  location_slug text,
  location_name text,
  city text,
  province text,
  latitude numeric,
  longitude numeric,
  map_zoom smallint,
  meeting_point text,
  team_members jsonb,
  next_available_at timestamp with time zone,
  available_slot_count bigint,
  from_price_minor integer
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT
    e.id,
    e.slug,
    coalesce(et_req.title, et_en.title, e.title),
    coalesce(et_req.short_description, et_en.short_description, e.short_description),
    e.experience_type,
    coalesce(et_req.category_label, et_en.category_label, e.category_label),
    e.hero_image_path,
    e.duration_minutes,
    e.base_capacity,
    e.base_currency,
    e.is_featured,
    l.id,
    l.slug,
    l.name,
    l.city,
    l.province,
    l.latitude,
    l.longitude,
    l.map_zoom,
    coalesce(el.meeting_point_override, l.meeting_point_notes),
    coalesce(
      jsonb_agg(DISTINCT jsonb_build_object(
        'id', tm.id,
        'slug', tm.slug,
        'displayName', tm.display_name,
        'roleTitle', tm.role_title,
        'photoPath', tm.photo_path,
        'isPrimary', tme.is_primary,
        'roleLabel', tme.role_label
      )) FILTER (WHERE tm.id IS NOT NULL),
      '[]'::jsonb
    ),
    min(s.starts_at) FILTER (
      WHERE s.starts_at >= p_from AND s.starts_at < p_to
        AND s.status = 'scheduled'
        AND (s.booking_cutoff_at IS NULL OR s.booking_cutoff_at > now())
        AND s.capacity_reserved < s.capacity_total
    ),
    count(DISTINCT s.id) FILTER (
      WHERE s.starts_at >= p_from AND s.starts_at < p_to
        AND s.status = 'scheduled'
        AND (s.booking_cutoff_at IS NULL OR s.booking_cutoff_at > now())
        AND s.capacity_reserved < s.capacity_total
    ),
    min(ev.unit_amount_minor) FILTER (WHERE ev.is_active)
  FROM public.experiences e
  JOIN public.experience_locations el ON el.experience_id = e.id AND el.is_active
  JOIN public.locations l ON l.id = el.location_id AND l.is_active
  LEFT JOIN public.experience_translations et_req
    ON et_req.experience_id = e.id
   AND et_req.locale = coalesce(nullif(trim(p_locale), ''), 'en')
  LEFT JOIN public.experience_translations et_en
    ON et_en.experience_id = e.id
   AND et_en.locale = 'en'
  LEFT JOIN public.team_member_experiences tme ON tme.experience_id = e.id
  LEFT JOIN public.team_members tm ON tm.id = tme.team_member_id AND tm.is_active
  LEFT JOIN public.availability_slots s ON s.experience_id = e.id AND s.location_id = l.id
  LEFT JOIN public.experience_variants ev ON ev.experience_id = e.id
  WHERE e.status = 'published'
    AND (p_experience_type IS NULL OR e.experience_type = p_experience_type)
    AND (
      p_team_member_id IS NULL OR EXISTS (
        SELECT 1 FROM public.team_member_experiences x
        WHERE x.experience_id = e.id AND x.team_member_id = p_team_member_id
      )
    )
  GROUP BY
    e.id, l.id, el.meeting_point_override,
    et_req.title, et_req.short_description, et_req.category_label,
    et_en.title, et_en.short_description, et_en.category_label;
$function$;
