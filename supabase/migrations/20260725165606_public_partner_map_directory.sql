-- Public partner map directory
--
-- Reconciles the repository with the live partner/location relationship and
-- exposes only the explicitly approved public partner profile fields and
-- aggregate referral activity. Private contacts, referral records, bookings,
-- voucher data, revenue and internal metadata never leave this function.

alter table public.partners
  add column if not exists location_id uuid,
  add column if not exists description text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists published_at timestamptz;

update public.partners
set published_at = created_at
where published_at is null;

alter table public.partners
  alter column published_at set default timezone('utc'::text, now()),
  alter column published_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.partners'::regclass
      and conname = 'partners_location_id_fkey'
  ) then
    alter table public.partners
      add constraint partners_location_id_fkey
      foreign key (location_id)
      references public.locations (id)
      on update cascade
      on delete set null;
  end if;
end;
$$;

alter table public.locations
  add column if not exists google_plus_code text,
  add column if not exists google_place_id text,
  add column if not exists google_maps_url text,
  add column if not exists what3words text;

create index if not exists idx_partners_location_id
  on public.partners (location_id);

create index if not exists partners_public_directory_idx
  on public.partners (status, is_featured, published_at desc)
  where location_id is not null;

create index if not exists bookings_partner_public_metrics_idx
  on public.bookings (partner_id, status, payment_status, experience_id)
  where partner_id is not null;

create or replace function public.get_public_partner_directory(
  p_locale text default 'en'
)
returns table (
  partner_id uuid,
  slug text,
  name text,
  category text,
  short_description text,
  website_url text,
  is_featured boolean,
  published_at timestamptz,
  location_id uuid,
  location_slug text,
  location_name text,
  city text,
  province text,
  latitude numeric,
  longitude numeric,
  map_zoom smallint,
  directions_url text,
  image_bucket_id text,
  image_storage_path text,
  image_alt_text text,
  logo_bucket_id text,
  logo_storage_path text,
  logo_alt_text text,
  qr_scan_count bigint,
  attributed_booking_count bigint,
  conversion_rate numeric,
  most_booked_experience_slug text,
  most_booked_experience_name text,
  total_partner_count bigint,
  total_qr_scan_count bigint,
  total_booking_count bigint
)
language sql
stable
security definer
set search_path to 'public', 'pg_catalog'
as $$
  with partner_metrics as (
    select
      p.id as partner_id,
      p.slug,
      p.name,
      p.business_type as category,
      p.description as short_description,
      p.website_url,
      p.is_featured,
      p.published_at,
      l.id as location_id,
      l.slug as location_slug,
      l.name as location_name,
      l.city,
      l.province,
      l.latitude,
      l.longitude,
      l.map_zoom,
      l.google_maps_url as directions_url,
      cover.bucket_id as image_bucket_id,
      cover.storage_path as image_storage_path,
      cover.alt_text as image_alt_text,
      logo.bucket_id as logo_bucket_id,
      logo.storage_path as logo_storage_path,
      logo.alt_text as logo_alt_text,
      coalesce(scan_metrics.qr_scan_count, 0::bigint) as qr_scan_count,
      coalesce(booking_metrics.booking_count, 0::bigint)
        as attributed_booking_count,
      case
        when coalesce(scan_metrics.qr_scan_count, 0::bigint) = 0
          then 0::numeric
        else round(
          coalesce(booking_metrics.booking_count, 0::bigint)::numeric
          / scan_metrics.qr_scan_count::numeric * 100::numeric,
          1
        )
      end as conversion_rate,
      top_experience.experience_slug as most_booked_experience_slug,
      top_experience.experience_name as most_booked_experience_name
    from public.partners p
    join public.locations l
      on l.id = p.location_id
     and l.is_active = true
    left join lateral (
      select
        ma.bucket_id,
        ma.storage_path,
        coalesce(mp.alt_text_override, ma.alt_text) as alt_text
      from public.media_placements mp
      join public.media_assets ma on ma.id = mp.media_asset_id
      where mp.entity_type = 'partner'
        and mp.entity_id = p.id
        and mp.usage in ('card_thumbnail', 'hero', 'gallery')
        and mp.is_active = true
        and (mp.locale is null or mp.locale = p_locale)
        and ma.is_active = true
        and ma.status = 'published'
        and ma.visibility = 'public'
        and (ma.starts_at is null or ma.starts_at <= now())
        and (ma.ends_at is null or ma.ends_at > now())
      order by
        case mp.usage
          when 'card_thumbnail' then 0
          when 'hero' then 1
          else 2
        end,
        case when mp.locale = p_locale then 0 else 1 end,
        mp.is_primary desc,
        mp.display_order,
        mp.id
      limit 1
    ) cover on true
    left join lateral (
      select
        ma.bucket_id,
        ma.storage_path,
        coalesce(mp.alt_text_override, ma.alt_text) as alt_text
      from public.media_placements mp
      join public.media_assets ma on ma.id = mp.media_asset_id
      where mp.entity_type = 'partner'
        and mp.entity_id = p.id
        and mp.usage = 'logo'
        and mp.is_active = true
        and (mp.locale is null or mp.locale = p_locale)
        and ma.is_active = true
        and ma.status = 'published'
        and ma.visibility = 'public'
        and (ma.starts_at is null or ma.starts_at <= now())
        and (ma.ends_at is null or ma.ends_at > now())
      order by
        case when mp.locale = p_locale then 0 else 1 end,
        mp.is_primary desc,
        mp.display_order,
        mp.id
      limit 1
    ) logo on true
    left join lateral (
      select count(*)::bigint as qr_scan_count
      from public.partner_referral_visits visit
      where visit.partner_id = p.id
    ) scan_metrics on true
    left join lateral (
      select count(*)::bigint as booking_count
      from public.bookings b
      where b.partner_id = p.id
        and b.status in ('confirmed', 'completed')
        and b.payment_status = 'paid'
        and lower(coalesce(b.metadata ->> 'is_test', 'false'))
          not in ('true', '1', 'yes')
    ) booking_metrics on true
    left join lateral (
      select
        e.slug as experience_slug,
        coalesce(et_requested.title, et_english.title, e.title)
          as experience_name
      from public.bookings b
      join public.experiences e
        on e.id = b.experience_id
       and e.status = 'published'
      left join public.experience_translations et_requested
        on et_requested.experience_id = e.id
       and et_requested.locale = coalesce(nullif(trim(p_locale), ''), 'en')
      left join public.experience_translations et_english
        on et_english.experience_id = e.id
       and et_english.locale = 'en'
      where b.partner_id = p.id
        and b.status in ('confirmed', 'completed')
        and b.payment_status = 'paid'
        and lower(coalesce(b.metadata ->> 'is_test', 'false'))
          not in ('true', '1', 'yes')
      group by
        e.id,
        e.slug,
        e.title,
        et_requested.title,
        et_english.title
      order by count(*) desc, experience_name, e.id
      limit 1
    ) top_experience on true
    where p.status = 'active'
      and p.published_at <= now()
      and l.latitude between -90 and 90
      and l.longitude between -180 and 180
  )
  select
    pm.partner_id,
    pm.slug,
    pm.name,
    pm.category,
    pm.short_description,
    pm.website_url,
    pm.is_featured,
    pm.published_at,
    pm.location_id,
    pm.location_slug,
    pm.location_name,
    pm.city,
    pm.province,
    pm.latitude,
    pm.longitude,
    pm.map_zoom,
    pm.directions_url,
    pm.image_bucket_id,
    pm.image_storage_path,
    pm.image_alt_text,
    pm.logo_bucket_id,
    pm.logo_storage_path,
    pm.logo_alt_text,
    pm.qr_scan_count,
    pm.attributed_booking_count,
    pm.conversion_rate,
    pm.most_booked_experience_slug,
    pm.most_booked_experience_name,
    count(*) over ()::bigint as total_partner_count,
    coalesce(sum(pm.qr_scan_count) over (), 0::numeric)::bigint
      as total_qr_scan_count,
    coalesce(sum(pm.attributed_booking_count) over (), 0::numeric)::bigint
      as total_booking_count
  from partner_metrics pm
  order by pm.is_featured desc, pm.name, pm.partner_id;
$$;

comment on function public.get_public_partner_directory(text) is
  'Public partner directory read model. Returns active located partners, public media and canonical aggregate referral metrics only.';

revoke all on function public.get_public_partner_directory(text)
  from public, anon, authenticated;
grant execute on function public.get_public_partner_directory(text)
  to anon, authenticated, service_role;
