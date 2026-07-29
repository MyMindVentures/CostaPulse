-- Cover the remaining availability foreign keys reported by the performance
-- advisor. Existing range/source indexes remain unchanged.

create index team_member_availability_created_by_idx
  on public.team_member_availability(created_by)
  where created_by is not null;

create index team_member_availability_location_idx
  on public.team_member_availability(location_id)
  where location_id is not null;

create index team_member_availability_variant_experience_idx
  on public.team_member_availability(experience_variant_id, experience_id)
  where experience_variant_id is not null;

create index team_member_availability_slot_variant_idx
  on public.team_member_availability(availability_slot_id, experience_variant_id)
  where availability_slot_id is not null;
