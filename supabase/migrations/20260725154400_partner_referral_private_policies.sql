-- Explicit deny policies document the intended private posture for browser roles.
-- Server-side service-role repositories bypass RLS and are the only writers.

create policy "partner_referral_visits_browser_denied"
on public.partner_referral_visits
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "referral_contact_verifications_browser_denied"
on public.referral_contact_verifications
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "customer_referral_sessions_browser_denied"
on public.customer_referral_sessions
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "partner_referral_events_browser_denied"
on public.partner_referral_events
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
