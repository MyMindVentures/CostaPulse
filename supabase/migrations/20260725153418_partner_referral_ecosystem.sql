-- CostaPulse partner referral ecosystem.
-- QR visit -> verified contact -> server-authoritative booking attribution
-- -> idempotent voucher issuance.

create table public.partner_promo_content (
  locale text primary key,
  content jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint partner_promo_content_locale_check
    check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  constraint partner_promo_content_object_check
    check (jsonb_typeof(content) = 'object')
);

create trigger set_partner_promo_content_updated_at
before update on public.partner_promo_content
for each row execute function public.set_updated_at();

alter table public.partner_promo_content enable row level security;

create policy "partner_promo_content_published_select"
on public.partner_promo_content
for select
to anon, authenticated
using (is_published = true);

grant select on public.partner_promo_content to anon, authenticated;

insert into public.partner_promo_content (locale, content, is_published)
values
(
  'en',
  '{
    "partnerKicker":"Our partner",
    "headlinePrimary":"Book an experience.",
    "headlineAccent":"Enjoy even more.",
    "intro":"Scan the QR code, book your CostaPulse experience and receive {reward} back to enjoy at this partner.",
    "scanLabel":"Scan me",
    "rewardTitle":"Get {reward} back",
    "rewardDescription":"on your eligible booking to spend with this partner.",
    "howTitle":"How it works",
    "steps":[
      {"title":"Scan","description":"Scan this partner QR code."},
      {"title":"Verify","description":"Enter your contact details and verify your email."},
      {"title":"Book and pay","description":"Choose an experience and complete secure payment."},
      {"title":"Get your voucher","description":"Receive your partner voucher after payment."}
    ],
    "customerBenefitsTitle":"Good for you",
    "customerBenefits":["Enjoy exceptional Costa Blanca experiences","Receive a reward to enjoy locally","Support local businesses"],
    "partnerBenefitsTitle":"Good for us",
    "partnerBenefits":["Welcome new visitors","Share memorable local experiences","Build lasting local connections"],
    "supportTitle":"Thank you for supporting local",
    "supportMessage":"We cannot wait to welcome you.",
    "features":[
      {"title":"Private experiences","description":"Tailored to you"},
      {"title":"Local host","description":"Passion and knowledge"},
      {"title":"Small groups","description":"Personal and relaxed"},
      {"title":"Unforgettable days","description":"On land and at sea"}
    ]
  }'::jsonb,
  true
),
(
  'nl',
  '{
    "partnerKicker":"Onze partner",
    "headlinePrimary":"Boek een ervaring.",
    "headlineAccent":"Geniet nog meer.",
    "intro":"Scan de QR-code, boek je CostaPulse-ervaring en ontvang {reward} terug om bij deze partner te besteden.",
    "scanLabel":"Scan mij",
    "rewardTitle":"Ontvang {reward} terug",
    "rewardDescription":"op je in aanmerking komende boeking om bij deze partner te besteden.",
    "howTitle":"Hoe het werkt",
    "steps":[
      {"title":"Scan","description":"Scan de QR-code van deze partner."},
      {"title":"Verifieer","description":"Vul je contactgegevens in en verifieer je e-mail."},
      {"title":"Boek en betaal","description":"Kies een ervaring en rond de veilige betaling af."},
      {"title":"Ontvang je voucher","description":"Ontvang na betaling je partnervoucher."}
    ],
    "customerBenefitsTitle":"Goed voor jou",
    "customerBenefits":["Beleef bijzondere ervaringen aan de Costa Blanca","Ontvang een beloning om lokaal te besteden","Steun lokale ondernemingen"],
    "partnerBenefitsTitle":"Goed voor ons",
    "partnerBenefits":["Verwelkom nieuwe bezoekers","Deel mooie lokale ervaringen","Bouw duurzame lokale relaties"],
    "supportTitle":"Bedankt dat je lokaal steunt",
    "supportMessage":"We kijken ernaar uit je te verwelkomen.",
    "features":[
      {"title":"Privé-ervaringen","description":"Op jou afgestemd"},
      {"title":"Lokale host","description":"Passie en kennis"},
      {"title":"Kleine groepen","description":"Persoonlijk en ontspannen"},
      {"title":"Onvergetelijke dagen","description":"Op het land en op zee"}
    ]
  }'::jsonb,
  true
),
(
  'es',
  '{
    "partnerKicker":"Nuestro colaborador",
    "headlinePrimary":"Reserva una experiencia.",
    "headlineAccent":"Disfruta aún más.",
    "intro":"Escanea el código QR, reserva tu experiencia CostaPulse y recibe un {reward} para disfrutar con este colaborador.",
    "scanLabel":"Escanéame",
    "rewardTitle":"Recibe un {reward}",
    "rewardDescription":"de tu reserva elegible para gastar con este colaborador.",
    "howTitle":"Cómo funciona",
    "steps":[
      {"title":"Escanea","description":"Escanea el código QR de este colaborador."},
      {"title":"Verifica","description":"Introduce tus datos y verifica tu correo."},
      {"title":"Reserva y paga","description":"Elige una experiencia y completa el pago seguro."},
      {"title":"Recibe tu vale","description":"Recibe el vale del colaborador después del pago."}
    ],
    "customerBenefitsTitle":"Bueno para ti",
    "customerBenefits":["Disfruta experiencias excepcionales en la Costa Blanca","Recibe una recompensa para disfrutar localmente","Apoya a los negocios locales"],
    "partnerBenefitsTitle":"Bueno para nosotros",
    "partnerBenefits":["Recibe nuevos visitantes","Comparte experiencias locales memorables","Crea relaciones locales duraderas"],
    "supportTitle":"Gracias por apoyar lo local",
    "supportMessage":"Estamos deseando darte la bienvenida.",
    "features":[
      {"title":"Experiencias privadas","description":"A tu medida"},
      {"title":"Anfitrión local","description":"Pasión y conocimiento"},
      {"title":"Grupos pequeños","description":"Personal y relajado"},
      {"title":"Días inolvidables","description":"En tierra y en el mar"}
    ]
  }'::jsonb,
  true
),
(
  'fr',
  '{
    "partnerKicker":"Notre partenaire",
    "headlinePrimary":"Réservez une expérience.",
    "headlineAccent":"Profitez encore plus.",
    "intro":"Scannez le QR code, réservez votre expérience CostaPulse et recevez {reward} à dépenser chez ce partenaire.",
    "scanLabel":"Scannez-moi",
    "rewardTitle":"Recevez {reward}",
    "rewardDescription":"sur votre réservation éligible à dépenser chez ce partenaire.",
    "howTitle":"Comment ça marche",
    "steps":[
      {"title":"Scannez","description":"Scannez le QR code de ce partenaire."},
      {"title":"Vérifiez","description":"Saisissez vos coordonnées et vérifiez votre e-mail."},
      {"title":"Réservez et payez","description":"Choisissez une expérience et effectuez le paiement sécurisé."},
      {"title":"Recevez votre bon","description":"Recevez votre bon partenaire après le paiement."}
    ],
    "customerBenefitsTitle":"Bon pour vous",
    "customerBenefits":["Vivez des expériences exceptionnelles sur la Costa Blanca","Recevez une récompense à dépenser localement","Soutenez les entreprises locales"],
    "partnerBenefitsTitle":"Bon pour nous",
    "partnerBenefits":["Accueillez de nouveaux visiteurs","Partagez des expériences locales mémorables","Créez des liens locaux durables"],
    "supportTitle":"Merci de soutenir l''économie locale",
    "supportMessage":"Nous avons hâte de vous accueillir.",
    "features":[
      {"title":"Expériences privées","description":"Conçues pour vous"},
      {"title":"Hôte local","description":"Passion et connaissance"},
      {"title":"Petits groupes","description":"Personnel et détendu"},
      {"title":"Journées inoubliables","description":"Sur terre et en mer"}
    ]
  }'::jsonb,
  true
),
(
  'de',
  '{
    "partnerKicker":"Unser Partner",
    "headlinePrimary":"Buche ein Erlebnis.",
    "headlineAccent":"Genieße noch mehr.",
    "intro":"Scanne den QR-Code, buche dein CostaPulse-Erlebnis und erhalte {reward} zurück, um es bei diesem Partner einzulösen.",
    "scanLabel":"Scanne mich",
    "rewardTitle":"Erhalte {reward} zurück",
    "rewardDescription":"auf deine berechtigte Buchung zur Einlösung bei diesem Partner.",
    "howTitle":"So funktioniert es",
    "steps":[
      {"title":"Scannen","description":"Scanne den QR-Code dieses Partners."},
      {"title":"Bestätigen","description":"Gib deine Kontaktdaten ein und bestätige deine E-Mail."},
      {"title":"Buchen und zahlen","description":"Wähle ein Erlebnis und schließe die sichere Zahlung ab."},
      {"title":"Gutschein erhalten","description":"Erhalte deinen Partnergutschein nach der Zahlung."}
    ],
    "customerBenefitsTitle":"Gut für dich",
    "customerBenefits":["Erlebe außergewöhnliche Erlebnisse an der Costa Blanca","Erhalte eine lokale Belohnung","Unterstütze lokale Unternehmen"],
    "partnerBenefitsTitle":"Gut für uns",
    "partnerBenefits":["Begrüße neue Gäste","Teile unvergessliche lokale Erlebnisse","Baue langfristige lokale Beziehungen auf"],
    "supportTitle":"Danke, dass du lokale Anbieter unterstützt",
    "supportMessage":"Wir freuen uns darauf, dich willkommen zu heißen.",
    "features":[
      {"title":"Private Erlebnisse","description":"Auf dich zugeschnitten"},
      {"title":"Lokaler Gastgeber","description":"Leidenschaft und Wissen"},
      {"title":"Kleine Gruppen","description":"Persönlich und entspannt"},
      {"title":"Unvergessliche Tage","description":"An Land und auf dem Meer"}
    ]
  }'::jsonb,
  true
);

create table public.partner_referral_visits (
  id uuid primary key default extensions.gen_random_uuid(),
  partner_id uuid not null references public.partners (id) on delete cascade,
  public_token text not null unique,
  visitor_token_hash text not null,
  landing_path text not null default '/experiences',
  created_at timestamptz not null default timezone('utc', now())
);

create index partner_referral_visits_partner_created_idx
  on public.partner_referral_visits (partner_id, created_at desc);
create index partner_referral_visits_visitor_idx
  on public.partner_referral_visits (visitor_token_hash, created_at desc);

create table public.referral_contact_verifications (
  id uuid primary key default extensions.gen_random_uuid(),
  visit_id uuid not null unique references public.partner_referral_visits (id) on delete cascade,
  token_hash text not null unique,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  preferred_locale text not null default 'en',
  marketing_consent boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint referral_contact_email_normalized_check
    check (email = lower(trim(email))),
  constraint referral_contact_locale_check
    check (preferred_locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  constraint referral_contact_expiry_check
    check (expires_at > created_at)
);

create trigger set_referral_contact_verifications_updated_at
before update on public.referral_contact_verifications
for each row execute function public.set_updated_at();

create table public.customer_referral_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint customer_referral_sessions_expiry_check
    check (expires_at > created_at)
);

alter table public.referrals
  add column visit_id uuid references public.partner_referral_visits (id) on delete set null,
  add column customer_id uuid references public.customers (id) on delete set null,
  add column verified_at timestamptz;

create unique index referrals_visit_id_key
  on public.referrals (visit_id)
  where visit_id is not null;
create index referrals_customer_active_idx
  on public.referrals (customer_id, expires_at)
  where customer_id is not null;

alter table public.bookings
  add column partner_voucher_percent_basis_points_snapshot integer;

alter table public.bookings
  add constraint bookings_partner_voucher_percent_snapshot_check
  check (
    partner_voucher_percent_basis_points_snapshot is null
    or partner_voucher_percent_basis_points_snapshot between 0 and 10000
  );

create table public.partner_referral_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_type text not null,
  partner_id uuid references public.partners (id) on delete set null,
  visit_id uuid references public.partner_referral_visits (id) on delete set null,
  referral_id uuid references public.referrals (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  voucher_id uuid references public.vouchers (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint partner_referral_events_type_check
    check (event_type in (
      'visit_registered',
      'contact_submitted',
      'contact_verified',
      'booking_attributed',
      'voucher_issued',
      'voucher_email_sent',
      'voucher_email_failed',
      'voucher_cancelled'
    )),
  constraint partner_referral_events_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

create index partner_referral_events_partner_created_idx
  on public.partner_referral_events (partner_id, created_at desc);
create index partner_referral_events_booking_idx
  on public.partner_referral_events (booking_id)
  where booking_id is not null;

alter table public.partner_referral_visits enable row level security;
alter table public.referral_contact_verifications enable row level security;
alter table public.customer_referral_sessions enable row level security;
alter table public.partner_referral_events enable row level security;

revoke all on public.partner_referral_visits from anon, authenticated;
revoke all on public.referral_contact_verifications from anon, authenticated;
revoke all on public.customer_referral_sessions from anon, authenticated;
revoke all on public.partner_referral_events from anon, authenticated;
grant select, insert, update, delete on public.partner_referral_visits
  to service_role;
grant select, insert, update, delete on public.referral_contact_verifications
  to service_role;
grant select, insert, update, delete on public.customer_referral_sessions
  to service_role;
grant select, insert on public.partner_referral_events
  to service_role;

create or replace function public.register_partner_referral_visit(
  p_partner_code text,
  p_visitor_token_hash text,
  p_landing_path text default '/experiences'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_partner public.partners%rowtype;
  v_visit public.partner_referral_visits%rowtype;
begin
  if nullif(trim(p_partner_code), '') is null
     or nullif(trim(p_visitor_token_hash), '') is null then
    raise exception 'INVALID_REFERRAL_ENTRY';
  end if;

  select *
  into v_partner
  from public.partners
  where referral_code = trim(p_partner_code)
    and status = 'active';

  if not found then
    raise exception 'PARTNER_REFERRAL_NOT_FOUND';
  end if;

  insert into public.partner_referral_visits (
    partner_id,
    public_token,
    visitor_token_hash,
    landing_path
  )
  values (
    v_partner.id,
    encode(extensions.gen_random_bytes(24), 'hex'),
    p_visitor_token_hash,
    coalesce(nullif(trim(p_landing_path), ''), '/experiences')
  )
  returning * into v_visit;

  insert into public.partner_referral_events (
    event_type, partner_id, visit_id
  )
  values ('visit_registered', v_partner.id, v_visit.id);

  return jsonb_build_object(
    'visit_token', v_visit.public_token,
    'partner_slug', v_partner.slug,
    'attribution_expires_at',
      v_visit.created_at + make_interval(hours => v_partner.attribution_window_hours)
  );
end;
$$;

revoke all on function public.register_partner_referral_visit(text, text, text)
  from public, anon, authenticated;
grant execute on function public.register_partner_referral_visit(text, text, text)
  to service_role;

create or replace function public.get_public_referral_landing(
  p_visit_token text,
  p_locale text default 'en'
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  with selected_visit as (
    select
      v.id,
      v.public_token,
      v.created_at,
      p.id as partner_id,
      p.slug,
      p.name,
      p.business_type,
      p.voucher_percent_basis_points,
      p.attribution_window_hours
    from public.partner_referral_visits v
    join public.partners p on p.id = v.partner_id
    where v.public_token = p_visit_token
      and p.status = 'active'
      and timezone('utc', now())
        < v.created_at + make_interval(hours => p.attribution_window_hours)
  ),
  selected_content as (
    select content
    from public.partner_promo_content
    where is_published = true
      and locale in (p_locale, 'en')
    order by case when locale = p_locale then 0 else 1 end
    limit 1
  )
  select case
    when not exists (select 1 from selected_visit) then null
    else jsonb_build_object(
      'visit_token', (select public_token from selected_visit),
      'partner', jsonb_build_object(
        'id', (select partner_id from selected_visit),
        'slug', (select slug from selected_visit),
        'name', (select name from selected_visit),
        'business_type', (select business_type from selected_visit),
        'voucher_percent_basis_points',
          (select voucher_percent_basis_points from selected_visit)
      ),
      'content', (select content from selected_content),
      'media', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', m.id,
          'bucket_id', m.bucket_id,
          'storage_path', m.storage_path,
          'role', m.role,
          'alt_text', coalesce(m.alt_text_override, m.alt_text),
          'is_primary', m.is_primary,
          'display_order', m.display_order
        ) order by m.role, m.is_primary desc, m.display_order)
        from public.media_assets m
        where m.scope_type = 'partner'
          and m.scope_key = (select slug from selected_visit)
          and m.role in ('logo', 'gallery')
          and m.status = 'published'
          and m.visibility = 'public'
          and m.is_active = true
          and (m.starts_at is null or m.starts_at <= timezone('utc', now()))
          and (m.ends_at is null or m.ends_at > timezone('utc', now()))
      ), '[]'::jsonb)
    )
  end;
$$;

revoke all on function public.get_public_referral_landing(text, text)
  from public;
grant execute on function public.get_public_referral_landing(text, text)
  to anon, authenticated, service_role;

create or replace function public.submit_referral_contact(
  p_visit_token text,
  p_verification_token_hash text,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_preferred_locale text,
  p_marketing_consent boolean,
  p_whatsapp_opt_in boolean,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_visit public.partner_referral_visits%rowtype;
  v_partner public.partners%rowtype;
  v_verification public.referral_contact_verifications%rowtype;
begin
  select *
  into v_visit
  from public.partner_referral_visits
  where public_token = p_visit_token;

  if not found then
    raise exception 'REFERRAL_VISIT_EXPIRED';
  end if;

  select *
  into v_partner
  from public.partners
  where id = v_visit.partner_id
    and status = 'active';

  if not found
     or timezone('utc', now()) >=
       v_visit.created_at
       + make_interval(hours => v_partner.attribution_window_hours) then
    raise exception 'REFERRAL_VISIT_EXPIRED';
  end if;

  if p_expires_at <= timezone('utc', now()) then
    raise exception 'INVALID_VERIFICATION_EXPIRY';
  end if;

  insert into public.referral_contact_verifications (
    visit_id,
    token_hash,
    email,
    first_name,
    last_name,
    phone,
    preferred_locale,
    marketing_consent,
    whatsapp_opt_in,
    expires_at,
    verified_at
  )
  values (
    v_visit.id,
    p_verification_token_hash,
    lower(trim(p_email)),
    trim(p_first_name),
    trim(p_last_name),
    nullif(trim(p_phone), ''),
    p_preferred_locale,
    coalesce(p_marketing_consent, false),
    coalesce(p_whatsapp_opt_in, false),
    p_expires_at,
    null
  )
  on conflict (visit_id) do update set
    token_hash = excluded.token_hash,
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    preferred_locale = excluded.preferred_locale,
    marketing_consent = excluded.marketing_consent,
    whatsapp_opt_in = excluded.whatsapp_opt_in,
    expires_at = excluded.expires_at,
    verified_at = null,
    updated_at = timezone('utc', now())
  returning * into v_verification;

  insert into public.partner_referral_events (
    event_type, partner_id, visit_id,
    metadata
  )
  values (
    'contact_submitted',
    v_partner.id,
    v_visit.id,
    jsonb_build_object('preferred_locale', p_preferred_locale)
  );

  return jsonb_build_object(
    'verification_id', v_verification.id,
    'partner_name', v_partner.name
  );
end;
$$;

revoke all on function public.submit_referral_contact(
  text, text, text, text, text, text, text, boolean, boolean, timestamptz
) from public, anon, authenticated;
grant execute on function public.submit_referral_contact(
  text, text, text, text, text, text, text, boolean, boolean, timestamptz
) to service_role;

create or replace function public.verify_referral_contact(
  p_verification_token_hash text,
  p_session_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_verification public.referral_contact_verifications%rowtype;
  v_visit public.partner_referral_visits%rowtype;
  v_partner public.partners%rowtype;
  v_customer public.customers%rowtype;
  v_referral public.referrals%rowtype;
  v_session public.customer_referral_sessions%rowtype;
  v_referral_expires_at timestamptz;
  v_session_expires_at timestamptz;
begin
  select *
  into v_verification
  from public.referral_contact_verifications
  where token_hash = p_verification_token_hash
  for update;

  if not found then
    raise exception 'VERIFICATION_NOT_FOUND';
  end if;
  if v_verification.verified_at is not null then
    raise exception 'VERIFICATION_ALREADY_USED';
  end if;
  if v_verification.expires_at <= timezone('utc', now()) then
    raise exception 'VERIFICATION_EXPIRED';
  end if;

  select * into v_visit
  from public.partner_referral_visits
  where id = v_verification.visit_id;
  select * into v_partner
  from public.partners
  where id = v_visit.partner_id
    and status = 'active';

  if not found then
    raise exception 'PARTNER_REFERRAL_NOT_FOUND';
  end if;

  v_referral_expires_at :=
    v_visit.created_at + make_interval(hours => v_partner.attribution_window_hours);
  if v_referral_expires_at <= timezone('utc', now()) then
    raise exception 'REFERRAL_VISIT_EXPIRED';
  end if;

  insert into public.customers (
    first_name,
    last_name,
    email,
    phone,
    preferred_language,
    marketing_consent,
    marketing_consent_at,
    whatsapp_opt_in,
    whatsapp_opt_in_at
  )
  values (
    v_verification.first_name,
    v_verification.last_name,
    v_verification.email,
    v_verification.phone,
    v_verification.preferred_locale,
    v_verification.marketing_consent,
    case when v_verification.marketing_consent
      then timezone('utc', now()) else null end,
    v_verification.whatsapp_opt_in,
    case when v_verification.whatsapp_opt_in
      then timezone('utc', now()) else null end
  )
  on conflict ((lower(email))) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = coalesce(excluded.phone, customers.phone),
    preferred_language = excluded.preferred_language,
    marketing_consent =
      customers.marketing_consent or excluded.marketing_consent,
    marketing_consent_at = case
      when customers.marketing_consent then customers.marketing_consent_at
      when excluded.marketing_consent then timezone('utc', now())
      else null
    end,
    whatsapp_opt_in =
      customers.whatsapp_opt_in or excluded.whatsapp_opt_in,
    whatsapp_opt_in_at = case
      when customers.whatsapp_opt_in then customers.whatsapp_opt_in_at
      when excluded.whatsapp_opt_in then timezone('utc', now())
      else null
    end,
    updated_at = timezone('utc', now())
  returning * into v_customer;

  insert into public.referrals (
    partner_id,
    code,
    landing_path,
    status,
    attributed_at,
    expires_at,
    visit_id,
    customer_id,
    verified_at,
    metadata
  )
  values (
    v_partner.id,
    public.generate_public_code('REF'),
    v_visit.landing_path,
    'active',
    v_visit.created_at,
    v_referral_expires_at,
    v_visit.id,
    v_customer.id,
    timezone('utc', now()),
    jsonb_build_object('source', 'partner_qr')
  )
  returning * into v_referral;

  select greatest(
    v_referral_expires_at,
    coalesce(max(r.expires_at), v_referral_expires_at)
  )
  into v_session_expires_at
  from public.referrals r
  where r.customer_id = v_customer.id
    and r.status = 'active'
    and r.expires_at > timezone('utc', now());

  insert into public.customer_referral_sessions (
    customer_id, token_hash, expires_at
  )
  values (
    v_customer.id, p_session_token_hash, v_session_expires_at
  )
  returning * into v_session;

  update public.referral_contact_verifications
  set verified_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_verification.id;

  insert into public.partner_referral_events (
    event_type, partner_id, visit_id, referral_id, customer_id
  )
  values (
    'contact_verified',
    v_partner.id,
    v_visit.id,
    v_referral.id,
    v_customer.id
  );

  return jsonb_build_object(
    'customer_id', v_customer.id,
    'referral_id', v_referral.id,
    'partner_name', v_partner.name,
    'session_expires_at', v_session.expires_at
  );
end;
$$;

revoke all on function public.verify_referral_contact(text, text)
  from public, anon, authenticated;
grant execute on function public.verify_referral_contact(text, text)
  to service_role;

create or replace function public.get_verified_referral_context(
  p_session_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_session public.customer_referral_sessions%rowtype;
  v_customer public.customers%rowtype;
  v_partners jsonb;
begin
  select *
  into v_session
  from public.customer_referral_sessions
  where token_hash = p_session_token_hash
    and expires_at > timezone('utc', now());

  if not found then
    return null;
  end if;

  select * into v_customer
  from public.customers
  where id = v_session.customer_id;

  update public.customer_referral_sessions
  set last_seen_at = timezone('utc', now())
  where id = v_session.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'referral_id', r.id,
    'partner_id', p.id,
    'partner_name', p.name,
    'partner_slug', p.slug,
    'voucher_percent_basis_points', p.voucher_percent_basis_points,
    'expires_at', r.expires_at
  ) order by r.verified_at), '[]'::jsonb)
  into v_partners
  from public.referrals r
  join public.partners p on p.id = r.partner_id
  where r.customer_id = v_customer.id
    and r.status = 'active'
    and r.expires_at > timezone('utc', now())
    and p.status = 'active';

  return jsonb_build_object(
    'customer', jsonb_build_object(
      'id', v_customer.id,
      'first_name', v_customer.first_name,
      'last_name', v_customer.last_name,
      'email', v_customer.email,
      'phone', v_customer.phone,
      'preferred_language', v_customer.preferred_language
    ),
    'eligible_partners', v_partners,
    'session_expires_at', v_session.expires_at
  );
end;
$$;

revoke all on function public.get_verified_referral_context(text)
  from public, anon, authenticated;
grant execute on function public.get_verified_referral_context(text)
  to service_role;

drop function public.create_experience_booking(
  uuid, integer, text, text, text, text, text, text, boolean, uuid, uuid
);

create function public.create_experience_booking(
  p_availability_slot_id uuid,
  p_party_size integer,
  p_customer_email text,
  p_contact_first_name text,
  p_contact_last_name text,
  p_customer_phone text default null,
  p_preferred_language text default 'en',
  p_special_requests text default null,
  p_terms_accepted boolean default false,
  p_idempotency_key uuid default null,
  p_anonymous_session_id uuid default null,
  p_selected_referral_id uuid default null,
  p_referral_session_token_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_slot public.availability_slots%rowtype;
  v_variant public.experience_variants%rowtype;
  v_experience public.experiences%rowtype;
  v_location public.locations%rowtype;
  v_booking public.bookings%rowtype;
  v_reserved integer;
  v_customer_id uuid;
  v_referral public.referrals%rowtype;
  v_partner public.partners%rowtype;
  v_session public.customer_referral_sessions%rowtype;
  v_expires_at timestamptz;
  v_unit_amount integer;
  v_subtotal_amount integer;
  v_line_quantity integer;
begin
  if p_party_size is null or p_party_size <= 0 then
    raise exception 'INVALID_PARTY_SIZE';
  end if;
  if nullif(trim(p_customer_email), '') is null then
    raise exception 'CUSTOMER_EMAIL_REQUIRED';
  end if;
  if not p_terms_accepted then
    raise exception 'TERMS_NOT_ACCEPTED';
  end if;

  if p_idempotency_key is not null then
    select * into v_booking
    from public.bookings
    where idempotency_key = p_idempotency_key;
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

  if p_selected_referral_id is not null then
    if nullif(trim(p_referral_session_token_hash), '') is null then
      raise exception 'REFERRAL_SESSION_REQUIRED';
    end if;

    select * into v_session
    from public.customer_referral_sessions
    where token_hash = p_referral_session_token_hash
      and expires_at > timezone('utc', now())
    for update;
    if not found then
      raise exception 'REFERRAL_SESSION_INVALID';
    end if;

    select * into v_referral
    from public.referrals
    where id = p_selected_referral_id
      and customer_id = v_session.customer_id
      and status = 'active'
      and expires_at > timezone('utc', now())
    for update;
    if not found then
      raise exception 'REFERRAL_NOT_ELIGIBLE';
    end if;

    select * into v_partner
    from public.partners
    where id = v_referral.partner_id
      and status = 'active';
    if not found then
      raise exception 'REFERRAL_NOT_ELIGIBLE';
    end if;

    select id into v_customer_id
    from public.customers
    where id = v_session.customer_id
      and lower(email) = lower(trim(p_customer_email));
    if v_customer_id is null then
      raise exception 'REFERRAL_CUSTOMER_MISMATCH';
    end if;
  end if;

  select * into v_slot
  from public.availability_slots
  where id = p_availability_slot_id
  for update;
  if not found then raise exception 'SLOT_NOT_FOUND'; end if;
  if v_slot.status <> 'scheduled' then raise exception 'SLOT_NOT_BOOKABLE'; end if;
  if v_slot.starts_at <= timezone('utc', now()) then
    raise exception 'SLOT_ALREADY_STARTED';
  end if;
  if v_slot.booking_cutoff_at is not null
     and v_slot.booking_cutoff_at <= timezone('utc', now()) then
    raise exception 'BOOKING_CUTOFF_PASSED';
  end if;

  select * into v_variant
  from public.experience_variants
  where id = v_slot.experience_variant_id
    and is_active = true;
  if not found then raise exception 'VARIANT_NOT_FOUND'; end if;

  select * into v_experience
  from public.experiences
  where id = v_slot.experience_id
    and status = 'published';
  if not found then raise exception 'EXPERIENCE_NOT_AVAILABLE'; end if;

  if p_party_size < v_variant.min_party_size
     or (v_variant.max_party_size is not null
         and p_party_size > v_variant.max_party_size) then
    raise exception 'PARTY_SIZE_OUT_OF_RANGE';
  end if;

  v_reserved := public.booking_reserved_capacity(v_slot.id);
  if v_reserved + p_party_size > v_slot.capacity_total then
    raise exception 'INSUFFICIENT_CAPACITY';
  end if;

  if v_slot.location_id is not null then
    select * into v_location
    from public.locations
    where id = v_slot.location_id;
  end if;

  v_unit_amount := v_variant.unit_amount_minor;
  if v_variant.pricing_model = 'per_group' then
    v_subtotal_amount := v_unit_amount;
    v_line_quantity := 1;
  else
    v_subtotal_amount := v_unit_amount * p_party_size;
    v_line_quantity := p_party_size;
  end if;

  if v_customer_id is null then
    select id into v_customer_id
    from public.customers
    where lower(email) = lower(trim(p_customer_email))
    order by created_at asc
    limit 1;
  end if;

  v_expires_at := timezone('utc', now()) + interval '20 minutes';

  insert into public.bookings (
    customer_profile_id, customer_id, customer_email,
    contact_first_name, contact_last_name, customer_phone,
    preferred_language, experience_id, experience_variant_id,
    availability_slot_id, location_id, partner_id, referral_id,
    partner_voucher_percent_basis_points_snapshot,
    status, payment_status, currency,
    unit_amount_minor, subtotal_amount_minor, total_amount_minor,
    voucher_amount_minor, party_size, participant_notes, special_requests,
    starts_at_snapshot, ends_at_snapshot, timezone_snapshot,
    experience_title_snapshot, variant_name_snapshot, location_name_snapshot,
    terms_accepted_at, pricing_snapshot, cancellation_policy_snapshot,
    idempotency_key, expires_at, source_channel, booked_at
  )
  values (
    (select auth.uid()), v_customer_id, lower(trim(p_customer_email)),
    trim(p_contact_first_name), trim(p_contact_last_name),
    nullif(trim(p_customer_phone), ''), p_preferred_language,
    v_experience.id, v_variant.id, v_slot.id, v_slot.location_id,
    v_referral.partner_id, v_referral.id,
    v_partner.voucher_percent_basis_points,
    'pending_payment', 'unpaid', v_variant.currency,
    v_unit_amount, v_subtotal_amount, v_subtotal_amount, 0,
    p_party_size, p_special_requests, p_special_requests,
    v_slot.starts_at, v_slot.ends_at, v_slot.timezone,
    v_experience.title, v_variant.name,
    coalesce(v_location.name, v_experience.location_name),
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
      where experience_id = v_experience.id
        and is_active = true
        and policy_type = 'cancellation'
    ), '[]'::jsonb),
    p_idempotency_key, v_expires_at, 'web', timezone('utc', now())
  )
  returning * into v_booking;

  insert into public.booking_price_lines (
    booking_id, line_type, reference_id, label,
    quantity, unit_amount_minor, currency, metadata
  )
  values (
    v_booking.id, 'base', v_variant.id, v_variant.name,
    v_line_quantity, v_unit_amount, v_variant.currency,
    jsonb_build_object(
      'pricing_model', v_variant.pricing_model,
      'party_size', p_party_size
    )
  );

  insert into public.booking_holds (
    availability_slot_id, booking_id, party_size,
    customer_profile_id, anonymous_session_id, expires_at
  )
  values (
    v_slot.id, v_booking.id, p_party_size,
    (select auth.uid()), p_anonymous_session_id, v_expires_at
  );

  insert into public.booking_status_history (
    booking_id, previous_status, new_status, reason
  )
  values (v_booking.id, null, v_booking.status, 'Booking created');

  if v_referral.id is not null then
    update public.referrals
    set status = 'locked',
        locked_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = v_referral.id;

    insert into public.partner_referral_events (
      event_type, partner_id, visit_id, referral_id,
      customer_id, booking_id
    )
    values (
      'booking_attributed',
      v_partner.id,
      v_referral.visit_id,
      v_referral.id,
      v_customer_id,
      v_booking.id
    );
  end if;

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
$$;

revoke all on function public.create_experience_booking(
  uuid, integer, text, text, text, text, text, text, boolean,
  uuid, uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.create_experience_booking(
  uuid, integer, text, text, text, text, text, text, boolean,
  uuid, uuid, uuid, text
) to service_role;

create or replace function public.confirm_paid_booking(
  p_booking_id uuid,
  p_provider_payment_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_booking public.bookings%rowtype;
  v_new_status public.booking_status;
  v_previous_status public.booking_status;
  v_voucher public.vouchers%rowtype;
  v_voucher_amount integer;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  v_previous_status := v_booking.status;

  if v_booking.payment_status = 'paid'
     and v_booking.status in ('confirmed', 'pending_manual_confirmation') then
    select * into v_voucher
    from public.vouchers
    where booking_id = p_booking_id;
    return jsonb_build_object(
      'booking_id', v_booking.id,
      'status', v_booking.status,
      'payment_status', v_booking.payment_status,
      'voucher_id', v_voucher.id,
      'idempotent_replay', true
    );
  end if;

  select case
    when e.manual_confirmation_required
      then 'pending_manual_confirmation'::public.booking_status
    else 'confirmed'::public.booking_status
  end
  into v_new_status
  from public.experiences e
  where e.id = v_booking.experience_id;

  update public.bookings
  set status = v_new_status,
      payment_status = 'paid',
      confirmed_at = case when v_new_status = 'confirmed'
        then timezone('utc', now()) else confirmed_at end,
      expires_at = null,
      metadata = metadata || jsonb_build_object(
        'provider_payment_id', p_provider_payment_id
      ),
      updated_at = timezone('utc', now())
  where id = p_booking_id
  returning * into v_booking;

  update public.booking_holds
  set converted_at = timezone('utc', now())
  where booking_id = p_booking_id
    and converted_at is null;

  insert into public.booking_status_history (
    booking_id, previous_status, new_status, reason
  )
  values (
    p_booking_id, v_previous_status, v_new_status, 'Payment confirmed'
  );

  if v_booking.partner_id is not null
     and v_booking.referral_id is not null
     and v_booking.customer_id is not null
     and coalesce(
       v_booking.partner_voucher_percent_basis_points_snapshot, 0
     ) > 0 then
    v_voucher_amount := round(
      v_booking.total_amount_minor
      * v_booking.partner_voucher_percent_basis_points_snapshot
      / 10000.0
    )::integer;

    insert into public.vouchers (
      code,
      partner_id,
      booking_id,
      customer_profile_id,
      customer_id,
      customer_email,
      qualifying_amount_minor,
      voucher_amount_minor,
      currency,
      status,
      issued_at,
      expires_at,
      metadata
    )
    values (
      public.generate_public_code('VCH'),
      v_booking.partner_id,
      v_booking.id,
      v_booking.customer_profile_id,
      v_booking.customer_id,
      v_booking.customer_email,
      v_booking.total_amount_minor,
      v_voucher_amount,
      v_booking.currency,
      'issued',
      timezone('utc', now()),
      timezone('utc', now()) + interval '30 days',
      jsonb_build_object(
        'referral_id', v_booking.referral_id,
        'reward_basis_points',
          v_booking.partner_voucher_percent_basis_points_snapshot
      )
    )
    on conflict (booking_id) do nothing
    returning * into v_voucher;

    if v_voucher.id is null then
      select * into v_voucher
      from public.vouchers
      where booking_id = v_booking.id;
    else
      insert into public.partner_referral_events (
        event_type, partner_id, referral_id, customer_id,
        booking_id, voucher_id,
        metadata
      )
      values (
        'voucher_issued',
        v_booking.partner_id,
        v_booking.referral_id,
        v_booking.customer_id,
        v_booking.id,
        v_voucher.id,
        jsonb_build_object(
          'qualifying_amount_minor', v_booking.total_amount_minor,
          'voucher_amount_minor', v_voucher_amount
        )
      );
    end if;
  end if;

  return jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'payment_status', v_booking.payment_status,
    'voucher_id', v_voucher.id,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function public.confirm_paid_booking(uuid, text)
  from public, anon, authenticated;
grant execute on function public.confirm_paid_booking(uuid, text)
  to service_role;

create or replace function public.cancel_booking_voucher(
  p_booking_id uuid,
  p_reason text default 'Booking refunded'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_voucher public.vouchers%rowtype;
begin
  select * into v_voucher
  from public.vouchers
  where booking_id = p_booking_id
  for update;

  if not found then
    return jsonb_build_object('cancelled', false, 'reason', 'not_found');
  end if;
  if v_voucher.status = 'cancelled' then
    return jsonb_build_object(
      'cancelled', true,
      'voucher_id', v_voucher.id,
      'idempotent_replay', true
    );
  end if;

  update public.vouchers
  set status = 'cancelled',
      metadata = metadata || jsonb_build_object(
        'cancellation_reason', coalesce(p_reason, 'Booking refunded'),
        'cancelled_at', timezone('utc', now())
      ),
      updated_at = timezone('utc', now())
  where id = v_voucher.id
  returning * into v_voucher;

  insert into public.partner_referral_events (
    event_type, partner_id, customer_id, booking_id, voucher_id,
    metadata
  )
  values (
    'voucher_cancelled',
    v_voucher.partner_id,
    v_voucher.customer_id,
    v_voucher.booking_id,
    v_voucher.id,
    jsonb_build_object('reason', coalesce(p_reason, 'Booking refunded'))
  );

  return jsonb_build_object(
    'cancelled', true,
    'voucher_id', v_voucher.id,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function public.cancel_booking_voucher(uuid, text)
  from public, anon, authenticated;
grant execute on function public.cancel_booking_voucher(uuid, text)
  to service_role;

create or replace view public.admin_partner_performance
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.referral_code,
  p.status,
  p.attribution_window_hours,
  p.voucher_percent_basis_points,
  p.website_url,
  p.created_at,
  coalesce(referral_metrics.referrals_count, 0::bigint) as referrals_count,
  coalesce(booking_metrics.bookings_count, 0::bigint) as bookings_count,
  coalesce(booking_metrics.paid_revenue_minor, 0::bigint)
    as paid_revenue_minor,
  coalesce(voucher_metrics.vouchers_issued, 0::bigint)
    as vouchers_issued,
  coalesce(voucher_metrics.vouchers_redeemed, 0::bigint)
    as vouchers_redeemed,
  coalesce(voucher_metrics.voucher_value_minor, 0::bigint)
    as voucher_value_minor,
  coalesce(visit_metrics.referral_visits, 0::bigint) as referral_visits,
  coalesce(visit_metrics.unique_referral_visitors, 0::bigint)
    as unique_referral_visitors,
  coalesce(referral_metrics.verified_referrals, 0::bigint)
    as verified_referrals,
  case
    when coalesce(visit_metrics.referral_visits, 0) = 0 then 0::numeric
    else round(
      coalesce(booking_metrics.bookings_count, 0)::numeric
      / visit_metrics.referral_visits::numeric * 100,
      2
    )
  end as conversion_percent
from public.partners p
left join lateral (
  select
    count(*)::bigint as referral_visits,
    count(distinct rv.visitor_token_hash)::bigint
      as unique_referral_visitors
  from public.partner_referral_visits rv
  where rv.partner_id = p.id
) visit_metrics on true
left join lateral (
  select
    count(*)::bigint as referrals_count,
    count(*) filter (where r.verified_at is not null)::bigint
      as verified_referrals
  from public.referrals r
  where r.partner_id = p.id
) referral_metrics on true
left join lateral (
  select
    count(*)::bigint as bookings_count,
    coalesce(sum(b.total_amount_minor) filter (
      where b.payment_status = 'paid'
    ), 0::bigint) as paid_revenue_minor
  from public.bookings b
  where b.partner_id = p.id
) booking_metrics on true
left join lateral (
  select
    count(*)::bigint as vouchers_issued,
    count(*) filter (where v.status = 'redeemed')::bigint
      as vouchers_redeemed,
    coalesce(sum(v.voucher_amount_minor) filter (
      where v.status in ('issued', 'redeemed')
    ), 0::bigint) as voucher_value_minor
  from public.vouchers v
  where v.partner_id = p.id
) voucher_metrics on true;

revoke all on public.admin_partner_performance from anon;
grant select on public.admin_partner_performance to authenticated, service_role;
