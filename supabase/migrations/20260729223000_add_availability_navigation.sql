insert into public.site_navigation_items (
  item_key,
  href,
  parent_id,
  placement,
  sort_order,
  is_published,
  is_external
)
values (
  'availability',
  '/availability',
  null,
  'primary',
  47,
  true,
  false
)
on conflict (item_key) do update
set
  href = excluded.href,
  parent_id = excluded.parent_id,
  placement = excluded.placement,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  is_external = excluded.is_external;

insert into public.site_navigation_item_translations (
  navigation_item_id,
  locale,
  label
)
select
  navigation.id,
  labels.locale,
  labels.label
from public.site_navigation_items navigation
cross join (
  values
    ('en', 'Availability'),
    ('nl', 'Beschikbaarheid'),
    ('fr', 'Disponibilité'),
    ('es', 'Disponibilidad'),
    ('de', 'Verfügbarkeit')
) labels(locale, label)
where navigation.item_key = 'availability'
on conflict (navigation_item_id, locale) do update
set label = excluded.label;
