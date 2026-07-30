create or replace function public.create_credential_access_grant(
  p_recipient_email text,
  p_recipient_agency_label text,
  p_document_ids uuid[],
  p_selected_file_roles text[] default array['primary']::text[],
  p_access_expires_at timestamptz default null,
  p_permission_view_files boolean default false,
  p_permission_download_files boolean default false,
  p_permission_include_history boolean default false,
  p_permission_include_document_number boolean default false,
  p_permission_create_share_links boolean default false,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_is_admin boolean;
  v_owner_profile_id uuid;
  v_grant_id uuid;
  v_recipient_email text;
  v_created_at timestamptz := timezone('utc', now());
  v_expires_at timestamptz;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_document_ids is null or array_length(p_document_ids, 1) is null then
    raise exception 'DOCUMENTS_REQUIRED';
  end if;

  if p_permission_create_share_links and not p_permission_view_files then
    raise exception 'SHARE_REQUIRES_VIEW';
  end if;

  v_recipient_email := lower(trim(p_recipient_email));
  if v_recipient_email = '' then
    raise exception 'RECIPIENT_EMAIL_REQUIRED';
  end if;

  v_expires_at := coalesce(
    p_access_expires_at,
    v_created_at + interval '7 days'
  );
  if v_expires_at <= v_created_at then
    raise exception 'EXPIRY_REQUIRED_IN_FUTURE';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in (
        'administrator',
        'super_administrator',
        'content_manager'
      )
  )
  into v_actor_is_admin;

  select d.profile_id
  into v_owner_profile_id
  from public.professional_documents d
  where d.id = any (p_document_ids)
  order by d.id
  limit 1;

  if v_owner_profile_id is null then
    raise exception 'DOCUMENTS_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.professional_documents d
    where d.id = any (p_document_ids)
      and d.profile_id <> v_owner_profile_id
  ) then
    raise exception 'DOCUMENTS_MUST_SHARE_OWNER';
  end if;

  if not v_actor_is_admin and v_owner_profile_id <> v_actor then
    raise exception 'FORBIDDEN';
  end if;

  insert into public.credential_access_grants (
    owner_profile_id,
    recipient_email,
    recipient_agency_label,
    permission_view_files,
    permission_download_files,
    permission_include_history,
    permission_include_document_number,
    permission_create_share_links,
    access_expires_at,
    message,
    created_by_profile_id,
    created_at,
    updated_at
  )
  values (
    v_owner_profile_id,
    v_recipient_email,
    nullif(trim(p_recipient_agency_label), ''),
    p_permission_view_files,
    p_permission_download_files,
    p_permission_include_history,
    p_permission_include_document_number,
    p_permission_create_share_links,
    v_expires_at,
    nullif(trim(p_message), ''),
    v_actor,
    v_created_at,
    v_created_at
  )
  returning id into v_grant_id;

  insert into public.credential_access_grant_documents (
    grant_id,
    document_id,
    file_roles,
    include_history,
    include_document_number
  )
  select
    v_grant_id,
    d.id,
    p_selected_file_roles,
    p_permission_include_history,
    p_permission_include_document_number
  from public.professional_documents d
  where d.id = any (p_document_ids);

  insert into public.credential_access_events (
    grant_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    v_grant_id,
    v_actor,
    'invitation_sent',
    jsonb_build_object(
      'recipient_email', v_recipient_email,
      'document_count', array_length(p_document_ids, 1),
      'access_expires_at', v_expires_at
    )
  );

  return v_grant_id;
end;
$$;

revoke all on function public.create_credential_access_grant(
  text,
  text,
  uuid[],
  text[],
  timestamptz,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  text
)
from public, anon;

grant execute on function public.create_credential_access_grant(
  text,
  text,
  uuid[],
  text[],
  timestamptz,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  text
)
to authenticated;
