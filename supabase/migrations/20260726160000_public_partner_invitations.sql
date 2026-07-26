-- Publish an intentionally narrow partner-invitation read model without
-- granting anonymous access to operational outreach records.
alter table public.partner_outreach
  add column if not exists is_public_presentation boolean not null default false;

update public.partner_outreach
set is_public_presentation = true
where id = '1d40872e-fba5-46c3-bc58-4a57fcbf4c67'::uuid
  and partner_id = '3e2a96de-f107-4b7e-b17b-03fb90ef49bd'::uuid;

create index if not exists partner_outreach_public_presentation_idx
  on public.partner_outreach (partner_id, created_at desc)
  where is_public_presentation = true;

create or replace function public.get_public_partner_invitation(
  p_partner_slug text,
  p_locale text default 'en'
)
returns table (
  partner_id uuid,
  partner_slug text,
  partner_name text,
  partner_description text,
  business_type text,
  website_url text,
  location_name text,
  location_city text,
  location_province text,
  location_country_code char(2),
  outreach_subject text,
  invitation_body text,
  image_bucket_id text,
  image_storage_path text,
  image_alt_text text,
  logo_bucket_id text,
  logo_storage_path text,
  logo_alt_text text
)
language sql
stable
security definer
set search_path to 'public', 'pg_catalog'
as $$
  select
    p.id,
    p.slug,
    p.name,
    p.description,
    p.business_type,
    p.website_url,
    l.name,
    l.city,
    l.province,
    l.country_code,
    outreach.subject,
    outreach.message_summary,
    cover.bucket_id,
    cover.storage_path,
    cover.alt_text,
    logo.bucket_id,
    logo.storage_path,
    logo.alt_text
  from public.partners p
  left join public.locations l on l.id = p.location_id and l.is_active = true
  join lateral (
    select po.subject, po.message_summary
    from public.partner_outreach po
    where po.partner_id = p.id
      and po.is_public_presentation = true
      and nullif(trim(po.message_summary), '') is not null
    order by po.created_at desc, po.id desc
    limit 1
  ) outreach on true
  left join lateral (
    select ma.bucket_id, ma.storage_path,
      coalesce(mp.alt_text_override, ma.alt_text) as alt_text
    from public.media_placements mp
    join public.media_assets ma on ma.id = mp.media_asset_id
    where mp.entity_type = 'partner' and mp.entity_id = p.id
      and mp.usage in ('hero', 'card_thumbnail', 'gallery')
      and mp.is_active = true and (mp.locale is null or mp.locale = p_locale)
      and ma.is_active = true and ma.status = 'published'
      and ma.visibility = 'public'
      and (ma.starts_at is null or ma.starts_at <= now())
      and (ma.ends_at is null or ma.ends_at > now())
    order by case mp.usage when 'hero' then 0 when 'card_thumbnail' then 1 else 2 end,
      case when mp.locale = p_locale then 0 else 1 end,
      mp.is_primary desc, mp.display_order, mp.id
    limit 1
  ) cover on true
  left join lateral (
    select ma.bucket_id, ma.storage_path,
      coalesce(mp.alt_text_override, ma.alt_text) as alt_text
    from public.media_placements mp
    join public.media_assets ma on ma.id = mp.media_asset_id
    where mp.entity_type = 'partner' and mp.entity_id = p.id
      and mp.usage = 'logo' and mp.is_active = true
      and (mp.locale is null or mp.locale = p_locale)
      and ma.is_active = true and ma.status = 'published'
      and ma.visibility = 'public'
      and (ma.starts_at is null or ma.starts_at <= now())
      and (ma.ends_at is null or ma.ends_at > now())
    order by case when mp.locale = p_locale then 0 else 1 end,
      mp.is_primary desc, mp.display_order, mp.id
    limit 1
  ) logo on true
  where p.slug = nullif(trim(p_partner_slug), '')
    and p.status = 'active'
    and p.published_at <= now()
  limit 1;
$$;

comment on function public.get_public_partner_invitation(text, text) is
  'Returns presentation-safe partner, location, public media and invitation fields only for explicitly published outreach records.';

revoke all on function public.get_public_partner_invitation(text, text)
  from public, anon, authenticated;
grant execute on function public.get_public_partner_invitation(text, text)
  to anon, authenticated, service_role;

-- Preserve any existing authenticated/staff grants; only anonymous users must
-- be unable to inspect the operational table directly.
revoke select on table public.partner_outreach from anon;
