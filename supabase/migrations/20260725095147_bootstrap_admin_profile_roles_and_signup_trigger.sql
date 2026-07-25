-- Auto-create public.profiles when a new auth user is created.
create or replace function private.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth, pg_catalog
as $$
begin
  insert into public.profiles (id, email, display_name, preferred_locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'preferred_locale', ''), 'en')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function private.handle_auth_user_created() from public;
revoke all on function private.handle_auth_user_created() from anon;
revoke all on function private.handle_auth_user_created() from authenticated;
grant execute on function private.handle_auth_user_created() to postgres, service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_auth_user_created();

-- Backfill profile + founding super_administrator for the existing operator account.
insert into public.profiles (id, email, display_name, preferred_locale)
select
  u.id,
  u.email,
  split_part(coalesce(u.email, 'admin'), '@', 1),
  'en'
from auth.users u
where lower(u.email) = lower('hello@mymindventures.io')
on conflict (id) do update
  set email = excluded.email,
      updated_at = timezone('utc', now());

insert into public.user_roles (profile_id, role, granted_by)
select p.id, 'super_administrator'::public.app_role, p.id
from public.profiles p
where lower(p.email) = lower('hello@mymindventures.io')
on conflict (profile_id, role) do nothing;
