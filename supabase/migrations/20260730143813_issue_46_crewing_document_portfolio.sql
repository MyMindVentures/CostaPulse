alter table public.professional_documents
  add column language_code text,
  add column page_count integer;

alter table public.professional_documents
  add constraint professional_documents_language_code_check
    check (
      language_code is null
      or language_code ~ '^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2}|-[0-9]{3})?$'
    ),
  add constraint professional_documents_page_count_check
    check (page_count is null or page_count > 0);

alter table public.professional_documents
  drop constraint professional_documents_document_type_check;

alter table public.professional_documents
  add constraint professional_documents_document_type_check
    check (
      document_type = any (
        array[
          'passport',
          'seamans_book',
          'certificate_of_competency',
          'stcw_certificate',
          'stcw_refresher',
          'medical_certificate',
          'gmdss',
          'license',
          'visa',
          'vaccination_certificate',
          'training_certificate',
          'insurance',
          'cv',
          'motivation_letter',
          'assessment',
          'other'
        ]::text[]
      )
    );

alter table public.credential_access_grants
  add column permission_create_share_links boolean not null default false;

alter table public.credential_access_grants
  add constraint credential_access_grants_share_requires_view_check
    check (not permission_create_share_links or permission_view_files);

create or replace view public.professional_documents_admin
with (security_invoker = true)
as
select
  d.id,
  d.profile_id,
  d.team_member_certificate_id,
  d.document_type,
  d.category,
  d.title,
  d.document_number,
  d.issuing_authority,
  d.issuing_country_code,
  d.issued_on,
  d.valid_from,
  d.expires_on,
  d.does_not_expire,
  d.qualification,
  d.stcw_code,
  d.restrictions,
  d.notes,
  d.confidentiality_level,
  d.status,
  d.verification_status,
  d.verified_at,
  d.verified_by_profile_id,
  d.replaces_document_id,
  d.uploaded_by_profile_id,
  d.metadata,
  d.created_at,
  d.updated_at,
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
  end as computed_status,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', f.id,
        'file_role', f.file_role,
        'storage_bucket', f.storage_bucket,
        'storage_path', f.storage_path,
        'original_filename', f.original_filename,
        'stored_filename', f.stored_filename,
        'mime_type', f.mime_type,
        'file_size_bytes', f.file_size_bytes,
        'checksum_sha256', f.checksum_sha256,
        'version_number', f.version_number,
        'is_current', f.is_current,
        'sort_order', f.sort_order,
        'created_at', f.created_at
      )
      order by f.file_role, f.version_number desc
    )
    from public.professional_document_files f
    where f.document_id = d.id
  ), '[]'::jsonb) as files,
  d.language_code,
  d.page_count
from public.professional_documents d
where d.profile_id = (select auth.uid())
   or public.has_any_role(
     (select auth.uid()),
     array['administrator', 'super_administrator']::public.app_role[]
   );

drop function public.create_credential_access_grant(
  text,
  text,
  uuid[],
  text[],
  timestamptz,
  boolean,
  boolean,
  boolean,
  boolean,
  text
);

create function public.create_credential_access_grant(
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
  v_expires_at := coalesce(p_access_expires_at, v_created_at + interval '7 days');
  if v_expires_at <= v_created_at then
    raise exception 'EXPIRY_REQUIRED_IN_FUTURE';
  end if;

  select exists (
    select 1 from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;

  select min(d.profile_id) into v_owner_profile_id
  from public.professional_documents d
  where d.id = any (p_document_ids);

  if v_owner_profile_id is null then
    raise exception 'DOCUMENTS_NOT_FOUND';
  end if;
  if exists (
    select 1 from public.professional_documents d
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
    grant_id, document_id, file_roles, include_history, include_document_number
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
    grant_id, actor_profile_id, event_type, metadata
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

create or replace function public.create_credential_share_link(
  p_grant_id uuid,
  p_token_hash text,
  p_expires_at timestamptz default null,
  p_recipient_email text default null,
  p_recipient_agency_label text default null,
  p_max_views integer default null,
  p_max_downloads integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_is_admin boolean;
  v_grant public.credential_access_grants%rowtype;
  v_share_id uuid;
  v_created_at timestamptz := timezone('utc', now());
  v_expires_at timestamptz;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select g.* into v_grant
  from public.credential_access_grants g
  where g.id = p_grant_id
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_created_at);
  if v_grant.id is null then
    raise exception 'GRANT_NOT_ACTIVE';
  end if;

  select exists (
    select 1 from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;
  if not v_actor_is_admin and v_grant.owner_profile_id <> v_actor then
    raise exception 'FORBIDDEN';
  end if;

  v_expires_at := case
    when p_expires_at is null and v_grant.access_expires_at is not null
      then least(v_created_at + interval '7 days', v_grant.access_expires_at)
    else coalesce(p_expires_at, v_created_at + interval '7 days')
  end;
  if v_expires_at <= v_created_at then
    raise exception 'EXPIRY_REQUIRED_IN_FUTURE';
  end if;
  if v_grant.access_expires_at is not null
     and v_expires_at > v_grant.access_expires_at then
    raise exception 'EXPIRY_EXCEEDS_GRANT';
  end if;

  insert into public.credential_share_links (
    grant_id, token_hash, recipient_email, recipient_agency_label,
    expires_at, max_views, max_downloads, created_by_profile_id,
    created_at, updated_at
  )
  values (
    p_grant_id,
    lower(trim(p_token_hash)),
    case
      when p_recipient_email is null or trim(p_recipient_email) = '' then null
      else lower(trim(p_recipient_email))
    end,
    nullif(trim(p_recipient_agency_label), ''),
    v_expires_at,
    p_max_views,
    p_max_downloads,
    v_actor,
    v_created_at,
    v_created_at
  )
  returning id into v_share_id;

  insert into public.credential_access_events (
    grant_id, share_link_id, actor_profile_id, event_type, metadata
  )
  values (
    p_grant_id,
    v_share_id,
    v_actor,
    'share_created',
    jsonb_build_object('expires_at', v_expires_at, 'source', 'owner')
  );
  return v_share_id;
end;
$$;

create or replace function public.create_recipient_credential_share_link(
  p_token_hash text,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_grant public.credential_access_grants%rowtype;
  v_share_id uuid;
  v_created_at timestamptz := timezone('utc', now());
  v_expires_at timestamptz;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'AUTH_EMAIL_REQUIRED';
  end if;

  select g.* into v_grant
  from public.credential_access_grants g
  where g.recipient_email = v_email
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_created_at)
  order by g.created_at desc
  limit 1;

  if v_grant.id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;
  if not v_grant.permission_create_share_links then
    insert into public.credential_access_events (
      grant_id, actor_profile_id, event_type, metadata
    )
    values (
      v_grant.id, v_actor, 'access_denied',
      jsonb_build_object('reason', 'SHARE_NOT_ALLOWED')
    );
    raise exception 'SHARE_NOT_ALLOWED';
  end if;

  v_expires_at := case
    when p_expires_at is null and v_grant.access_expires_at is not null
      then least(v_created_at + interval '7 days', v_grant.access_expires_at)
    else coalesce(p_expires_at, v_created_at + interval '7 days')
  end;
  if v_expires_at <= v_created_at then
    raise exception 'EXPIRY_REQUIRED_IN_FUTURE';
  end if;
  if v_grant.access_expires_at is not null
     and v_expires_at > v_grant.access_expires_at then
    raise exception 'EXPIRY_EXCEEDS_GRANT';
  end if;

  insert into public.credential_share_links (
    grant_id, token_hash, recipient_email, recipient_agency_label,
    expires_at, created_by_profile_id, created_at, updated_at
  )
  values (
    v_grant.id,
    lower(trim(p_token_hash)),
    v_grant.recipient_email,
    v_grant.recipient_agency_label,
    v_expires_at,
    v_actor,
    v_created_at,
    v_created_at
  )
  returning id into v_share_id;

  insert into public.credential_access_events (
    grant_id, share_link_id, actor_profile_id, event_type, metadata
  )
  values (
    v_grant.id,
    v_share_id,
    v_actor,
    'share_created',
    jsonb_build_object('expires_at', v_expires_at, 'source', 'recipient')
  );
  return v_share_id;
end;
$$;

create or replace function public.build_credential_portfolio_payload(
  p_grant_id uuid,
  p_share_link_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'grant_id', g.id,
    'share_link_id', p_share_link_id,
    'owner_profile_id', g.owner_profile_id,
    'owner', jsonb_build_object(
      'displayName', coalesce(
        tm.display_name,
        nullif(concat_ws(' ', tm.first_name, tm.last_name), ''),
        p.display_name
      ),
      'roleTitle', tm.role_title,
      'introduction', tm.short_bio
    ),
    'recipient_email', coalesce(sl.recipient_email, g.recipient_email),
    'recipient_agency_label', coalesce(sl.recipient_agency_label, g.recipient_agency_label),
    'permissions', jsonb_build_object(
      'canViewFiles', g.permission_view_files,
      'canDownloadFiles', g.permission_download_files,
      'canViewDocumentNumbers', g.permission_include_document_number,
      'canViewHistory', g.permission_include_history,
      'canShare', case when p_share_link_id is null then g.permission_create_share_links else false end
    ),
    'access_expires_at', g.access_expires_at,
    'share_expires_at', sl.expires_at,
    'credentials', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'document_type', d.document_type,
          'category', d.category,
          'title', d.title,
          'document_number',
            case
              when g.permission_include_document_number or gd.include_document_number then d.document_number
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
          'language_code', d.language_code,
          'page_count', d.page_count,
          'updated_at', d.updated_at,
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
            case when g.permission_view_files then (
              select coalesce(jsonb_agg(
                jsonb_build_object(
                  'id', f.id,
                  'file_role', f.file_role,
                  'mime_type', f.mime_type,
                  'file_size_bytes', f.file_size_bytes,
                  'original_filename', f.original_filename,
                  'version_number', f.version_number,
                  'is_current', f.is_current,
                  'created_at', f.created_at
                )
                order by f.is_current desc, f.version_number desc
              ), '[]'::jsonb)
              from public.professional_document_files f
              where f.document_id = d.id
                and f.file_role = any (gd.file_roles)
                and (g.permission_include_history or gd.include_history or f.is_current)
            ) else '[]'::jsonb end
        )
        order by d.updated_at desc, d.id
      )
      from public.credential_access_grant_documents gd
      join public.professional_documents d on d.id = gd.document_id
      where gd.grant_id = g.id
    ), '[]'::jsonb)
  )
  from public.credential_access_grants g
  join public.profiles p on p.id = g.owner_profile_id
  left join public.team_members tm
    on tm.profile_id = g.owner_profile_id and tm.is_active = true
  left join public.credential_share_links sl on sl.id = p_share_link_id
  where g.id = p_grant_id
  order by tm.is_featured desc, tm.display_order
  limit 1;
$$;

create or replace function public.get_authenticated_credential_portfolio()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_email text;
  v_now timestamptz := timezone('utc', now());
  v_grant public.credential_access_grants%rowtype;
begin
  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'AUTH_EMAIL_REQUIRED';
  end if;

  select g.* into v_grant
  from public.credential_access_grants g
  where g.recipient_email = v_email
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > v_now)
  order by g.created_at desc
  limit 1;
  if v_grant.id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  update public.credential_access_grants
  set recipient_profile_id = coalesce(recipient_profile_id, auth.uid()),
      last_login_at = v_now
  where id = v_grant.id;

  insert into public.credential_access_events (
    grant_id, actor_profile_id, event_type, metadata
  )
  values (
    v_grant.id, auth.uid(), 'portfolio_viewed',
    jsonb_build_object('source', 'authenticated_portal')
  );

  return public.build_credential_portfolio_payload(v_grant.id, null);
end;
$$;

create or replace function public.get_shared_credential_portfolio(p_token text)
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
begin
  v_hash := encode(extensions.digest(trim(coalesce(p_token, '')), 'sha256'), 'hex');
  if v_hash is null or v_hash = '' then
    raise exception 'TOKEN_REQUIRED';
  end if;

  select sl.* into v_share
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

  select g.* into v_grant
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
    grant_id, share_link_id, event_type, metadata
  )
  values (
    v_grant.id, v_share.id, 'portfolio_viewed',
    jsonb_build_object('source', 'shared_link')
  );

  return public.build_credential_portfolio_payload(v_grant.id, v_share.id);
end;
$$;

create or replace function public.record_authenticated_credential_detail_view(
  p_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_grant_id uuid;
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
begin
  if auth.uid() is null or v_email = '' then
    raise exception 'AUTH_REQUIRED';
  end if;

  select g.id into v_grant_id
  from public.credential_access_grants g
  join public.credential_access_grant_documents gd on gd.grant_id = g.id
  where g.recipient_email = v_email
    and gd.document_id = p_document_id
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > timezone('utc', now()))
  order by g.created_at desc
  limit 1;
  if v_grant_id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  insert into public.credential_access_events (
    grant_id, document_id, actor_profile_id, event_type, metadata
  )
  values (
    v_grant_id, p_document_id, auth.uid(), 'credential_detail_viewed',
    jsonb_build_object('source', 'authenticated_portal')
  );
end;
$$;

create or replace function public.record_shared_credential_detail_view(
  p_token text,
  p_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_share public.credential_share_links%rowtype;
  v_hash text := encode(extensions.digest(trim(coalesce(p_token, '')), 'sha256'), 'hex');
begin
  select sl.* into v_share
  from public.credential_share_links sl
  join public.credential_access_grants g on g.id = sl.grant_id
  join public.credential_access_grant_documents gd on gd.grant_id = g.id
  where sl.token_hash = v_hash
    and gd.document_id = p_document_id
    and sl.revoked_at is null
    and sl.expires_at > timezone('utc', now())
    and g.revoked_at is null
    and (g.access_expires_at is null or g.access_expires_at > timezone('utc', now()))
  limit 1;
  if v_share.id is null then
    raise exception 'SHARE_NOT_FOUND';
  end if;

  insert into public.credential_access_events (
    grant_id, share_link_id, document_id, event_type, metadata
  )
  values (
    v_share.grant_id, v_share.id, p_document_id, 'credential_detail_viewed',
    jsonb_build_object('source', 'shared_link')
  );
end;
$$;

revoke all on function public.build_credential_portfolio_payload(uuid, uuid)
from public, anon, authenticated;

revoke all on function public.create_credential_access_grant(
  text, text, uuid[], text[], timestamptz, boolean, boolean, boolean, boolean, boolean, text
)
from public, anon;
grant execute on function public.create_credential_access_grant(
  text, text, uuid[], text[], timestamptz, boolean, boolean, boolean, boolean, boolean, text
)
to authenticated;

revoke all on function public.create_recipient_credential_share_link(text, timestamptz)
from public, anon;
grant execute on function public.create_recipient_credential_share_link(text, timestamptz)
to authenticated;

revoke all on function public.record_authenticated_credential_detail_view(uuid)
from public, anon;
grant execute on function public.record_authenticated_credential_detail_view(uuid)
to authenticated;

revoke all on function public.record_shared_credential_detail_view(text, uuid)
from public;
grant execute on function public.record_shared_credential_detail_view(text, uuid)
to anon, authenticated;

revoke all on function public.get_authenticated_credential_file_access(uuid, text)
from public, anon;
grant execute on function public.get_authenticated_credential_file_access(uuid, text)
to authenticated;
