-- Correct the Why CostaPulse navigation migration.
-- The original migration referenced a non-existent `label` column on
-- site_navigation_items, which prevents the navigation item from being created.

INSERT INTO public.site_navigation_items (
  item_key,
  href,
  parent_id,
  placement,
  sort_order,
  is_external,
  is_published
)
VALUES (
  'why_costapulse',
  '/why-costapulse',
  NULL,
  'primary',
  35,
  false,
  true
)
ON CONFLICT (item_key) DO UPDATE
SET
  href = EXCLUDED.href,
  parent_id = EXCLUDED.parent_id,
  placement = EXCLUDED.placement,
  sort_order = EXCLUDED.sort_order,
  is_external = EXCLUDED.is_external,
  is_published = EXCLUDED.is_published;

INSERT INTO public.site_navigation_item_translations (
  navigation_item_id,
  locale,
  label
)
SELECT
  navigation.id,
  translations.locale,
  translations.label
FROM public.site_navigation_items AS navigation
CROSS JOIN (
  VALUES
    ('en', 'Why CostaPulse'),
    ('nl', 'Waarom CostaPulse'),
    ('fr', 'Pourquoi CostaPulse'),
    ('es', 'Por qué CostaPulse'),
    ('de', 'Warum CostaPulse')
) AS translations(locale, label)
WHERE navigation.item_key = 'why_costapulse'
ON CONFLICT (navigation_item_id, locale) DO UPDATE
SET label = EXCLUDED.label;
