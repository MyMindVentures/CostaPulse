-- Issue #67: integrated professional, personal, and experience availability.

alter table public.professional_services
  drop constraint professional_services_service_category_check;

alter table public.professional_services
  add constraint professional_services_service_category_check
  check (
    service_category = any (
      array[
        'harbour_tug_captain',
        'relief_captain',
        'yacht_captain',
        'delivery_skipper',
        'temporary_captain',
        'training_captain',
        'chief_mate',
        'mate',
        'ship_handling_support',
        'maritime_consultancy',
        'other'
      ]::text[]
    )
  );

create table public.team_member_availability (
  id uuid primary key default extensions.gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  professional_service_id uuid references public.professional_services(id) on delete restrict,
  experience_id uuid references public.experiences(id) on delete restrict,
  experience_variant_id uuid,
  availability_slot_id uuid,
  entry_type text not null,
  status text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Madrid',
  is_all_day boolean not null default false,
  public_title text,
  public_summary text,
  public_location_label text,
  location_id uuid references public.locations(id) on delete restrict,
  geographic_scope text,
  travel_available boolean not null default false,
  capacity_total integer,
  capacity_reserved integer not null default 0,
  visibility text not null default 'public',
  cta_type text,
  cta_path text,
  internal_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_member_availability_entry_type_check check (
    entry_type = any (
      array[
        'professional_service',
        'experience',
        'manual_availability',
        'manual_block',
        'travel',
        'confirmed_assignment'
      ]::text[]
    )
  ),
  constraint team_member_availability_status_check check (
    status = any (
      array[
        'available',
        'limited',
        'on_request',
        'partially_booked',
        'fully_booked',
        'unavailable',
        'travelling',
        'confirmed_assignment',
        'cancelled'
      ]::text[]
    )
  ),
  constraint team_member_availability_visibility_check check (
    visibility = any (array['public', 'authenticated', 'private']::text[])
  ),
  constraint team_member_availability_cta_type_check check (
    cta_type is null
    or cta_type = any (
      array[
        'request_availability',
        'request_service',
        'book_experience',
        'view_details',
        'none'
      ]::text[]
    )
  ),
  constraint team_member_availability_time_window_check check (ends_at > starts_at),
  constraint team_member_availability_capacity_total_check check (
    capacity_total is null or capacity_total > 0
  ),
  constraint team_member_availability_capacity_reserved_check check (
    capacity_reserved >= 0
    and (capacity_total is null or capacity_reserved <= capacity_total)
  ),
  constraint team_member_availability_cta_path_check check (
    cta_path is null or cta_path like '/%'
  ),
  constraint team_member_availability_metadata_check check (
    jsonb_typeof(metadata) = 'object'
  ),
  constraint team_member_availability_professional_source_check check (
    (professional_service_id is null and entry_type <> 'professional_service')
    or (professional_service_id is not null and entry_type = 'professional_service')
  ),
  constraint team_member_availability_experience_source_check check (
    entry_type <> 'experience' or experience_id is not null
  ),
  constraint team_member_availability_slot_source_check check (
    availability_slot_id is null
    or (experience_id is not null and experience_variant_id is not null)
  ),
  constraint team_member_availability_public_copy_check check (
    visibility <> 'public'
    or public_title is not null
    or professional_service_id is not null
    or experience_id is not null
    or availability_slot_id is not null
  ),
  constraint team_member_availability_experience_variant_fk
    foreign key (experience_variant_id, experience_id)
    references public.experience_variants(id, experience_id)
    on delete restrict,
  constraint team_member_availability_slot_fk
    foreign key (availability_slot_id, experience_variant_id)
    references public.availability_slots(id, experience_variant_id)
    on delete restrict
);

create index team_member_availability_member_range_idx
  on public.team_member_availability(team_member_id, starts_at, ends_at);
create index team_member_availability_member_status_start_idx
  on public.team_member_availability(team_member_id, status, starts_at);
create index team_member_availability_service_start_idx
  on public.team_member_availability(professional_service_id, starts_at)
  where professional_service_id is not null;
create index team_member_availability_experience_start_idx
  on public.team_member_availability(experience_id, starts_at)
  where experience_id is not null;
create index team_member_availability_visibility_range_idx
  on public.team_member_availability(visibility, starts_at, ends_at);
create index team_member_availability_slot_idx
  on public.team_member_availability(availability_slot_id)
  where availability_slot_id is not null;

create trigger set_team_member_availability_updated_at
before update on public.team_member_availability
for each row execute function public.set_updated_at();

alter table public.team_member_availability enable row level security;

create policy "availability owner or staff read"
on public.team_member_availability
for select
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_member_id
      and tm.profile_id = (select auth.uid())
  )
  or private.has_role(
    array[
      'operations_staff',
      'administrator',
      'super_administrator'
    ]::public.app_role[]
  )
);

create policy "availability owner or staff insert"
on public.team_member_availability
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    exists (
      select 1
      from public.team_members tm
      where tm.id = team_member_id
        and tm.profile_id = (select auth.uid())
    )
    or private.has_role(
      array[
        'operations_staff',
        'administrator',
        'super_administrator'
      ]::public.app_role[]
    )
  )
);

create policy "availability owner or staff update"
on public.team_member_availability
for update
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_member_id
      and tm.profile_id = (select auth.uid())
  )
  or private.has_role(
    array[
      'operations_staff',
      'administrator',
      'super_administrator'
    ]::public.app_role[]
  )
)
with check (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_member_id
      and tm.profile_id = (select auth.uid())
  )
  or private.has_role(
    array[
      'operations_staff',
      'administrator',
      'super_administrator'
    ]::public.app_role[]
  )
);

create policy "availability owner or staff delete"
on public.team_member_availability
for delete
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_member_id
      and tm.profile_id = (select auth.uid())
  )
  or private.has_role(
    array[
      'operations_staff',
      'administrator',
      'super_administrator'
    ]::public.app_role[]
  )
);

revoke all on table public.team_member_availability from public, anon;
grant select, insert, update, delete on table public.team_member_availability to authenticated;
grant all on table public.team_member_availability to service_role;

create or replace function public.get_public_team_member_availability(
  p_team_member_slug text,
  p_range_start timestamptz,
  p_range_end timestamptz,
  p_locale text default 'en',
  p_service_category text default null,
  p_status text default null,
  p_available_only boolean default false,
  p_location text default null
)
returns table (
  "id" uuid,
  "dateKey" text,
  "startsAt" timestamptz,
  "endsAt" timestamptz,
  "timezone" text,
  "isAllDay" boolean,
  "status" text,
  "entryType" text,
  "title" text,
  "summary" text,
  "locationLabel" text,
  "geographicScope" text,
  "travelAvailable" boolean,
  "capacityTotal" integer,
  "capacityReserved" integer,
  "capacityRemaining" integer,
  "service" jsonb,
  "experience" jsonb,
  "cta" jsonb
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  with requested_member as (
    select tm.id
    from public.team_members tm
    where tm.slug = p_team_member_slug
      and tm.is_active
      and p_range_end > p_range_start
      and p_range_end <= p_range_start + interval '400 days'
  ),
  manual_entries as (
    select
      a.id,
      a.starts_at,
      a.ends_at,
      a.timezone,
      a.is_all_day,
      a.status as declared_status,
      a.entry_type,
      coalesce(a.public_title, ps.title, e.title) as title,
      coalesce(a.public_summary, ps.summary, e.short_description) as summary,
      coalesce(a.public_location_label, l.name) as location_label,
      coalesce(a.geographic_scope, ps.geographic_scope) as geographic_scope,
      a.travel_available,
      coalesce(s.capacity_total, a.capacity_total) as capacity_total,
      case
        when s.id is not null then public.booking_reserved_capacity(s.id)
        else a.capacity_reserved
      end as capacity_reserved,
      ps.id as service_id,
      ps.slug as service_slug,
      ps.service_category,
      ps.audience as service_audience,
      e.id as experience_id,
      e.slug as experience_slug,
      a.experience_variant_id,
      a.cta_type,
      a.cta_path,
      s.status::text as slot_status
    from public.team_member_availability a
    join requested_member rm on rm.id = a.team_member_id
    left join public.professional_services ps
      on ps.id = a.professional_service_id
      and ps.status = 'published'
    left join public.experiences e
      on e.id = a.experience_id
      and e.status = 'published'
    left join public.availability_slots s on s.id = a.availability_slot_id
    left join public.locations l on l.id = a.location_id
    where a.visibility = 'public'
      and a.status <> 'cancelled'
      and a.starts_at < p_range_end
      and a.ends_at > p_range_start
      and (a.professional_service_id is null or ps.id is not null)
      and (a.experience_id is null or e.id is not null)
  ),
  slot_entries as (
    select
      s.id,
      s.starts_at,
      s.ends_at,
      s.timezone,
      false as is_all_day,
      case
        when s.status = 'cancelled' then 'cancelled'
        when s.status = 'unavailable' then 'unavailable'
        when s.status = 'sold_out' then 'fully_booked'
        else 'available'
      end as declared_status,
      'experience'::text as entry_type,
      e.title,
      e.short_description as summary,
      l.name as location_label,
      null::text as geographic_scope,
      false as travel_available,
      s.capacity_total,
      public.booking_reserved_capacity(s.id) as capacity_reserved,
      null::uuid as service_id,
      null::text as service_slug,
      null::text as service_category,
      null::text[] as service_audience,
      e.id as experience_id,
      e.slug as experience_slug,
      s.experience_variant_id,
      'book_experience'::text as cta_type,
      '/book/' || e.slug as cta_path,
      s.status::text as slot_status
    from public.availability_slots s
    join public.availability_slot_team_members astm
      on astm.availability_slot_id = s.id
    join requested_member rm on rm.id = astm.team_member_id
    join public.experiences e on e.id = s.experience_id and e.status = 'published'
    left join public.locations l on l.id = s.location_id
    where s.starts_at < p_range_end
      and s.ends_at > p_range_start
      and not exists (
        select 1
        from public.team_member_availability a
        where a.availability_slot_id = s.id
          and a.team_member_id = rm.id
      )
  ),
  combined as (
    select * from manual_entries
    union all
    select * from slot_entries
  ),
  effective as (
    select
      c.*,
      greatest(coalesce(c.capacity_total - c.capacity_reserved, 0), 0) as remaining,
      case
        when c.declared_status = 'cancelled' or c.slot_status = 'cancelled' then 'cancelled'
        when c.declared_status = 'confirmed_assignment' then 'confirmed_assignment'
        when c.declared_status = 'unavailable'
          or c.entry_type = 'manual_block'
          or c.slot_status = 'unavailable' then 'unavailable'
        when c.declared_status = 'fully_booked'
          or c.slot_status = 'sold_out'
          or (c.capacity_total is not null and c.capacity_reserved >= c.capacity_total)
          then 'fully_booked'
        when c.declared_status = 'partially_booked'
          or (c.capacity_total is not null and c.capacity_reserved > 0)
          then 'partially_booked'
        when c.declared_status = 'limited' then 'limited'
        when c.declared_status = 'on_request' then 'on_request'
        when c.declared_status = 'travelling' or c.entry_type = 'travel' then 'travelling'
        else 'available'
      end as effective_status
    from combined c
  )
  select
    e.id,
    to_char(e.starts_at at time zone e.timezone, 'YYYY-MM-DD'),
    e.starts_at,
    e.ends_at,
    e.timezone,
    e.is_all_day,
    e.effective_status,
    e.entry_type,
    e.title,
    e.summary,
    e.location_label,
    e.geographic_scope,
    e.travel_available,
    e.capacity_total,
    e.capacity_reserved,
    case when e.capacity_total is null then null else e.remaining end,
    case when e.service_id is null then null else jsonb_build_object(
      'id', e.service_id,
      'slug', e.service_slug,
      'category', e.service_category,
      'audience', e.service_audience
    ) end,
    case when e.experience_id is null then null else jsonb_build_object(
      'id', e.experience_id,
      'slug', e.experience_slug,
      'variantId', e.experience_variant_id
    ) end,
    jsonb_build_object(
      'type', coalesce(e.cta_type, 'none'),
      'label', case coalesce(e.cta_type, 'none')
        when 'request_availability' then case p_locale
          when 'es' then 'Solicitar disponibilidad'
          when 'nl' then 'Beschikbaarheid aanvragen'
          when 'de' then 'Verfügbarkeit anfragen'
          when 'fr' then 'Demander la disponibilité'
          else 'Request availability'
        end
        when 'request_service' then case p_locale
          when 'es' then 'Solicitar servicio'
          when 'nl' then 'Dienst aanvragen'
          when 'de' then 'Service anfragen'
          when 'fr' then 'Demander le service'
          else 'Request service'
        end
        when 'book_experience' then case p_locale
          when 'es' then 'Reservar experiencia'
          when 'nl' then 'Ervaring boeken'
          when 'de' then 'Erlebnis buchen'
          when 'fr' then 'Réserver l’expérience'
          else 'Book experience'
        end
        when 'view_details' then case p_locale
          when 'es' then 'Ver detalles'
          when 'nl' then 'Details bekijken'
          when 'de' then 'Details ansehen'
          when 'fr' then 'Voir les détails'
          else 'View details'
        end
        else case p_locale
          when 'es' then 'Sin acción'
          when 'nl' then 'Geen actie'
          when 'de' then 'Keine Aktion'
          when 'fr' then 'Aucune action'
          else 'No action'
        end
      end,
      'path', e.cta_path
    )
  from effective e
  where (p_service_category is null or e.service_category = p_service_category)
    and (p_status is null or e.effective_status = p_status)
    and (
      not coalesce(p_available_only, false)
      or e.effective_status = any (
        array['available', 'limited', 'on_request', 'partially_booked']::text[]
      )
    )
    and (
      p_location is null
      or e.location_label ilike '%' || p_location || '%'
      or e.geographic_scope ilike '%' || p_location || '%'
    )
  order by e.starts_at, e.id;
$function$;

revoke all on function public.get_public_team_member_availability(
  text, timestamptz, timestamptz, text, text, text, boolean, text
) from public, anon, authenticated;
grant execute on function public.get_public_team_member_availability(
  text, timestamptz, timestamptz, text, text, text, boolean, text
) to anon, authenticated, service_role;

create or replace function public.check_team_member_availability_conflicts(
  p_team_member_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_exclude_id uuid default null
)
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  entry_type text
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $function$
  select a.id, a.starts_at, a.ends_at, a.status, a.entry_type
  from public.team_member_availability a
  where a.team_member_id = p_team_member_id
    and a.status <> 'cancelled'
    and a.id is distinct from p_exclude_id
    and a.starts_at < p_ends_at
    and a.ends_at > p_starts_at
  order by a.starts_at;
$function$;

revoke all on function public.check_team_member_availability_conflicts(
  uuid, timestamptz, timestamptz, uuid
) from public, anon, authenticated;
grant execute on function public.check_team_member_availability_conflicts(
  uuid, timestamptz, timestamptz, uuid
) to authenticated, service_role;
