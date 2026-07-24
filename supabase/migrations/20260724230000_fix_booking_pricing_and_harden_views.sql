-- Fix per_person pricing in create_experience_booking and allow service_role callers
-- on participant/hold RPCs. Harden booking_detail against public Data API reads.

CREATE OR REPLACE FUNCTION public.create_experience_booking(
  p_availability_slot_id uuid,
  p_party_size integer,
  p_customer_email text,
  p_contact_first_name text,
  p_contact_last_name text,
  p_customer_phone text DEFAULT NULL,
  p_preferred_language text DEFAULT 'en',
  p_special_requests text DEFAULT NULL,
  p_terms_accepted boolean DEFAULT false,
  p_idempotency_key uuid DEFAULT NULL,
  p_anonymous_session_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_slot public.availability_slots%rowtype;
  v_variant public.experience_variants%rowtype;
  v_experience public.experiences%rowtype;
  v_location public.locations%rowtype;
  v_booking public.bookings%rowtype;
  v_reserved integer;
  v_customer_id uuid;
  v_expires_at timestamptz;
  v_unit_amount integer;
  v_subtotal_amount integer;
  v_line_quantity integer;
begin
  if p_party_size is null or p_party_size <= 0 then raise exception 'INVALID_PARTY_SIZE'; end if;
  if nullif(trim(p_customer_email), '') is null then raise exception 'CUSTOMER_EMAIL_REQUIRED'; end if;
  if not p_terms_accepted then raise exception 'TERMS_NOT_ACCEPTED'; end if;

  if p_idempotency_key is not null then
    select * into v_booking from public.bookings where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object(
        'booking_id', v_booking.id,
        'booking_reference', v_booking.booking_reference,
        'status', v_booking.status,
        'payment_status', v_booking.payment_status,
        'total_amount_minor', v_booking.total_amount_minor,
        'currency', trim(v_booking.currency),
        'expires_at', v_booking.expires_at,
        'idempotent_replay', true
      );
    end if;
  end if;

  select * into v_slot from public.availability_slots where id = p_availability_slot_id for update;
  if not found then raise exception 'SLOT_NOT_FOUND'; end if;
  if v_slot.status <> 'scheduled' then raise exception 'SLOT_NOT_BOOKABLE'; end if;
  if v_slot.starts_at <= timezone('utc', now()) then raise exception 'SLOT_ALREADY_STARTED'; end if;
  if v_slot.booking_cutoff_at is not null and v_slot.booking_cutoff_at <= timezone('utc', now()) then
    raise exception 'BOOKING_CUTOFF_PASSED';
  end if;

  select * into v_variant from public.experience_variants where id = v_slot.experience_variant_id and is_active = true;
  if not found then raise exception 'VARIANT_NOT_FOUND'; end if;
  select * into v_experience from public.experiences where id = v_slot.experience_id and status = 'published';
  if not found then raise exception 'EXPERIENCE_NOT_AVAILABLE'; end if;
  if p_party_size < v_variant.min_party_size
     or (v_variant.max_party_size is not null and p_party_size > v_variant.max_party_size) then
    raise exception 'PARTY_SIZE_OUT_OF_RANGE';
  end if;

  v_reserved := public.booking_reserved_capacity(v_slot.id);
  if v_reserved + p_party_size > v_slot.capacity_total then raise exception 'INSUFFICIENT_CAPACITY'; end if;
  if v_slot.location_id is not null then
    select * into v_location from public.locations where id = v_slot.location_id;
  end if;

  v_unit_amount := v_variant.unit_amount_minor;
  if v_variant.pricing_model = 'per_group' then
    v_subtotal_amount := v_unit_amount;
    v_line_quantity := 1;
  else
    v_subtotal_amount := v_unit_amount * p_party_size;
    v_line_quantity := p_party_size;
  end if;

  select id into v_customer_id
  from public.customers
  where lower(email) = lower(trim(p_customer_email))
  order by created_at asc
  limit 1;

  v_expires_at := timezone('utc', now()) + interval '20 minutes';

  insert into public.bookings (
    customer_profile_id, customer_id, customer_email, contact_first_name, contact_last_name,
    customer_phone, preferred_language, experience_id, experience_variant_id,
    availability_slot_id, location_id, status, payment_status, currency,
    unit_amount_minor, subtotal_amount_minor, total_amount_minor, voucher_amount_minor,
    party_size, participant_notes, special_requests, starts_at_snapshot, ends_at_snapshot,
    timezone_snapshot, experience_title_snapshot, variant_name_snapshot, location_name_snapshot,
    terms_accepted_at, pricing_snapshot, cancellation_policy_snapshot, idempotency_key,
    expires_at, source_channel, booked_at
  ) values (
    (select auth.uid()), v_customer_id, lower(trim(p_customer_email)), trim(p_contact_first_name), trim(p_contact_last_name),
    nullif(trim(p_customer_phone), ''), p_preferred_language, v_experience.id, v_variant.id,
    v_slot.id, v_slot.location_id, 'pending_payment', 'unpaid', v_variant.currency,
    v_unit_amount, v_subtotal_amount, v_subtotal_amount, 0,
    p_party_size, p_special_requests, p_special_requests, v_slot.starts_at, v_slot.ends_at,
    v_slot.timezone, v_experience.title, v_variant.name, coalesce(v_location.name, v_experience.location_name),
    timezone('utc', now()),
    jsonb_build_object(
      'pricing_model', v_variant.pricing_model,
      'unit_amount_minor', v_unit_amount,
      'party_size', p_party_size,
      'subtotal_amount_minor', v_subtotal_amount
    ),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'type', policy_type,
        'title', title,
        'description', description,
        'value_minutes', value_minutes
      ) order by display_order)
      from public.experience_policies
      where experience_id = v_experience.id and is_active = true and policy_type = 'cancellation'
    ), '[]'::jsonb),
    p_idempotency_key, v_expires_at, 'web', timezone('utc', now())
  ) returning * into v_booking;

  insert into public.booking_price_lines(
    booking_id, line_type, reference_id, label, quantity, unit_amount_minor, currency, metadata
  ) values (
    v_booking.id, 'base', v_variant.id, v_variant.name, v_line_quantity, v_unit_amount, v_variant.currency,
    jsonb_build_object('pricing_model', v_variant.pricing_model, 'party_size', p_party_size)
  );

  insert into public.booking_holds(
    availability_slot_id, booking_id, party_size, customer_profile_id, anonymous_session_id, expires_at
  ) values (
    v_slot.id, v_booking.id, p_party_size, (select auth.uid()), p_anonymous_session_id, v_expires_at
  );

  insert into public.booking_status_history(booking_id, previous_status, new_status, reason)
  values (v_booking.id, null, v_booking.status, 'Booking created');

  return jsonb_build_object(
    'booking_id', v_booking.id,
    'booking_reference', v_booking.booking_reference,
    'status', v_booking.status,
    'payment_status', v_booking.payment_status,
    'total_amount_minor', v_booking.total_amount_minor,
    'currency', trim(v_booking.currency),
    'expires_at', v_booking.expires_at,
    'availability_slot_id', v_slot.id,
    'starts_at', v_slot.starts_at,
    'ends_at', v_slot.ends_at,
    'idempotent_replay', false
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_booking_participants(
  p_booking_id uuid,
  p_participants jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_booking public.bookings%rowtype;
  v_item jsonb;
  v_count integer := 0;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  if auth.role() is distinct from 'service_role'
     and v_booking.customer_profile_id is distinct from (select auth.uid())
     and not exists (
       select 1 from public.user_roles ur
       where ur.profile_id = (select auth.uid())
         and ur.role in ('operations_staff','customer_support','administrator','super_administrator')
     ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if jsonb_typeof(p_participants) <> 'array' then raise exception 'PARTICIPANTS_MUST_BE_ARRAY'; end if;
  if jsonb_array_length(p_participants) <> v_booking.party_size then raise exception 'PARTICIPANT_COUNT_MISMATCH'; end if;

  delete from public.booking_participants where booking_id = p_booking_id;

  for v_item in select value from jsonb_array_elements(p_participants)
  loop
    v_count := v_count + 1;
    insert into public.booking_participants(
      booking_id, participant_number, is_lead, first_name, last_name,
      date_of_birth, email, phone, medical_notes, dietary_notes,
      accessibility_notes, emergency_contact_name, emergency_contact_phone
    ) values (
      p_booking_id,
      v_count,
      coalesce((v_item->>'is_lead')::boolean, v_count = 1),
      nullif(trim(v_item->>'first_name'), ''),
      nullif(trim(v_item->>'last_name'), ''),
      nullif(v_item->>'date_of_birth', '')::date,
      nullif(trim(v_item->>'email'), ''),
      nullif(trim(v_item->>'phone'), ''),
      nullif(trim(v_item->>'medical_notes'), ''),
      nullif(trim(v_item->>'dietary_notes'), ''),
      nullif(trim(v_item->>'accessibility_notes'), ''),
      nullif(trim(v_item->>'emergency_contact_name'), ''),
      nullif(trim(v_item->>'emergency_contact_phone'), '')
    );
  end loop;

  return jsonb_build_object('booking_id', p_booking_id, 'participant_count', v_count);
end;
$function$;

CREATE OR REPLACE FUNCTION public.release_booking_hold(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  if auth.role() is distinct from 'service_role'
     and v_booking.customer_profile_id is distinct from (select auth.uid())
     and not exists (
       select 1 from public.user_roles ur
       where ur.profile_id = (select auth.uid())
         and ur.role in ('operations_staff','customer_support','administrator','super_administrator')
     ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.booking_holds
  set released_at = timezone('utc', now())
  where booking_id = p_booking_id and released_at is null and converted_at is null;

  if v_booking.status in ('draft','pending_payment') and v_booking.payment_status = 'unpaid' then
    update public.bookings
    set status = 'cancelled', cancelled_at = timezone('utc', now()), updated_at = timezone('utc', now())
    where id = p_booking_id;
    insert into public.booking_status_history(booking_id, previous_status, new_status, reason)
    values (p_booking_id, v_booking.status, 'cancelled', 'Booking hold released');
  end if;
  return true;
end;
$function$;

DROP VIEW IF EXISTS public.booking_detail;
CREATE VIEW public.booking_detail
WITH (security_invoker = true) AS
SELECT
  id,
  booking_reference,
  customer_profile_id,
  customer_id,
  customer_email,
  contact_first_name,
  contact_last_name,
  customer_phone,
  preferred_language,
  experience_id,
  experience_variant_id,
  availability_slot_id,
  location_id,
  status,
  payment_status,
  currency,
  unit_amount_minor,
  subtotal_amount_minor,
  total_amount_minor,
  voucher_amount_minor,
  party_size,
  special_requests,
  experience_title_snapshot,
  variant_name_snapshot,
  location_name_snapshot,
  starts_at_snapshot,
  ends_at_snapshot,
  timezone_snapshot,
  pricing_snapshot,
  cancellation_policy_snapshot,
  expires_at,
  booked_at,
  confirmed_at,
  cancelled_at,
  completed_at,
  created_at,
  updated_at,
  COALESCE((
    SELECT jsonb_agg(to_jsonb(bp.*) ORDER BY bp.participant_number, bp.created_at)
    FROM booking_participants bp WHERE bp.booking_id = b.id
  ), '[]'::jsonb) AS participants,
  COALESCE((
    SELECT jsonb_agg(to_jsonb(pl.*) ORDER BY pl.created_at)
    FROM booking_price_lines pl WHERE pl.booking_id = b.id
  ), '[]'::jsonb) AS price_lines,
  COALESCE((
    SELECT jsonb_agg(to_jsonb(ba.*) ORDER BY ba.created_at)
    FROM booking_addons ba WHERE ba.booking_id = b.id
  ), '[]'::jsonb) AS addons,
  COALESCE((
    SELECT jsonb_agg(to_jsonb(h.*) ORDER BY h.created_at DESC)
    FROM booking_status_history h WHERE h.booking_id = b.id
  ), '[]'::jsonb) AS status_history
FROM bookings b;

REVOKE ALL ON public.booking_detail FROM PUBLIC;
REVOKE ALL ON public.booking_detail FROM anon;
REVOKE ALL ON public.booking_detail FROM authenticated;
GRANT SELECT ON public.booking_detail TO service_role;

DROP VIEW IF EXISTS public.booking_availability;
CREATE VIEW public.booking_availability
WITH (security_invoker = true) AS
SELECT
  id AS availability_slot_id,
  experience_id,
  experience_variant_id,
  location_id,
  starts_at,
  ends_at,
  timezone,
  capacity_total,
  booking_reserved_capacity(id) AS capacity_reserved_live,
  GREATEST((capacity_total - booking_reserved_capacity(id)), 0) AS capacity_available,
  status,
  booking_cutoff_at,
  is_instant_confirmation,
  (
    (status = 'scheduled'::availability_status)
    AND (starts_at > timezone('utc'::text, now()))
    AND ((booking_cutoff_at IS NULL) OR (booking_cutoff_at > timezone('utc'::text, now())))
    AND (GREATEST((capacity_total - booking_reserved_capacity(id)), 0) > 0)
  ) AS is_bookable
FROM availability_slots s;

GRANT SELECT ON public.booking_availability TO anon, authenticated, service_role;
