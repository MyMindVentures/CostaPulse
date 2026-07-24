-- Site navigation: structure + localized labels (DB source of truth for public navbar).

CREATE TABLE IF NOT EXISTS public.site_navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key text NOT NULL,
  href text NOT NULL,
  parent_id uuid REFERENCES public.site_navigation_items (id) ON DELETE CASCADE,
  placement text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_external boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_navigation_items_item_key_key UNIQUE (item_key),
  CONSTRAINT site_navigation_items_placement_check
    CHECK (placement IN ('primary', 'cta')),
  CONSTRAINT site_navigation_items_sort_order_check CHECK (sort_order >= 0),
  CONSTRAINT site_navigation_items_parent_not_self
    CHECK (parent_id IS DISTINCT FROM id),
  CONSTRAINT site_navigation_items_href_nonempty
    CHECK (length(trim(href)) > 0),
  CONSTRAINT site_navigation_items_item_key_nonempty
    CHECK (length(trim(item_key)) > 0)
);

CREATE TABLE IF NOT EXISTS public.site_navigation_item_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navigation_item_id uuid NOT NULL
    REFERENCES public.site_navigation_items (id) ON DELETE CASCADE,
  locale text NOT NULL,
  label text NOT NULL,
  CONSTRAINT site_navigation_item_translations_locale_check
    CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT site_navigation_item_translations_label_nonempty
    CHECK (length(trim(label)) > 0),
  CONSTRAINT site_navigation_item_translations_item_locale_key
    UNIQUE (navigation_item_id, locale)
);

CREATE INDEX IF NOT EXISTS site_navigation_items_parent_sort_idx
  ON public.site_navigation_items (parent_id, sort_order);

CREATE INDEX IF NOT EXISTS site_navigation_items_placement_published_idx
  ON public.site_navigation_items (placement, is_published, sort_order);

DROP TRIGGER IF EXISTS site_navigation_items_set_updated_at
  ON public.site_navigation_items;
CREATE TRIGGER site_navigation_items_set_updated_at
  BEFORE UPDATE ON public.site_navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_navigation_item_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_navigation_items_public_select"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_public_select"
ON public.site_navigation_items
FOR SELECT
TO anon, authenticated
USING (
  is_published = true
  AND (
    parent_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.site_navigation_items AS parent
      WHERE parent.id = site_navigation_items.parent_id
        AND parent.is_published = true
    )
  )
);

DROP POLICY IF EXISTS "site_navigation_items_staff_select"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_staff_select"
ON public.site_navigation_items
FOR SELECT
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_items_staff_insert"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_staff_insert"
ON public.site_navigation_items
FOR INSERT
TO authenticated
WITH CHECK (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_items_staff_update"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_staff_update"
ON public.site_navigation_items
FOR UPDATE
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
)
WITH CHECK (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_items_staff_delete"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_staff_delete"
ON public.site_navigation_items
FOR DELETE
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_item_translations_public_select"
  ON public.site_navigation_item_translations;
CREATE POLICY "site_navigation_item_translations_public_select"
ON public.site_navigation_item_translations
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.site_navigation_items AS item
    WHERE item.id = site_navigation_item_translations.navigation_item_id
      AND item.is_published = true
      AND (
        item.parent_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.site_navigation_items AS parent
          WHERE parent.id = item.parent_id
            AND parent.is_published = true
        )
      )
  )
);

DROP POLICY IF EXISTS "site_navigation_item_translations_staff_select"
  ON public.site_navigation_item_translations;
CREATE POLICY "site_navigation_item_translations_staff_select"
ON public.site_navigation_item_translations
FOR SELECT
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_item_translations_staff_insert"
  ON public.site_navigation_item_translations;
CREATE POLICY "site_navigation_item_translations_staff_insert"
ON public.site_navigation_item_translations
FOR INSERT
TO authenticated
WITH CHECK (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_item_translations_staff_update"
  ON public.site_navigation_item_translations;
CREATE POLICY "site_navigation_item_translations_staff_update"
ON public.site_navigation_item_translations
FOR UPDATE
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
)
WITH CHECK (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "site_navigation_item_translations_staff_delete"
  ON public.site_navigation_item_translations;
CREATE POLICY "site_navigation_item_translations_staff_delete"
ON public.site_navigation_item_translations
FOR DELETE
TO authenticated
USING (
  private.has_role(
    ARRAY[
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

GRANT SELECT ON public.site_navigation_items TO anon, authenticated;
GRANT SELECT ON public.site_navigation_item_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_navigation_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_navigation_item_translations TO authenticated;

INSERT INTO public.site_navigation_items (
  id,
  item_key,
  href,
  parent_id,
  placement,
  sort_order,
  is_published,
  is_external
)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'experiences',
    '/experiences',
    NULL,
    'primary',
    10,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'experiences_all',
    '/experiences',
    'a1000000-0000-4000-8000-000000000001',
    'primary',
    11,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'experiences_map',
    '/experiences/map',
    'a1000000-0000-4000-8000-000000000001',
    'primary',
    12,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'services',
    '/services',
    NULL,
    'primary',
    20,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'destinations',
    '/destinations',
    NULL,
    'primary',
    30,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'partners',
    '/partners',
    NULL,
    'primary',
    40,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'about',
    '/about',
    NULL,
    'primary',
    50,
    true,
    false
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'book_experience',
    '/experiences',
    NULL,
    'cta',
    10,
    true,
    false
  )
ON CONFLICT (item_key) DO NOTHING;

INSERT INTO public.site_navigation_item_translations (
  navigation_item_id,
  locale,
  label
)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'en', 'Experiences'),
  ('a1000000-0000-4000-8000-000000000002', 'en', 'All experiences'),
  ('a1000000-0000-4000-8000-000000000003', 'en', 'Explore map'),
  ('a1000000-0000-4000-8000-000000000004', 'en', 'Services'),
  ('a1000000-0000-4000-8000-000000000005', 'en', 'Destinations'),
  ('a1000000-0000-4000-8000-000000000006', 'en', 'Partners'),
  ('a1000000-0000-4000-8000-000000000007', 'en', 'About'),
  ('a1000000-0000-4000-8000-000000000008', 'en', 'Book Experience')
ON CONFLICT (navigation_item_id, locale) DO NOTHING;
