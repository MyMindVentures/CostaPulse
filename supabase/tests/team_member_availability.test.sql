-- Transactional contract test for Issue #67. All test availability is rolled back.
begin;

do $security$
begin
  if has_table_privilege(
    'anon',
    'public.team_member_availability',
    'select'
  ) then
    raise exception 'ASSERT_RAW_PUBLIC_READ_REVOKED_FAILED';
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_public_team_member_availability(text,timestamptz,timestamptz,text,text,text,boolean,text)',
    'execute'
  ) then
    raise exception 'ASSERT_PUBLIC_RPC_EXECUTE_FAILED';
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_public_team_member_availability(text,timestamptz,timestamptz,text,text,text,boolean,text,text)',
    'execute'
  ) then
    raise exception 'ASSERT_FILTERED_PUBLIC_RPC_EXECUTE_FAILED';
  end if;

  if has_function_privilege(
    'anon',
    'public.check_team_member_availability_conflicts(uuid,timestamptz,timestamptz,uuid)',
    'execute'
  ) then
    raise exception 'ASSERT_CONFLICT_RPC_PRIVATE_FAILED';
  end if;
end;
$security$;

do $test$
declare
  v_team_member public.team_members%rowtype;
  v_entry_id uuid;
  v_rows jsonb;
begin
  select *
  into v_team_member
  from public.team_members
  where is_active
  order by is_featured desc, display_order
  limit 1;

  if v_team_member.id is null then
    raise exception 'ASSERT_ACTIVE_TEAM_MEMBER_FIXTURE_MISSING';
  end if;

  insert into public.team_member_availability (
    team_member_id,
    entry_type,
    status,
    starts_at,
    ends_at,
    is_all_day,
    public_title,
    public_summary,
    public_location_label,
    visibility,
    cta_type,
    cta_path,
    internal_notes,
    created_by
  )
  values (
    v_team_member.id,
    'manual_availability',
    'available',
    '2099-06-01T00:00:00+02:00',
    '2099-06-02T00:00:00+02:00',
    true,
    'Transactional availability test',
    'Safe public summary',
    'Public region',
    'public',
    'request_availability',
    '/contact',
    'PRIVATE_SENTINEL',
    v_team_member.profile_id
  )
  returning id into v_entry_id;

  select coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb)
  into v_rows
  from public.get_public_team_member_availability(
    v_team_member.slug,
    '2099-06-01T00:00:00Z',
    '2099-07-01T00:00:00Z',
    'en',
    null,
    null,
    false,
    null
  ) result;

  if jsonb_array_length(v_rows) <> 1 then
    raise exception 'ASSERT_RANGE_OR_TEAM_FILTER_FAILED';
  end if;
  if v_rows::text like '%PRIVATE_SENTINEL%'
    or (v_rows->0) ? 'internal_notes'
    or (v_rows->0) ? 'created_by' then
    raise exception 'ASSERT_PUBLIC_PRIVACY_FAILED';
  end if;
  if v_rows #>> '{0,status}' <> 'available'
    or v_rows #>> '{0,entryType}' <> 'manual_availability'
    or v_rows #>> '{0,cta,type}' <> 'request_availability' then
    raise exception 'ASSERT_PUBLIC_CONTRACT_MAPPING_FAILED';
  end if;

  update public.team_member_availability
  set status = 'unavailable'
  where id = v_entry_id;
  if (
    select "status" <> 'unavailable'
    from public.get_public_team_member_availability(
      v_team_member.slug,
      '2099-06-01T00:00:00Z',
      '2099-07-01T00:00:00Z'
    )
    where "id" = v_entry_id
  ) then
    raise exception 'ASSERT_STATUS_PRECEDENCE_FAILED';
  end if;

  begin
    insert into public.team_member_availability (
      team_member_id, entry_type, status, starts_at, ends_at,
      public_title, created_by
    )
    values (
      v_team_member.id, 'manual_availability', 'available',
      '2099-06-03T12:00:00Z', '2099-06-03T11:00:00Z',
      'Invalid range', v_team_member.profile_id
    );
    raise exception 'ASSERT_INVALID_TIME_RANGE_ACCEPTED';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.team_member_availability (
      team_member_id, entry_type, status, starts_at, ends_at,
      public_title, capacity_total, capacity_reserved, created_by
    )
    values (
      v_team_member.id, 'manual_availability', 'available',
      '2099-06-03T10:00:00Z', '2099-06-03T11:00:00Z',
      'Invalid capacity', 1, 2, v_team_member.profile_id
    );
    raise exception 'ASSERT_INVALID_CAPACITY_ACCEPTED';
  exception
    when check_violation then null;
  end;

  if not exists (
    select 1
    from public.check_team_member_availability_conflicts(
      v_team_member.id,
      '2099-06-01T12:00:00Z',
      '2099-06-01T13:00:00Z'
    )
    where id = v_entry_id
  ) then
    raise exception 'ASSERT_CONFLICT_DETECTION_FAILED';
  end if;
end;
$test$;

do $sources_and_capacity$
declare
  v_team_member public.team_members%rowtype;
  v_experience_id uuid;
  v_variant_id uuid;
  v_slot_id uuid;
  v_published_service_id uuid;
  v_draft_service_id uuid;
  v_rows jsonb;
begin
  select * into v_team_member
  from public.team_members
  where is_active
  order by is_featured desc, display_order
  limit 1;

  select e.id, ev.id
  into v_experience_id, v_variant_id
  from public.experiences e
  join public.experience_variants ev on ev.experience_id = e.id
  where e.status = 'published' and ev.is_active
  limit 1;

  if v_experience_id is null then
    raise exception 'ASSERT_PUBLISHED_EXPERIENCE_FIXTURE_MISSING';
  end if;

  insert into public.availability_slots (
    experience_id, experience_variant_id, starts_at, ends_at, capacity_total
  )
  values (
    v_experience_id, v_variant_id,
    '2099-06-10T08:00:00Z', '2099-06-10T12:00:00Z', 5
  )
  returning id into v_slot_id;

  insert into public.availability_slot_team_members (
    availability_slot_id, team_member_id, role_label, is_primary
  )
  values (v_slot_id, v_team_member.id, 'host', true);

  insert into public.booking_holds (
    availability_slot_id, party_size, expires_at
  )
  values
    (v_slot_id, 2, now() + interval '1 day'),
    (v_slot_id, 1, now() - interval '1 day');

  select coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb)
  into v_rows
  from public.get_public_team_member_availability(
    v_team_member.slug,
    '2099-06-10T00:00:00Z',
    '2099-06-11T00:00:00Z'
  ) result;

  if v_rows #>> '{0,status}' <> 'partially_booked'
    or (v_rows #>> '{0,capacityReserved}')::integer <> 2
    or (v_rows #>> '{0,capacityRemaining}')::integer <> 3 then
    raise exception 'ASSERT_ACTIVE_EXPIRED_HOLD_CAPACITY_FAILED';
  end if;

  update public.experiences set status = 'draft' where id = v_experience_id;
  if exists (
    select 1
    from public.get_public_team_member_availability(
      v_team_member.slug,
      '2099-06-10T00:00:00Z',
      '2099-06-11T00:00:00Z'
    )
    where "id" = v_slot_id
  ) then
    raise exception 'ASSERT_UNPUBLISHED_EXPERIENCE_FILTER_FAILED';
  end if;
  update public.experiences set status = 'published' where id = v_experience_id;

  insert into public.professional_services (
    slug, service_key, title, summary, service_category, status, published_at
  )
  values
    (
      'issue-67-published-service',
      'issue_67_published_service',
      'Published service',
      'Published service summary',
      'relief_captain',
      'published',
      now()
    ),
    (
      'issue-67-draft-service',
      'issue_67_draft_service',
      'Draft service',
      'Draft service summary',
      'yacht_captain',
      'draft',
      null
    );

  select id into v_published_service_id
  from public.professional_services
  where service_key = 'issue_67_published_service';
  select id into v_draft_service_id
  from public.professional_services
  where service_key = 'issue_67_draft_service';

  insert into public.team_member_availability (
    team_member_id, professional_service_id, entry_type, status,
    starts_at, ends_at, public_title, visibility, created_by
  )
  values
    (
      v_team_member.id, v_published_service_id, 'professional_service',
      'available', '2099-06-12T08:00:00Z', '2099-06-12T12:00:00Z',
      'Published service availability', 'public', v_team_member.profile_id
    ),
    (
      v_team_member.id, v_draft_service_id, 'professional_service',
      'available', '2099-06-12T13:00:00Z', '2099-06-12T17:00:00Z',
      'Draft service availability', 'public', v_team_member.profile_id
    ),
    (
      v_team_member.id, null, 'manual_availability', 'available',
      '2099-06-12T18:00:00Z', '2099-06-12T19:00:00Z',
      'Private availability', 'private', v_team_member.profile_id
    );

  select coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb)
  into v_rows
  from public.get_public_team_member_availability(
    v_team_member.slug,
    '2099-06-12T00:00:00Z',
    '2099-06-13T00:00:00Z'
  ) result;

  if jsonb_array_length(v_rows) <> 1
    or v_rows #>> '{0,title}' <> 'Published service availability' then
    raise exception 'ASSERT_PUBLICATION_OR_VISIBILITY_FILTER_FAILED';
  end if;

  select coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb)
  into v_rows
  from public.get_public_team_member_availability(
    v_team_member.slug,
    '2099-06-12T00:00:00Z',
    '2099-06-13T00:00:00Z',
    'en', '', '', false, '', 'crewing_maritime'
  ) result;
  if jsonb_array_length(v_rows) <> 1 then
    raise exception 'ASSERT_BACKEND_SERVICE_FILTER_GROUP_FAILED';
  end if;
end;
$sources_and_capacity$;

do $rls$
declare
  v_owner_id uuid;
  v_owner_team_id uuid;
  v_staff_team_id uuid;
  v_inserted_id uuid;
begin
  select profile_id, id into v_owner_id, v_owner_team_id
  from public.team_members
  where profile_id is not null and is_active
  limit 1;

  insert into public.team_members (
    slug, first_name, last_name, role_title, is_active
  )
  values (
    'issue-67-rls-fixture', 'RLS', 'Fixture', 'Test fixture', false
  )
  returning id into v_staff_team_id;

  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_owner_id, 'role', 'authenticated')::text,
    true
  );

  insert into public.team_member_availability (
    team_member_id, entry_type, status, starts_at, ends_at,
    public_title, visibility, created_by
  )
  values (
    v_owner_team_id, 'manual_availability', 'available',
    '2099-07-01T08:00:00Z', '2099-07-01T09:00:00Z',
    'Owner-managed entry', 'private', v_owner_id
  )
  returning id into v_inserted_id;

  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '00000000-0000-4000-8000-000000000099',
      'role', 'authenticated'
    )::text,
    true
  );
  begin
    insert into public.team_member_availability (
      team_member_id, entry_type, status, starts_at, ends_at,
      public_title, visibility, created_by
    )
    values (
      v_owner_team_id, 'manual_availability', 'available',
      '2099-07-02T08:00:00Z', '2099-07-02T09:00:00Z',
      'Unauthorized entry', 'private', v_owner_id
    );
    raise exception 'ASSERT_UNAUTHORIZED_WRITE_ACCEPTED';
  exception
    when insufficient_privilege then null;
  end;

  execute 'reset role';
  insert into public.user_roles (profile_id, role)
  values (v_owner_id, 'administrator')
  on conflict do nothing;
  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_owner_id, 'role', 'authenticated')::text,
    true
  );

  insert into public.team_member_availability (
    team_member_id, entry_type, status, starts_at, ends_at,
    public_title, visibility, created_by
  )
  values (
    v_staff_team_id, 'manual_availability', 'available',
    '2099-07-03T08:00:00Z', '2099-07-03T09:00:00Z',
    'Administrator-managed entry', 'private', v_owner_id
  );
  execute 'reset role';
end;
$rls$;

rollback;
