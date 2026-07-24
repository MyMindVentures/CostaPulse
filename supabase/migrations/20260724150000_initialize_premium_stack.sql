create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum (
  'customer',
  'experience_provider',
  'team_member',
  'partner',
  'operations_staff',
  'customer_support',
  'finance_manager',
  'content_manager',
  'administrator',
  'super_administrator'
);

create type public.publication_status as enum ('draft', 'published', 'archived');

create type public.variant_pricing_model as enum ('per_person', 'per_group');

create type public.availability_status as enum (
  'scheduled',
  'sold_out',
  'unavailable',
  'cancelled',
  'completed'
);

create type public.booking_status as enum (
  'draft',
  'pending_payment',
  'payment_processing',
  'confirmed',
  'pending_manual_confirmation',
  'cancelled',
  'completed',
  'refunded',
  'partially_refunded',
  'no_show'
);

create type public.payment_status as enum (
  'unpaid',
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
  'partially_refunded'
);

create type public.partner_status as enum ('draft', 'active', 'disabled');

create type public.referral_status as enum ('active', 'locked', 'expired', 'cancelled');

create type public.voucher_status as enum ('issued', 'redeemed', 'expired', 'cancelled');

create or replace function public.generate_public_code(prefix text default 'CP')
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  normalized_prefix text := upper(coalesce(nullif(trim(prefix), ''), 'CP'));
begin
  return normalized_prefix || '-' || upper(encode(extensions.gen_random_bytes(6), 'hex'));
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  phone text,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_preferred_locale_check
    check (preferred_locale ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

create table public.user_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default timezone('utc', now()),
  granted_by uuid references public.profiles (id) on delete set null,
  primary key (profile_id, role)
);

create table public.experiences (
  id uuid primary key default extensions.gen_random_uuid(),
  provider_profile_id uuid references public.profiles (id) on delete set null,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  location_name text,
  timezone text not null default 'Europe/Madrid',
  status public.publication_status not null default 'draft',
  hero_image_path text,
  duration_minutes integer not null,
  base_capacity integer not null,
  base_currency char(3) not null,
  manual_confirmation_required boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint experiences_duration_minutes_check check (duration_minutes > 0),
  constraint experiences_base_capacity_check check (base_capacity > 0),
  constraint experiences_base_currency_check check (base_currency = upper(base_currency))
);

create table public.experience_variants (
  id uuid primary key default extensions.gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  pricing_model public.variant_pricing_model not null default 'per_person',
  unit_amount_minor integer not null,
  currency char(3) not null,
  min_party_size integer not null default 1,
  max_party_size integer,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (experience_id, slug),
  unique (id, experience_id),
  constraint experience_variants_unit_amount_minor_check check (unit_amount_minor >= 0),
  constraint experience_variants_currency_check check (currency = upper(currency)),
  constraint experience_variants_min_party_size_check check (min_party_size > 0),
  constraint experience_variants_max_party_size_check
    check (max_party_size is null or max_party_size >= min_party_size)
);

create table public.availability_slots (
  id uuid primary key default extensions.gen_random_uuid(),
  experience_id uuid not null,
  experience_variant_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Madrid',
  capacity_total integer not null,
  capacity_reserved integer not null default 0,
  status public.availability_status not null default 'scheduled',
  held_until timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, experience_variant_id),
  unique (experience_variant_id, starts_at),
  constraint availability_slots_experience_variant_fk
    foreign key (experience_variant_id, experience_id)
    references public.experience_variants (id, experience_id)
    on delete cascade,
  constraint availability_slots_time_window_check check (ends_at > starts_at),
  constraint availability_slots_capacity_total_check check (capacity_total > 0),
  constraint availability_slots_capacity_reserved_check
    check (capacity_reserved >= 0 and capacity_reserved <= capacity_total)
);

create table public.partners (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_profile_id uuid references public.profiles (id) on delete set null,
  slug text not null unique,
  name text not null,
  referral_code text not null unique default public.generate_public_code('REF'),
  status public.partner_status not null default 'draft',
  attribution_window_hours integer not null default 720,
  voucher_percent_basis_points integer not null default 1000,
  website_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint partners_attribution_window_hours_check check (attribution_window_hours > 0),
  constraint partners_voucher_percent_basis_points_check
    check (voucher_percent_basis_points between 0 and 10000)
);

create table public.referrals (
  id uuid primary key default extensions.gen_random_uuid(),
  partner_id uuid not null references public.partners (id) on delete cascade,
  code text not null unique default public.generate_public_code('REF'),
  landing_path text,
  visitor_token text,
  status public.referral_status not null default 'active',
  attributed_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  locked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint referrals_expiry_check check (expires_at is null or expires_at > attributed_at),
  constraint referrals_lock_check check (locked_at is null or locked_at >= attributed_at)
);

create table public.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  booking_reference text not null unique default public.generate_public_code('BKG'),
  customer_profile_id uuid references public.profiles (id) on delete set null,
  customer_email text not null,
  experience_id uuid not null references public.experiences (id) on delete restrict,
  experience_variant_id uuid not null,
  availability_slot_id uuid,
  partner_id uuid references public.partners (id) on delete set null,
  referral_id uuid references public.referrals (id) on delete set null,
  status public.booking_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  currency char(3) not null,
  unit_amount_minor integer not null,
  subtotal_amount_minor integer not null,
  total_amount_minor integer not null,
  voucher_amount_minor integer not null default 0,
  party_size integer not null,
  participant_notes text,
  booked_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_experience_variant_fk
    foreign key (experience_variant_id, experience_id)
    references public.experience_variants (id, experience_id)
    on delete restrict,
  constraint bookings_availability_slot_fk
    foreign key (availability_slot_id, experience_variant_id)
    references public.availability_slots (id, experience_variant_id)
    on delete set null,
  constraint bookings_currency_check check (currency = upper(currency)),
  constraint bookings_unit_amount_minor_check check (unit_amount_minor >= 0),
  constraint bookings_subtotal_amount_minor_check check (subtotal_amount_minor >= 0),
  constraint bookings_total_amount_minor_check check (total_amount_minor >= 0),
  constraint bookings_voucher_amount_minor_check check (voucher_amount_minor >= 0),
  constraint bookings_party_size_check check (party_size > 0),
  constraint bookings_total_rollup_check
    check (total_amount_minor = subtotal_amount_minor - voucher_amount_minor)
);

create table public.vouchers (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique default public.generate_public_code('VCH'),
  partner_id uuid not null references public.partners (id) on delete restrict,
  booking_id uuid not null unique references public.bookings (id) on delete restrict,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  customer_email text not null,
  qualifying_amount_minor integer not null,
  voucher_amount_minor integer not null,
  currency char(3) not null,
  status public.voucher_status not null default 'issued',
  issued_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redemption_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vouchers_qualifying_amount_minor_check check (qualifying_amount_minor >= 0),
  constraint vouchers_voucher_amount_minor_check check (voucher_amount_minor >= 0),
  constraint vouchers_currency_check check (currency = upper(currency)),
  constraint vouchers_expiry_check check (expires_at is null or expires_at > issued_at),
  constraint vouchers_redeemed_at_check check (redeemed_at is null or redeemed_at >= issued_at)
);

create table public.payment_events (
  id uuid primary key default extensions.gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  stripe_event_id text not null unique,
  stripe_event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.app_healthchecks (
  name text primary key,
  description text not null,
  last_verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.app_healthchecks (name, description)
values ('supabase', 'Dependency probe for Supabase-backed operator readiness checks')
on conflict (name) do nothing;

create index profiles_email_idx on public.profiles (lower(email)) where email is not null;
create index user_roles_role_idx on public.user_roles (role);
create index experiences_status_idx on public.experiences (status);
create index experiences_provider_profile_id_idx on public.experiences (provider_profile_id);
create index experience_variants_experience_id_idx on public.experience_variants (experience_id);
create index availability_slots_experience_variant_id_idx
  on public.availability_slots (experience_variant_id, starts_at);
create index availability_slots_status_idx on public.availability_slots (status);
create index partners_owner_profile_id_idx on public.partners (owner_profile_id);
create index partners_status_idx on public.partners (status);
create index referrals_partner_id_idx on public.referrals (partner_id);
create index referrals_visitor_token_idx on public.referrals (visitor_token)
  where visitor_token is not null;
create index bookings_customer_profile_id_idx on public.bookings (customer_profile_id);
create index bookings_partner_id_idx on public.bookings (partner_id);
create index bookings_referral_id_idx on public.bookings (referral_id);
create index bookings_status_idx on public.bookings (status, payment_status);
create index bookings_availability_slot_id_idx on public.bookings (availability_slot_id);
create index bookings_experience_id_idx on public.bookings (experience_id);
create index vouchers_partner_id_idx on public.vouchers (partner_id);
create index vouchers_status_idx on public.vouchers (status);
create index payment_events_booking_id_idx on public.payment_events (booking_id);
create index payment_events_processed_at_idx on public.payment_events (processed_at);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_experiences_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

create trigger set_experience_variants_updated_at
before update on public.experience_variants
for each row execute function public.set_updated_at();

create trigger set_availability_slots_updated_at
before update on public.availability_slots
for each row execute function public.set_updated_at();

create trigger set_partners_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

create trigger set_referrals_updated_at
before update on public.referrals
for each row execute function public.set_updated_at();

create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create trigger set_vouchers_updated_at
before update on public.vouchers
for each row execute function public.set_updated_at();

create or replace function public.has_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where profile_id = auth.uid()
      and role = any(required_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_variants enable row level security;
alter table public.availability_slots enable row level security;
alter table public.partners enable row level security;
alter table public.referrals enable row level security;
alter table public.bookings enable row level security;
alter table public.vouchers enable row level security;
alter table public.payment_events enable row level security;
alter table public.app_healthchecks enable row level security;

create policy "profiles_self_or_admin_select"
on public.profiles
for select
using (
  id = auth.uid()
  or public.has_role(
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

create policy "profiles_self_insert"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_self_or_admin_update"
on public.profiles
for update
using (
  id = auth.uid()
  or public.has_role(
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
  or public.has_role(
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
  or public.has_role(
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
  or public.has_role(
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
        or public.has_role(
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
        or public.has_role(
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
  or public.has_role(
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
  or public.has_role(
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
  or public.has_role(
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
  or public.has_role(
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
  public.has_role(
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
  public.has_role(
    array[
      'operations_staff'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);
