-- Complete the public calendar contract with backend-owned filter groups and
-- retain cancelled entries so the documented precedence can be represented.

do $migration$
declare
  function_signature regprocedure :=
    'public.get_public_team_member_availability(text,timestamptz,timestamptz,text,text,text,boolean,text)'::regprocedure;
  current_definition text;
  corrected_definition text;
begin
  current_definition := pg_get_functiondef(function_signature);
  corrected_definition := replace(
    current_definition,
    E'\n      and a.status <> ''cancelled''',
    ''
  );

  if corrected_definition = current_definition then
    raise exception 'Expected cancelled-entry predicate was not found';
  end if;

  execute corrected_definition;
end
$migration$;

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
    p_service_category,
    p_status,
    p_available_only,
    p_location
  ) entry
  where p_service_filter is null
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

revoke all on function public.get_public_team_member_availability(
  text, timestamptz, timestamptz, text, text, text, boolean, text, text
) from public, anon, authenticated;
grant execute on function public.get_public_team_member_availability(
  text, timestamptz, timestamptz, text, text, text, boolean, text, text
) to anon, authenticated, service_role;
