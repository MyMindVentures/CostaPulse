-- Fix infinite RLS recursion on site_navigation_items parent lookup.
-- Public reads only need is_published; parent/child publish consistency is enforced in writes/seed.

DROP POLICY IF EXISTS "site_navigation_items_public_select"
  ON public.site_navigation_items;
CREATE POLICY "site_navigation_items_public_select"
ON public.site_navigation_items
FOR SELECT
TO anon, authenticated
USING (is_published = true);

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
  )
);
