-- Transactional contract test: all fabricated rows are rolled back.
begin;

do $security$
begin
  if has_table_privilege('anon', 'public.partner_referral_visits', 'select')
    or has_table_privilege(
      'authenticated',
      'public.referral_contact_verifications',
      'select'
    )
    or has_table_privilege(
      'anon',
      'public.customer_referral_sessions',
      'select'
    )
    or has_table_privilege(
      'authenticated',
      'public.partner_referral_events',
      'insert'
    ) then
    raise exception 'ASSERT_PRIVATE_TABLE_GRANTS_FAILED';
  end if;

  if has_function_privilege(
    'anon',
    'public.submit_referral_contact(text,text,text,text,text,text,text,boolean,boolean,timestamptz)',
    'execute'
  ) then
    raise exception 'ASSERT_SERVER_ONLY_CONTACT_RPC_FAILED';
  end if;

  if not has_function_privilege(
    'anon',
    'public.get_public_referral_landing(text,text)',
    'execute'
  ) then
    raise exception 'ASSERT_SAFE_PUBLIC_LANDING_RPC_FAILED';
  end if;
end;
$security$;

do $test$
declare
  v_active_partner_id uuid := extensions.gen_random_uuid();
  v_second_partner_id uuid := extensions.gen_random_uuid();
  v_draft_partner_id uuid := extensions.gen_random_uuid();
  v_email text :=
    'partner-referral-test-' || extensions.gen_random_uuid() || '@example.invalid';
  v_visit_one jsonb;
  v_visit_two jsonb;
  v_verified_one jsonb;
  v_verified_two jsonb;
  v_context jsonb;
  v_booking jsonb;
  v_booking_id uuid;
  v_referral_one_id uuid;
  v_referral_two_id uuid;
  v_slot_id uuid;
  v_party_size integer;
  v_voucher_id uuid;
  v_voucher_amount integer;
  v_voucher_expires_at timestamptz;
  v_redeemed_at timestamptz;
  v_count integer;
begin
  insert into public.partners (
    id, slug, name, referral_code, status,
    attribution_window_hours, voucher_percent_basis_points
  )
  values
    (
      v_active_partner_id,
      'transactional-referral-test-one',
      'Transactional Referral Test One',
      'TEST-ACTIVE-ONE',
      'active',
      720,
      1000
    ),
    (
      v_second_partner_id,
      'transactional-referral-test-two',
      'Transactional Referral Test Two',
      'TEST-ACTIVE-TWO',
      'active',
      720,
      1250
    ),
    (
      v_draft_partner_id,
      'transactional-referral-test-draft',
      'Transactional Referral Test Draft',
      'TEST-DRAFT',
      'draft',
      720,
      1000
    );

  begin
    perform public.register_partner_referral_visit(
      'TEST-DRAFT',
      repeat('d', 64),
      '/experiences'
    );
    raise exception 'ASSERT_DRAFT_PARTNER_ACCEPTED';
  exception
    when others then
      if sqlerrm not like '%PARTNER_REFERRAL_NOT_FOUND%' then
        raise;
      end if;
  end;

  v_visit_one := public.register_partner_referral_visit(
    'TEST-ACTIVE-ONE',
    repeat('a', 64),
    '/experiences'
  );
  if public.get_public_referral_landing(
    v_visit_one->>'visit_token',
    'en'
  ) #>> '{partner,name}' <> 'Transactional Referral Test One' then
    raise exception 'ASSERT_SAFE_LANDING_FAILED';
  end if;

  perform public.submit_referral_contact(
    v_visit_one->>'visit_token',
    repeat('1', 64),
    v_email,
    'Case',
    'Insensitive',
    '+34123456789',
    'en',
    true,
    false,
    timezone('utc', now()) + interval '15 minutes'
  );
  v_verified_one := public.verify_referral_contact(
    repeat('1', 64),
    repeat('3', 64)
  );
  v_referral_one_id := (v_verified_one->>'referral_id')::uuid;

  begin
    perform public.verify_referral_contact(repeat('1', 64), repeat('4', 64));
    raise exception 'ASSERT_TOKEN_REUSED';
  exception
    when others then
      if sqlerrm not like '%VERIFICATION_ALREADY_USED%' then
        raise;
      end if;
  end;

  v_visit_two := public.register_partner_referral_visit(
    'TEST-ACTIVE-TWO',
    repeat('a', 64),
    '/experiences'
  );
  perform public.submit_referral_contact(
    v_visit_two->>'visit_token',
    repeat('2', 64),
    upper(v_email),
    'Case',
    'Insensitive',
    null,
    'en',
    false,
    true,
    timezone('utc', now()) + interval '15 minutes'
  );
  v_verified_two := public.verify_referral_contact(
    repeat('2', 64),
    repeat('5', 64)
  );
  v_referral_two_id := (v_verified_two->>'referral_id')::uuid;

  select count(*) into v_count
  from public.customers
  where lower(email) = lower(v_email);
  if v_count <> 1 then
    raise exception 'ASSERT_CASE_INSENSITIVE_CUSTOMER_UPSERT_FAILED';
  end if;

  v_context := public.get_verified_referral_context(repeat('3', 64));
  if jsonb_array_length(v_context->'eligible_partners') <> 2 then
    raise exception 'ASSERT_MULTIPLE_ELIGIBLE_REFERRALS_FAILED';
  end if;

  select s.id, v.min_party_size
  into v_slot_id, v_party_size
  from public.availability_slots s
  join public.experience_variants v on v.id = s.experience_variant_id
  join public.experiences e on e.id = s.experience_id
  where s.status = 'scheduled'
    and s.starts_at > timezone('utc', now())
    and e.status = 'published'
    and v.is_active = true
    and s.capacity_total - public.booking_reserved_capacity(s.id)
      >= v.min_party_size
  order by s.starts_at
  limit 1;
  if v_slot_id is null then
    raise exception 'ASSERT_NO_BOOKABLE_SLOT_FOR_TEST';
  end if;

  begin
    perform public.create_experience_booking(
      v_slot_id,
      v_party_size,
      v_email,
      'Case',
      'Insensitive',
      null,
      'en',
      null,
      true,
      extensions.gen_random_uuid(),
      extensions.gen_random_uuid(),
      v_referral_two_id,
      repeat('x', 64)
    );
    raise exception 'ASSERT_FORGED_SESSION_ACCEPTED';
  exception
    when others then
      if sqlerrm not like '%REFERRAL_SESSION_INVALID%' then
        raise;
      end if;
  end;

  v_booking := public.create_experience_booking(
    v_slot_id,
    v_party_size,
    v_email,
    'Case',
    'Insensitive',
    '+34123456789',
    'en',
    null,
    true,
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    v_referral_one_id,
    repeat('3', 64)
  );
  v_booking_id := (v_booking->>'booking_id')::uuid;

  if (
    select b.partner_id <> v_active_partner_id
      or b.referral_id <> v_referral_one_id
      or b.partner_voucher_percent_basis_points_snapshot <> 1000
    from public.bookings b
    where b.id = v_booking_id
  ) then
    raise exception 'ASSERT_ATOMIC_ATTRIBUTION_FAILED';
  end if;

  update public.bookings
  set unit_amount_minor = 10005,
      subtotal_amount_minor = 10005,
      total_amount_minor = 10005
  where id = v_booking_id;

  perform public.confirm_paid_booking(v_booking_id, 'pi_test_referral');
  perform public.confirm_paid_booking(v_booking_id, 'pi_test_referral');

  select id, voucher_amount_minor, expires_at
  into v_voucher_id, v_voucher_amount, v_voucher_expires_at
  from public.vouchers
  where booking_id = v_booking_id;
  if v_voucher_amount <> 1001 then
    raise exception 'ASSERT_VOUCHER_ROUNDING_FAILED';
  end if;
  if v_voucher_expires_at not between
    timezone('utc', now()) + interval '29 days 23 hours'
    and timezone('utc', now()) + interval '30 days 1 hour' then
    raise exception 'ASSERT_VOUCHER_EXPIRY_FAILED';
  end if;
  select count(*) into v_count
  from public.vouchers
  where booking_id = v_booking_id;
  if v_count <> 1 then
    raise exception 'ASSERT_DUPLICATE_VOUCHER_ISSUED';
  end if;

  update public.vouchers
  set status = 'redeemed',
      redeemed_at = timezone('utc', now())
  where id = v_voucher_id
  returning redeemed_at into v_redeemed_at;
  perform public.cancel_booking_voucher(v_booking_id, 'Transactional refund test');

  if not exists (
    select 1
    from public.vouchers
    where id = v_voucher_id
      and status = 'cancelled'
      and redeemed_at = v_redeemed_at
  ) then
    raise exception 'ASSERT_REDEEMED_VOUCHER_CANCELLATION_FAILED';
  end if;

  if not exists (
    select 1
    from public.partner_referral_events
    where booking_id = v_booking_id
      and event_type = 'voucher_cancelled'
  ) then
    raise exception 'ASSERT_CANCELLATION_AUDIT_EVENT_MISSING';
  end if;
end;
$test$;

rollback;
