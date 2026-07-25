-- Seed EU locale labels for published site navigation (en already seeded).
-- Locales: nl, fr, es, de — aligned with src/i18n/locales.ts ENABLED_LOCALES.

INSERT INTO public.site_navigation_item_translations (
  navigation_item_id,
  locale,
  label
)
VALUES
  -- experiences
  ('a1000000-0000-4000-8000-000000000001', 'nl', 'Experiences'),
  ('a1000000-0000-4000-8000-000000000001', 'fr', 'Expériences'),
  ('a1000000-0000-4000-8000-000000000001', 'es', 'Experiencias'),
  ('a1000000-0000-4000-8000-000000000001', 'de', 'Erlebnisse'),
  -- experiences_all
  ('a1000000-0000-4000-8000-000000000002', 'nl', 'Alle experiences'),
  ('a1000000-0000-4000-8000-000000000002', 'fr', 'Toutes les expériences'),
  ('a1000000-0000-4000-8000-000000000002', 'es', 'Todas las experiencias'),
  ('a1000000-0000-4000-8000-000000000002', 'de', 'Alle Erlebnisse'),
  -- experiences_map
  ('a1000000-0000-4000-8000-000000000003', 'nl', 'Kaart verkennen'),
  ('a1000000-0000-4000-8000-000000000003', 'fr', 'Explorer la carte'),
  ('a1000000-0000-4000-8000-000000000003', 'es', 'Explorar mapa'),
  ('a1000000-0000-4000-8000-000000000003', 'de', 'Karte erkunden'),
  -- services
  ('a1000000-0000-4000-8000-000000000004', 'nl', 'Diensten'),
  ('a1000000-0000-4000-8000-000000000004', 'fr', 'Services'),
  ('a1000000-0000-4000-8000-000000000004', 'es', 'Servicios'),
  ('a1000000-0000-4000-8000-000000000004', 'de', 'Services'),
  -- destinations
  ('a1000000-0000-4000-8000-000000000005', 'nl', 'Bestemmingen'),
  ('a1000000-0000-4000-8000-000000000005', 'fr', 'Destinations'),
  ('a1000000-0000-4000-8000-000000000005', 'es', 'Destinos'),
  ('a1000000-0000-4000-8000-000000000005', 'de', 'Destinationen'),
  -- partners
  ('a1000000-0000-4000-8000-000000000006', 'nl', 'Partners'),
  ('a1000000-0000-4000-8000-000000000006', 'fr', 'Partenaires'),
  ('a1000000-0000-4000-8000-000000000006', 'es', 'Partners'),
  ('a1000000-0000-4000-8000-000000000006', 'de', 'Partner'),
  -- about
  ('a1000000-0000-4000-8000-000000000007', 'nl', 'Over ons'),
  ('a1000000-0000-4000-8000-000000000007', 'fr', 'À propos'),
  ('a1000000-0000-4000-8000-000000000007', 'es', 'Sobre nosotros'),
  ('a1000000-0000-4000-8000-000000000007', 'de', 'Über uns'),
  -- book_experience (CTA)
  ('a1000000-0000-4000-8000-000000000008', 'nl', 'Boek experience'),
  ('a1000000-0000-4000-8000-000000000008', 'fr', 'Réserver'),
  ('a1000000-0000-4000-8000-000000000008', 'es', 'Reservar experiencia'),
  ('a1000000-0000-4000-8000-000000000008', 'de', 'Erlebnis buchen')
ON CONFLICT (navigation_item_id, locale) DO UPDATE
SET label = EXCLUDED.label;
