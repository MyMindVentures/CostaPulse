create or replace function public.get_shared_credential_portfolio(
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_hash text;
  v_share public.credential_share_links%rowtype;
  v_grant public.credential_access_grants%rowtype;
  v_payload jsonb;
begin
  v_hash := encode(extensions.digest(trim(coalesce(p_token, '')), 'sha256'), 'hex');
  if v_hash is null or v_hash = '' then
    raise exception 'TOKEN_REQUIRED';
  end if;

  select sl.*
  into v_share
  from public.credential_share_links sl
  where sl.token_hash = v_hash
    and sl.revoked_at is null
    and sl.expires_at > v_now
    and (sl.max_views is null or sl.view_count < sl.max_views)
  order by sl.created_at desc
  limit 1;

  if v_share.id is null then
    raise exception 'SHARE_NOT_FOUND';
  end if;

  select g.*
  into v_grant
  from public.credential_access_grants g
  where g.id = v_share.grant_id
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_now);

  if v_grant.id is null then
    raise exception 'GRANT_NOT_ACTIVE';
  end if;

  update public.credential_share_links
  set view_count = view_count + 1
  where id = v_share.id;

  insert into public.credential_access_events (
    grant_id,
    share_link_id,
    event_type,
    metadata
  )
  values (
    v_grant.id,
    v_share.id,
    'portfolio_viewed',
    jsonb_build_object('source', 'shared_link')
  );

  select jsonb_build_object(
    'grant_id', v_grant.id,
    'share_link_id', v_share.id,
    'owner_profile_id', v_grant.owner_profile_id,
    'recipient_email', coalesce(v_share.recipient_email, v_grant.recipient_email),
    'recipient_agency_label', coalesce(v_share.recipient_agency_label, v_grant.recipient_agency_label),
    'permissions', jsonb_build_object(
      'canViewFiles', v_grant.permission_view_files,
      'canDownloadFiles', v_grant.permission_download_files,
      'canViewDocumentNumbers', v_grant.permission_include_document_number,
      'canViewHistory', v_grant.permission_include_history
    ),
    'access_expires_at', v_grant.access_expires_at,
    'share_expires_at', v_share.expires_at,
    'credentials', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'document_type', d.document_type,
          'category', d.category,
          'title', d.title,
          'document_number',
            case
              when v_grant.permission_include_document_number or gd.include_document_number then d.document_number
              when d.document_number is null then null
              when length(d.document_number) <= 4 then repeat('*', length(d.document_number))
              else repeat('*', greatest(length(d.document_number) - 4, 0)) || right(d.document_number, 4)
            end,
          'issuing_authority', d.issuing_authority,
          'issuing_country_code', d.issuing_country_code,
          'issued_on', d.issued_on,
          'valid_from', d.valid_from,
          'expires_on', d.expires_on,
          'does_not_expire', d.does_not_expire,
          'qualification', d.qualification,
          'stcw_code', d.stcw_code,
          'restrictions', d.restrictions,
          'status', d.status,
          'verification_status', d.verification_status,
          'computed_status',
            case
              when d.status in ('replaced', 'revoked', 'archived', 'draft') then d.status
              when d.does_not_expire then 'valid'
              when d.expires_on is null then 'validity_unknown'
              when d.expires_on < current_date then 'expired'
              when d.expires_on <= current_date + 30 then 'expires_within_30_days'
              when d.expires_on <= current_date + 60 then 'expires_within_60_days'
              when d.expires_on <= current_date + 90 then 'expires_within_90_days'
              when d.expires_on <= current_date + 180 then 'expires_within_180_days'
              else 'valid'
            end,
          'files',
            case
              when v_grant.permission_view_files then (
                select coalesce(jsonb_agg(jsonb_build_object(
                  'id', f.id,
                  'file_role', f.file_role,
                  'mime_type', f.mime_type,
                  'file_size_bytes', f.file_size_bytes,
                  'original_filename', f.original_filename,
                  'version_number', f.version_number,
                  'is_current', f.is_current,
                  'created_at', f.created_at
                ) order by f.is_current desc, f.version_number desc), '[]'::jsonb)
                from public.professional_document_files f
                where f.document_id = d.id
                  and f.file_role = any (gd.file_roles)
                  and (v_grant.permission_include_history or gd.include_history or f.is_current)
              )
              else '[]'::jsonb
            end
        )
      )
      from public.credential_access_grant_documents gd
      join public.professional_documents d on d.id = gd.document_id
      where gd.grant_id = v_grant.id
    ), '[]'::jsonb)
  )
  into v_payload;

  return v_payload;
end;
$$;

create or replace function public.get_authenticated_credential_file_access(
  p_document_file_id uuid,
  p_intent text default 'view'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_email text;
  v_grant public.credential_access_grants%rowtype;
  v_file record;
  v_intent text := lower(trim(coalesce(p_intent, 'view')));
begin
  if v_intent not in ('view', 'download') then
    raise exception 'INVALID_INTENT';
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'AUTH_EMAIL_REQUIRED';
  end if;

  select g.*
  into v_grant
  from public.credential_access_grants g
  where g.recipient_email = v_email
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_now)
  order by g.created_at desc
  limit 1;

  if v_grant.id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  if v_intent = 'view' and not v_grant.permission_view_files then
    insert into public.credential_access_events (
      grant_id,
      actor_profile_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      auth.uid(),
      'access_denied',
      jsonb_build_object('reason', 'VIEW_NOT_ALLOWED', 'file_id', p_document_file_id)
    );
    raise exception 'VIEW_NOT_ALLOWED';
  end if;

  if v_intent = 'download' and not v_grant.permission_download_files then
    insert into public.credential_access_events (
      grant_id,
      actor_profile_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      auth.uid(),
      'access_denied',
      jsonb_build_object('reason', 'DOWNLOAD_NOT_ALLOWED', 'file_id', p_document_file_id)
    );
    raise exception 'DOWNLOAD_NOT_ALLOWED';
  end if;

  select
    f.id,
    f.storage_bucket,
    f.storage_path,
    f.original_filename,
    f.mime_type,
    d.id as document_id
  into v_file
  from public.credential_access_grant_documents gd
  join public.professional_document_files f on f.document_id = gd.document_id
  join public.professional_documents d on d.id = gd.document_id
  where gd.grant_id = v_grant.id
    and f.id = p_document_file_id
    and f.file_role = any (gd.file_roles)
    and (v_grant.permission_include_history or gd.include_history or f.is_current)
  limit 1;

  if v_file.id is null then
    insert into public.credential_access_events (
      grant_id,
      actor_profile_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      auth.uid(),
      'access_denied',
      jsonb_build_object('reason', 'FILE_NOT_GRANTED', 'file_id', p_document_file_id)
    );
    raise exception 'FILE_NOT_GRANTED';
  end if;

  insert into public.credential_access_events (
    grant_id,
    document_id,
    document_file_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    v_grant.id,
    v_file.document_id,
    v_file.id,
    auth.uid(),
    case when v_intent = 'download' then 'file_downloaded' else 'file_opened' end,
    jsonb_build_object('source', 'authenticated_portal')
  );

  return jsonb_build_object(
    'grant_id', v_grant.id,
    'document_id', v_file.document_id,
    'document_file_id', v_file.id,
    'storage_bucket', v_file.storage_bucket,
    'storage_path', v_file.storage_path,
    'original_filename', v_file.original_filename,
    'mime_type', v_file.mime_type
  );
end;
$$;

create or replace function public.get_shared_credential_file_access(
  p_token text,
  p_document_file_id uuid,
  p_intent text default 'view'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_hash text;
  v_share public.credential_share_links%rowtype;
  v_grant public.credential_access_grants%rowtype;
  v_file record;
  v_intent text := lower(trim(coalesce(p_intent, 'view')));
begin
  if v_intent not in ('view', 'download') then
    raise exception 'INVALID_INTENT';
  end if;

  v_hash := encode(extensions.digest(trim(coalesce(p_token, '')), 'sha256'), 'hex');
  if v_hash is null or v_hash = '' then
    raise exception 'TOKEN_REQUIRED';
  end if;

  select sl.*
  into v_share
  from public.credential_share_links sl
  where sl.token_hash = v_hash
    and sl.revoked_at is null
    and sl.expires_at > v_now
    and (sl.max_views is null or sl.view_count < sl.max_views)
    and (v_intent <> 'download' or sl.max_downloads is null or sl.download_count < sl.max_downloads)
  order by sl.created_at desc
  limit 1;

  if v_share.id is null then
    raise exception 'SHARE_NOT_FOUND';
  end if;

  select g.*
  into v_grant
  from public.credential_access_grants g
  where g.id = v_share.grant_id
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_now);

  if v_grant.id is null then
    raise exception 'GRANT_NOT_ACTIVE';
  end if;

  if v_intent = 'view' and not v_grant.permission_view_files then
    insert into public.credential_access_events (
      grant_id,
      share_link_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      v_share.id,
      'access_denied',
      jsonb_build_object('reason', 'VIEW_NOT_ALLOWED', 'file_id', p_document_file_id)
    );
    raise exception 'VIEW_NOT_ALLOWED';
  end if;

  if v_intent = 'download' and not v_grant.permission_download_files then
    insert into public.credential_access_events (
      grant_id,
      share_link_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      v_share.id,
      'access_denied',
      jsonb_build_object('reason', 'DOWNLOAD_NOT_ALLOWED', 'file_id', p_document_file_id)
    );
    raise exception 'DOWNLOAD_NOT_ALLOWED';
  end if;

  select
    f.id,
    f.storage_bucket,
    f.storage_path,
    f.original_filename,
    f.mime_type,
    d.id as document_id
  into v_file
  from public.credential_access_grant_documents gd
  join public.professional_document_files f on f.document_id = gd.document_id
  join public.professional_documents d on d.id = gd.document_id
  where gd.grant_id = v_grant.id
    and f.id = p_document_file_id
    and f.file_role = any (gd.file_roles)
    and (v_grant.permission_include_history or gd.include_history or f.is_current)
  limit 1;

  if v_file.id is null then
    insert into public.credential_access_events (
      grant_id,
      share_link_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      v_share.id,
      'access_denied',
      jsonb_build_object('reason', 'FILE_NOT_GRANTED', 'file_id', p_document_file_id)
    );
    raise exception 'FILE_NOT_GRANTED';
  end if;

  if v_intent = 'download' then
    update public.credential_share_links
    set download_count = download_count + 1
    where id = v_share.id;
  end if;

  insert into public.credential_access_events (
    grant_id,
    share_link_id,
    document_id,
    document_file_id,
    event_type,
    metadata
  )
  values (
    v_grant.id,
    v_share.id,
    v_file.document_id,
    v_file.id,
    case when v_intent = 'download' then 'file_downloaded' else 'file_opened' end,
    jsonb_build_object('source', 'shared_link')
  );

  return jsonb_build_object(
    'grant_id', v_grant.id,
    'share_link_id', v_share.id,
    'document_id', v_file.document_id,
    'document_file_id', v_file.id,
    'storage_bucket', v_file.storage_bucket,
    'storage_path', v_file.storage_path,
    'original_filename', v_file.original_filename,
    'mime_type', v_file.mime_type
  );
end;
$$;

revoke all on function public.get_shared_credential_portfolio(text)
from public;
grant execute on function public.get_shared_credential_portfolio(text)
to anon, authenticated;

revoke all on function public.get_authenticated_credential_file_access(uuid, text)
from public;
grant execute on function public.get_authenticated_credential_file_access(uuid, text)
to authenticated;

revoke all on function public.get_shared_credential_file_access(text, uuid, text)
from public;
grant execute on function public.get_shared_credential_file_access(text, uuid, text)
to anon, authenticated;
