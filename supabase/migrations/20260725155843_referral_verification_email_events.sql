alter table public.partner_referral_events
  drop constraint partner_referral_events_type_check;

alter table public.partner_referral_events
  add constraint partner_referral_events_type_check
  check (event_type in (
    'visit_registered',
    'contact_submitted',
    'verification_email_sent',
    'verification_email_failed',
    'contact_verified',
    'booking_attributed',
    'voucher_issued',
    'voucher_email_sent',
    'voucher_email_failed',
    'voucher_cancelled'
  ));

create function public.record_referral_verification_email_outcome(
  p_verification_token_hash text,
  p_succeeded boolean,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_verification public.referral_contact_verifications%rowtype;
  v_visit public.partner_referral_visits%rowtype;
begin
  select *
  into v_verification
  from public.referral_contact_verifications
  where token_hash = p_verification_token_hash;
  if not found then
    raise exception 'VERIFICATION_NOT_FOUND';
  end if;

  select *
  into v_visit
  from public.partner_referral_visits
  where id = v_verification.visit_id;

  insert into public.partner_referral_events (
    event_type,
    partner_id,
    visit_id,
    metadata
  )
  values (
    case
      when p_succeeded then 'verification_email_sent'
      else 'verification_email_failed'
    end,
    v_visit.partner_id,
    v_visit.id,
    case
      when p_provider_message_id is null then '{}'::jsonb
      else jsonb_build_object('provider_message_id', p_provider_message_id)
    end
  );
end;
$$;

revoke all on function public.record_referral_verification_email_outcome(
  text, boolean, text
) from public, anon, authenticated;
grant execute on function public.record_referral_verification_email_outcome(
  text, boolean, text
) to service_role;
