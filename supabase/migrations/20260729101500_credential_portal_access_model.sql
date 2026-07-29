create table public.credential_access_grants (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  recipient_profile_id uuid references public.profiles (id) on delete set null,
  recipient_email text not null,
  recipient_agency_label text,
  permission_view_files boolean not null default false,
  permission_download_files boolean not null default false,
  permission_include_history boolean not null default false,
  permission_include_document_number boolean not null default false,
  access_expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by_profile_id uuid references public.profiles (id) on delete set null,
  created_by_profile_id uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  last_magic_link_sent_at timestamptz,
  last_login_at timestamptz,
  message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint credential_access_grants_recipient_email_normalized_check
    check (recipient_email = lower(trim(recipient_email))),
  constraint credential_access_grants_expiry_order_check
    check (access_expires_at is null or access_expires_at > created_at),
  constraint credential_access_grants_revoked_order_check
    check (revoked_at is null or revoked_at >= created_at),
  constraint credential_access_grants_download_requires_view_check
    check (not permission_download_files or permission_view_files)
);

create index credential_access_grants_owner_idx
  on public.credential_access_grants (owner_profile_id, created_at desc);

create index credential_access_grants_recipient_email_idx
  on public.credential_access_grants (recipient_email, created_at desc);

create index credential_access_grants_active_lookup_idx
  on public.credential_access_grants (recipient_email, access_expires_at, revoked_at);

create trigger set_credential_access_grants_updated_at
before update on public.credential_access_grants
for each row execute function public.set_updated_at();

create table public.credential_access_grant_documents (
  grant_id uuid not null references public.credential_access_grants (id) on delete cascade,
  document_id uuid not null references public.professional_documents (id) on delete cascade,
  file_roles text[] not null default '{primary}',
  include_history boolean not null default false,
  include_document_number boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (grant_id, document_id),
  constraint credential_access_grant_documents_file_roles_non_empty_check
    check (array_length(file_roles, 1) is not null),
  constraint credential_access_grant_documents_file_roles_allowed_check
    check (
      file_roles <@ array[
        'primary',
        'front',
        'back',
        'translation',
        'attachment',
        'supporting_evidence'
      ]::text[]
    )
);

create index credential_access_grant_documents_document_idx
  on public.credential_access_grant_documents (document_id);

create table public.credential_share_links (
  id uuid primary key default extensions.gen_random_uuid(),
  grant_id uuid not null references public.credential_access_grants (id) on delete cascade,
  token_hash text not null unique,
  recipient_email text,
  recipient_agency_label text,
  expires_at timestamptz not null,
  max_views integer,
  max_downloads integer,
  view_count integer not null default 0,
  download_count integer not null default 0,
  revoked_at timestamptz,
  revoked_by_profile_id uuid references public.profiles (id) on delete set null,
  created_by_profile_id uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint credential_share_links_token_hash_check
    check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint credential_share_links_email_normalized_check
    check (recipient_email is null or recipient_email = lower(trim(recipient_email))),
  constraint credential_share_links_expiry_check
    check (expires_at > created_at),
  constraint credential_share_links_max_views_check
    check (max_views is null or max_views > 0),
  constraint credential_share_links_max_downloads_check
    check (max_downloads is null or max_downloads > 0),
  constraint credential_share_links_view_count_check
    check (view_count >= 0),
  constraint credential_share_links_download_count_check
    check (download_count >= 0),
  constraint credential_share_links_revoked_order_check
    check (revoked_at is null or revoked_at >= created_at)
);

create index credential_share_links_grant_idx
  on public.credential_share_links (grant_id, created_at desc);

create index credential_share_links_active_lookup_idx
  on public.credential_share_links (token_hash, expires_at, revoked_at);

create trigger set_credential_share_links_updated_at
before update on public.credential_share_links
for each row execute function public.set_updated_at();

create table public.credential_access_events (
  id uuid primary key default extensions.gen_random_uuid(),
  grant_id uuid references public.credential_access_grants (id) on delete set null,
  share_link_id uuid references public.credential_share_links (id) on delete set null,
  document_id uuid references public.professional_documents (id) on delete set null,
  document_file_id uuid references public.professional_document_files (id) on delete set null,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint credential_access_events_event_type_check
    check (event_type in (
      'invitation_sent',
      'magic_link_login_completed',
      'portfolio_viewed',
      'credential_detail_viewed',
      'file_opened',
      'file_downloaded',
      'share_created',
      'share_revoked',
      'grant_revoked',
      'access_denied'
    )),
  constraint credential_access_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index credential_access_events_grant_idx
  on public.credential_access_events (grant_id, created_at desc);

create index credential_access_events_share_idx
  on public.credential_access_events (share_link_id, created_at desc);

create index credential_access_events_event_type_idx
  on public.credential_access_events (event_type, created_at desc);

alter table public.credential_access_grants enable row level security;
alter table public.credential_access_grant_documents enable row level security;
alter table public.credential_share_links enable row level security;
alter table public.credential_access_events enable row level security;

create policy "credential_access_grants_browser_denied"
on public.credential_access_grants
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "credential_access_grant_documents_browser_denied"
on public.credential_access_grant_documents
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "credential_share_links_browser_denied"
on public.credential_share_links
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "credential_access_events_browser_denied"
on public.credential_access_events
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

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
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_document_ids is null or array_length(p_document_ids, 1) is null then
    raise exception 'DOCUMENTS_REQUIRED';
  end if;

  v_recipient_email := lower(trim(p_recipient_email));
  if v_recipient_email = '' then
    raise exception 'RECIPIENT_EMAIL_REQUIRED';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;

  select min(d.profile_id)
  into v_owner_profile_id
  from public.professional_documents d
  where d.id = any (p_document_ids);

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
    access_expires_at,
    message,
    created_by_profile_id
  )
  values (
    v_owner_profile_id,
    v_recipient_email,
    nullif(trim(p_recipient_agency_label), ''),
    p_permission_view_files,
    p_permission_download_files,
    p_permission_include_history,
    p_permission_include_document_number,
    p_access_expires_at,
    nullif(trim(p_message), ''),
    v_actor
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
      'document_count', array_length(p_document_ids, 1)
    )
  );

  return v_grant_id;
end;
$$;

create or replace function public.revoke_credential_access_grant(
  p_grant_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_is_admin boolean;
  v_owner_profile_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select owner_profile_id
  into v_owner_profile_id
  from public.credential_access_grants
  where id = p_grant_id;

  if v_owner_profile_id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;

  if not v_actor_is_admin and v_owner_profile_id <> v_actor then
    raise exception 'FORBIDDEN';
  end if;

  update public.credential_access_grants
  set revoked_at = timezone('utc', now()),
      revoked_by_profile_id = v_actor
  where id = p_grant_id
    and revoked_at is null;

  update public.credential_share_links
  set revoked_at = timezone('utc', now()),
      revoked_by_profile_id = v_actor
  where grant_id = p_grant_id
    and revoked_at is null;

  insert into public.credential_access_events (
    grant_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    p_grant_id,
    v_actor,
    'grant_revoked',
    case
      when p_reason is null or trim(p_reason) = '' then '{}'::jsonb
      else jsonb_build_object('reason', trim(p_reason))
    end
  );
end;
$$;

create or replace function public.create_credential_share_link(
  p_grant_id uuid,
  p_token_hash text,
  p_expires_at timestamptz,
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
  v_owner_profile_id uuid;
  v_share_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select owner_profile_id
  into v_owner_profile_id
  from public.credential_access_grants
  where id = p_grant_id
    and revoked_at is null
    and (access_expires_at is null or access_expires_at > timezone('utc', now()));

  if v_owner_profile_id is null then
    raise exception 'GRANT_NOT_ACTIVE';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;

  if not v_actor_is_admin and v_owner_profile_id <> v_actor then
    raise exception 'FORBIDDEN';
  end if;

  insert into public.credential_share_links (
    grant_id,
    token_hash,
    recipient_email,
    recipient_agency_label,
    expires_at,
    max_views,
    max_downloads,
    created_by_profile_id
  )
  values (
    p_grant_id,
    lower(trim(p_token_hash)),
    case
      when p_recipient_email is null or trim(p_recipient_email) = '' then null
      else lower(trim(p_recipient_email))
    end,
    nullif(trim(p_recipient_agency_label), ''),
    p_expires_at,
    p_max_views,
    p_max_downloads,
    v_actor
  )
  returning id into v_share_id;

  insert into public.credential_access_events (
    grant_id,
    share_link_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    p_grant_id,
    v_share_id,
    v_actor,
    'share_created',
    jsonb_build_object('expires_at', p_expires_at)
  );

  return v_share_id;
end;
$$;

create or replace function public.mark_credential_magic_link_sent(
  p_grant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_is_admin boolean;
  v_owner_profile_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select owner_profile_id
  into v_owner_profile_id
  from public.credential_access_grants
  where id = p_grant_id;

  if v_owner_profile_id is null then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = v_actor
      and ur.role in ('administrator', 'super_administrator', 'content_manager')
  ) into v_actor_is_admin;

  if not v_actor_is_admin and v_owner_profile_id <> v_actor then
    raise exception 'FORBIDDEN';
  end if;

  update public.credential_access_grants
  set last_magic_link_sent_at = timezone('utc', now())
  where id = p_grant_id;

  insert into public.credential_access_events (
    grant_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    p_grant_id,
    v_actor,
    'invitation_sent',
    jsonb_build_object('channel', 'supabase_magic_link')
  );
end;
$$;

create or replace function public.list_owner_credential_access_grants()
returns setof public.credential_access_grants
language sql
security definer
set search_path = public, pg_catalog
as $$
  select g.*
  from public.credential_access_grants g
  where g.owner_profile_id = auth.uid()
     or exists (
       select 1
       from public.user_roles ur
       where ur.profile_id = auth.uid()
         and ur.role in ('administrator', 'super_administrator', 'content_manager')
     )
  order by g.created_at desc;
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
  v_payload jsonb;
begin
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

  update public.credential_access_grants
  set recipient_profile_id = coalesce(recipient_profile_id, auth.uid()),
      last_login_at = v_now
  where id = v_grant.id;

  insert into public.credential_access_events (
    grant_id,
    actor_profile_id,
    event_type,
    metadata
  )
  values (
    v_grant.id,
    auth.uid(),
    'portfolio_viewed',
    jsonb_build_object('source', 'authenticated_portal')
  );

  select jsonb_build_object(
    'grant_id', v_grant.id,
    'owner_profile_id', v_grant.owner_profile_id,
    'recipient_email', v_grant.recipient_email,
    'recipient_agency_label', v_grant.recipient_agency_label,
    'permissions', jsonb_build_object(
      'canViewFiles', v_grant.permission_view_files,
      'canDownloadFiles', v_grant.permission_download_files,
      'canViewDocumentNumbers', v_grant.permission_include_document_number,
      'canViewHistory', v_grant.permission_include_history
    ),
    'access_expires_at', v_grant.access_expires_at,
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
  ) into v_payload;

  return v_payload;
end;
$$;

revoke all on function public.create_credential_access_grant(
  text, text, uuid[], text[], timestamptz, boolean, boolean, boolean, boolean, text
) from public, anon;
grant execute on function public.create_credential_access_grant(
  text, text, uuid[], text[], timestamptz, boolean, boolean, boolean, boolean, text
) to authenticated;

revoke all on function public.revoke_credential_access_grant(uuid, text)
from public, anon;
grant execute on function public.revoke_credential_access_grant(uuid, text)
to authenticated;

revoke all on function public.create_credential_share_link(
  uuid, text, timestamptz, text, text, integer, integer
) from public, anon;
grant execute on function public.create_credential_share_link(
  uuid, text, timestamptz, text, text, integer, integer
) to authenticated;

revoke all on function public.get_authenticated_credential_portfolio()
from public, anon;
grant execute on function public.get_authenticated_credential_portfolio()
to authenticated;

revoke all on function public.mark_credential_magic_link_sent(uuid)
from public, anon;
grant execute on function public.mark_credential_magic_link_sent(uuid)
to authenticated;

revoke all on function public.list_owner_credential_access_grants()
from public, anon;
grant execute on function public.list_owner_credential_access_grants()
to authenticated;