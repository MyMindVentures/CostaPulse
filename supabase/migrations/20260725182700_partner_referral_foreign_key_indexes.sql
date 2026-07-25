create index if not exists customer_referral_sessions_customer_id_idx
  on public.customer_referral_sessions (customer_id);

create index if not exists partner_referral_events_visit_id_idx
  on public.partner_referral_events (visit_id);

create index if not exists partner_referral_events_referral_id_idx
  on public.partner_referral_events (referral_id);

create index if not exists partner_referral_events_customer_id_idx
  on public.partner_referral_events (customer_id);

create index if not exists partner_referral_events_voucher_id_idx
  on public.partner_referral_events (voucher_id);
