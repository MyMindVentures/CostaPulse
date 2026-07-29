-- PostgREST overload selection requires all nine arguments. Treat empty
-- strings as omitted optional filters before calling the stable range RPC.

create or replace function public.get_public_team_member_availability(
  p_team_member_slug text,
  p_range_start timestamptz,
  p_range_end timestamptz,
  p_locale text,
  p_service_category text,
  p_status text,
  p_available_only boolean,
  p_location text,
  p_service_filter text
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
  select entry.*
  from public.get_public_team_member_availability(
    p_team_member_slug,
    p_range_start,
    p_range_end,
    p_locale,
    nullif(p_service_category, ''),
    nullif(p_status, ''),
    p_available_only,
    nullif(p_location, '')
  ) entry
  where nullif(p_service_filter, '') is null
    or (
      p_service_filter = 'crewing_maritime'
      and entry."service"->>'category' = any (
        array[
          'harbour_tug_captain',
          'relief_captain',
          'delivery_skipper',
          'temporary_captain',
          'chief_mate',
          'mate',
          'ship_handling_support',
          'maritime_consultancy',
          'other'
        ]::text[]
      )
    )
    or (
      p_service_filter = 'yacht_services'
      and entry."service"->>'category' = any (
        array['yacht_captain', 'training_captain']::text[]
      )
    )
    or (
      p_service_filter = 'watersports'
      and exists (
        select 1
        from public.experiences experience
        where experience.id = (entry."experience"->>'id')::uuid
          and experience.experience_type = any (
            array['kayak_mentor', 'paddlesurf_mentor']::text[]
          )
      )
    )
    or (
      p_service_filter = 'costapulse_experiences'
      and entry."experience" is not null
    );
$function$;
