-- Transactional contract test for Issue #46. All changes are rolled back.
begin;

do $security$
begin
  if has_function_privilege(
    'anon',
    'public.get_authenticated_credential_file_access(uuid,text)',
    'execute'
  ) then
    raise exception 'ASSERT_AUTHENTICATED_FILE_RPC_ANON_EXECUTE_REVOKED_FAILED';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_recipient_credential_share_link(text,timestamptz)',
    'execute'
  ) then
    raise exception 'ASSERT_RECIPIENT_SHARE_RPC_ANON_EXECUTE_REVOKED_FAILED';
  end if;
end;
$security$;

do $contracts$
declare
  v_document_id uuid;
  v_owner_id uuid;
  v_recipient_id uuid;
  v_grant_id uuid;
  v_denied_share_id uuid;
  v_share_id uuid;
  v_owner_share_id uuid;
  v_payload jsonb;
  v_grant public.credential_access_grants%rowtype;
  v_share public.credential_share_links%rowtype;
  v_recipient_email text :=
    'issue-46-' || extensions.gen_random_uuid() || '@example.invalid';
begin
  select d.id, d.profile_id
  into v_document_id, v_owner_id
  from public.professional_documents d
  order by d.created_at
  limit 1;

  if v_document_id is null or v_owner_id is null then
    raise exception 'ASSERT_PROFESSIONAL_DOCUMENT_FIXTURE_MISSING';
  end if;

  select p.id
  into v_recipient_id
  from public.profiles p
  where p.id <> v_owner_id
  order by p.created_at
  limit 1;

  if v_recipient_id is null then
    v_recipient_id := v_owner_id;
  end if;

  update public.professional_documents
  set
    document_type = 'motivation_letter',
    language_code = 'en-GB',
    page_count = 2,
    notes = 'PRIVATE_ISSUE_46_SENTINEL'
  where id = v_document_id;

  begin
    update public.professional_documents
    set page_count = 0
    where id = v_document_id;
    raise exception 'ASSERT_PAGE_COUNT_CONSTRAINT_FAILED';
  exception
    when check_violation then null;
  end;

  begin
    update public.professional_documents
    set language_code = 'not_a_language'
    where id = v_document_id;
    raise exception 'ASSERT_LANGUAGE_CODE_CONSTRAINT_FAILED';
  exception
    when check_violation then null;
  end;

  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', v_owner_id,
      'role', 'authenticated',
      'email', 'owner@example.invalid'
    )::text,
    true
  );

  v_grant_id := public.create_credential_access_grant(
    p_recipient_email => v_recipient_email,
    p_recipient_agency_label => 'Issue 46 test',
    p_document_ids => array[v_document_id],
    p_selected_file_roles => array['primary'],
    p_access_expires_at => null,
    p_permission_view_files => true,
    p_permission_download_files => true,
    p_permission_include_history => false,
    p_permission_include_document_number => false,
    p_permission_create_share_links => true,
    p_message => null
  );

  select *
  into v_grant
  from public.credential_access_grants
  where id = v_grant_id;

  if v_grant.access_expires_at <> v_grant.created_at + interval '7 days' then
    raise exception 'ASSERT_GRANT_SEVEN_DAY_DEFAULT_FAILED';
  end if;

  update public.credential_access_grants
  set access_expires_at = created_at + interval '10 days'
  where id = v_grant_id;

  v_owner_share_id := public.create_credential_share_link(
    v_grant_id,
    repeat('a', 64),
    null,
    null,
    null,
    null,
    null
  );

  select *
  into v_share
  from public.credential_share_links
  where id = v_owner_share_id;

  if v_share.expires_at <> v_share.created_at + interval '7 days' then
    raise exception 'ASSERT_OWNER_SHARE_SEVEN_DAY_DEFAULT_FAILED';
  end if;

  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', v_recipient_id,
      'role', 'authenticated',
      'email', v_recipient_email
    )::text,
    true
  );

  v_payload := public.get_authenticated_credential_portfolio();
  if v_payload ->> 'grant_id' <> v_grant_id::text then
    raise exception 'ASSERT_ACCESS_BEFORE_DEADLINE_FAILED';
  end if;

  if v_payload::text like '%PRIVATE_ISSUE_46_SENTINEL%'
     or jsonb_path_exists(v_payload, '$.credentials[*].notes')
     or jsonb_path_exists(v_payload, '$.credentials[*].metadata')
     or jsonb_path_exists(v_payload, '$.credentials[*].files[*].storage_path')
     or jsonb_path_exists(v_payload, '$.credentials[*].files[*].storage_bucket') then
    raise exception 'ASSERT_SAFE_PAYLOAD_FAILED';
  end if;

  update public.credential_access_grants
  set
    created_at = timezone('utc', now()) - interval '8 days',
    access_expires_at = timezone('utc', now()) - interval '1 second'
  where id = v_grant_id;

  begin
    perform public.get_authenticated_credential_portfolio();
    raise exception 'ASSERT_EXPIRED_GRANT_ACCEPTED';
  exception
    when others then
      if sqlerrm = 'ASSERT_EXPIRED_GRANT_ACCEPTED' then
        raise;
      end if;
  end;

  update public.credential_access_grants
  set
    access_expires_at = timezone('utc', now()) + interval '1 day',
    revoked_at = timezone('utc', now())
  where id = v_grant_id;

  begin
    perform public.get_authenticated_credential_portfolio();
    raise exception 'ASSERT_REVOKED_GRANT_ACCEPTED';
  exception
    when others then
      if sqlerrm = 'ASSERT_REVOKED_GRANT_ACCEPTED' then
        raise;
      end if;
  end;

  update public.credential_access_grants
  set
    revoked_at = null,
    permission_create_share_links = false
  where id = v_grant_id;

  v_denied_share_id := public.create_recipient_credential_share_link(
    repeat('b', 64),
    null
  );
  if v_denied_share_id is not null then
    raise exception 'ASSERT_UNAUTHORIZED_RECIPIENT_SHARE_ACCEPTED';
  end if;
  if not exists (
    select 1
    from public.credential_access_events e
    where e.grant_id = v_grant_id
      and e.event_type = 'access_denied'
      and e.metadata ->> 'reason' = 'SHARE_NOT_ALLOWED'
  ) then
    raise exception 'ASSERT_RECIPIENT_SHARE_DENIAL_AUDIT_FAILED';
  end if;

  update public.credential_access_grants
  set permission_create_share_links = true
  where id = v_grant_id;

  v_share_id := public.create_recipient_credential_share_link(
    repeat('c', 64),
    null
  );
  select *
  into v_share
  from public.credential_share_links
  where id = v_share_id;

  if v_share.grant_id <> v_grant_id
     or v_share.expires_at <> (
       select access_expires_at
       from public.credential_access_grants
       where id = v_grant_id
     ) then
    raise exception 'ASSERT_RECIPIENT_SHARE_SCOPE_OR_CAP_FAILED';
  end if;

  begin
    perform public.create_recipient_credential_share_link(
      repeat('d', 64),
      timezone('utc', now()) + interval '2 days'
    );
    raise exception 'ASSERT_RECIPIENT_SHARE_OUTLIVED_GRANT';
  exception
    when others then
      if sqlerrm = 'ASSERT_RECIPIENT_SHARE_OUTLIVED_GRANT' then
        raise;
      end if;
  end;

  if not exists (
    select 1
    from public.credential_access_events e
    where e.share_link_id = v_share_id
      and e.event_type = 'share_created'
      and e.metadata ->> 'source' = 'recipient'
  ) then
    raise exception 'ASSERT_RECIPIENT_SHARE_CREATED_AUDIT_FAILED';
  end if;
end;
$contracts$;

rollback;
