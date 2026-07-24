create schema if not exists private;

create or replace function private.has_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.user_roles
    where profile_id = auth.uid()
      and role = any(required_roles)
  );
$$;

revoke all on function private.has_role(public.app_role[]) from public;
revoke all on function private.has_role(public.app_role[]) from anon;
revoke all on function private.has_role(public.app_role[]) from authenticated;

drop policy "profiles_self_or_admin_select" on public.profiles;
drop policy "profiles_self_or_admin_update" on public.profiles;
drop policy "user_roles_self_or_admin_select" on public.user_roles;
drop policy "experiences_public_or_privileged_select" on public.experiences;
drop policy "experience_variants_public_or_privileged_select" on public.experience_variants;
drop policy "availability_slots_public_or_privileged_select" on public.availability_slots;
drop policy "partners_owner_or_admin_select" on public.partners;
drop policy "referrals_partner_or_admin_select" on public.referrals;
drop policy "bookings_customer_provider_or_admin_select" on public.bookings;
drop policy "vouchers_partner_customer_or_admin_select" on public.vouchers;
drop policy "payment_events_admin_select" on public.payment_events;
drop policy "app_healthchecks_admin_select" on public.app_healthchecks;

create policy "profiles_self_or_admin_select"
on public.profiles
for select
using (
  id = auth.uid()
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "profiles_self_or_admin_update"
on public.profiles
for update
using (
  id = auth.uid()
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
)
with check (
  id = auth.uid()
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "user_roles_self_or_admin_select"
on public.user_roles
for select
using (
  profile_id = auth.uid()
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "experiences_public_or_privileged_select"
on public.experiences
for select
using (
  status = 'published'
  or provider_profile_id = auth.uid()
  or private.has_role(
    array[
      'experience_provider'::public.app_role,
      'operations_staff'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "experience_variants_public_or_privileged_select"
on public.experience_variants
for select
using (
  exists (
    select 1
    from public.experiences
    where experiences.id = experience_variants.experience_id
      and (
        experiences.status = 'published'
        or experiences.provider_profile_id = auth.uid()
        or private.has_role(
          array[
            'experience_provider'::public.app_role,
            'operations_staff'::public.app_role,
            'content_manager'::public.app_role,
            'administrator'::public.app_role,
            'super_administrator'::public.app_role
          ]
        )
      )
  )
);

create policy "availability_slots_public_or_privileged_select"
on public.availability_slots
for select
using (
  exists (
    select 1
    from public.experiences
    where experiences.id = availability_slots.experience_id
      and (
        experiences.status = 'published'
        or experiences.provider_profile_id = auth.uid()
        or private.has_role(
          array[
            'experience_provider'::public.app_role,
            'operations_staff'::public.app_role,
            'content_manager'::public.app_role,
            'administrator'::public.app_role,
            'super_administrator'::public.app_role
          ]
        )
      )
  )
);

create policy "partners_owner_or_admin_select"
on public.partners
for select
using (
  owner_profile_id = auth.uid()
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "referrals_partner_or_admin_select"
on public.referrals
for select
using (
  exists (
    select 1
    from public.partners
    where partners.id = referrals.partner_id
      and partners.owner_profile_id = auth.uid()
  )
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "bookings_customer_provider_or_admin_select"
on public.bookings
for select
using (
  customer_profile_id = auth.uid()
  or exists (
    select 1
    from public.experiences
    where experiences.id = bookings.experience_id
      and experiences.provider_profile_id = auth.uid()
  )
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "vouchers_partner_customer_or_admin_select"
on public.vouchers
for select
using (
  customer_profile_id = auth.uid()
  or exists (
    select 1
    from public.partners
    where partners.id = vouchers.partner_id
      and partners.owner_profile_id = auth.uid()
  )
  or private.has_role(
    array[
      'operations_staff'::public.app_role,
      'customer_support'::public.app_role,
      'finance_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "payment_events_admin_select"
on public.payment_events
for select
using (
  private.has_role(
    array[
      'finance_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

create policy "app_healthchecks_admin_select"
on public.app_healthchecks
for select
using (
  private.has_role(
    array[
      'operations_staff'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

drop function public.has_role(public.app_role[]);
