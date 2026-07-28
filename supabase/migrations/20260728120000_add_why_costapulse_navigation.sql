-- Publish the public CostaPulse ecosystem page in the database-backed navigation.
INSERT INTO public.site_navigation_items (item_key, label, href, placement, sort_order, is_external, is_published)
VALUES ('why_costapulse', 'Why CostaPulse', '/why-costapulse', 'primary', 35, false, true)
ON CONFLICT (item_key) DO UPDATE SET href = EXCLUDED.href, placement = EXCLUDED.placement, sort_order = EXCLUDED.sort_order, is_external = EXCLUDED.is_external, is_published = EXCLUDED.is_published;

INSERT INTO public.site_navigation_item_translations (navigation_item_id, locale, label)
SELECT item.id, translation.locale, translation.label
FROM public.site_navigation_items item
CROSS JOIN (VALUES ('en','Why CostaPulse'),('nl','Waarom CostaPulse'),('fr','Pourquoi CostaPulse'),('es','Por qué CostaPulse'),('de','Warum CostaPulse')) AS translation(locale,label)
WHERE item.item_key = 'why_costapulse'
ON CONFLICT (navigation_item_id, locale) DO UPDATE SET label = EXCLUDED.label;
