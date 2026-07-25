-- Publish the existing public Team page in the database-backed site navigation.

INSERT INTO public.site_navigation_items (
  item_key,
  href,
  parent_id,
  placement,
  sort_order,
  is_published,
  is_external
)
VALUES (
  'team',
  '/team',
  NULL,
  'primary',
  45,
  true,
  false
)
ON CONFLICT (item_key) DO UPDATE
SET
  href = EXCLUDED.href,
  parent_id = EXCLUDED.parent_id,
  placement = EXCLUDED.placement,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  is_external = EXCLUDED.is_external;

INSERT INTO public.site_navigation_item_translations (
  navigation_item_id,
  locale,
  label
)
SELECT
  navigation.id,
  labels.locale,
  labels.label
FROM public.site_navigation_items AS navigation
CROSS JOIN (
  VALUES
    ('en', 'Team'),
    ('nl', 'Team'),
    ('fr', 'Équipe'),
    ('es', 'Equipo'),
    ('de', 'Team')
) AS labels(locale, label)
WHERE navigation.item_key = 'team'
ON CONFLICT (navigation_item_id, locale) DO UPDATE
SET label = EXCLUDED.label;
