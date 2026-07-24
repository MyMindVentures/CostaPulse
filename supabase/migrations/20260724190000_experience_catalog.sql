alter table public.experiences
  add column if not exists category_label text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 0;

create index if not exists experiences_public_catalog_idx
  on public.experiences (
    status,
    is_featured desc,
    sort_order asc,
    created_at desc
  );

create index if not exists experience_variants_public_price_idx
  on public.experience_variants (
    experience_id,
    is_active,
    unit_amount_minor
  );
