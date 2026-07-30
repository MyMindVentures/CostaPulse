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

  select g.*
  into v_grant
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
      grant_id,
      actor_profile_id,
      event_type,
      metadata
    )
    values (
      v_grant.id,
      v_actor,
      'access_denied',
      jsonb_build_object('reason', 'SHARE_NOT_ALLOWED')
    );
    return null;
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
    grant_id,
    token_hash,
    recipient_email,
    recipient_agency_label,
    expires_at,
    created_by_profile_id,
    created_at,
    updated_at
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
    grant_id,
    share_link_id,
    actor_profile_id,
    event_type,
    metadata
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

revoke all on function public.create_recipient_credential_share_link(
  text,
  timestamptz
)
from public, anon;

grant execute on function public.create_recipient_credential_share_link(
  text,
  timestamptz
)
to authenticated;
