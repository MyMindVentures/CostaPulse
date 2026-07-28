# CostaPulse — Database

## Purpose

This document explains the database model, relationships, security conventions and known data-layer decisions. Actual schema changes must be implemented through SQL migrations.

## Source of truth

- Supabase PostgreSQL is the live data source.
- `/supabase/migrations` is the authoritative schema history.
- Generated TypeScript database types live in `src/types/database.ts` and must reflect the deployed schema.
- This document summarizes intent and structure; it does not replace migrations.

## Supabase clients and keys

Use the project URL and publishable key in browser or user-scoped SSR clients. `SUPABASE_SERVICE_ROLE_KEY` is server-only, bypasses RLS and must never enter public rendering or browser bundles.

The user-scoped SSR client uses `@supabase/ssr` with the Next.js cookie store. The privileged client in `src/lib/supabase/admin.ts` imports `server-only`, disables persistence and refresh, and is instantiated only by trusted server code.

Before operational admin data is exposed, session refresh and route protection must use Supabase claims plus a database-backed role check.

## Main domains

### Booking engine

The core booking flow is:

`experiences → experience_variants → availability_slots → booking_holds → bookings`

Related records include participants, add-ons, price rules, payments, status history, contact history, waivers, reviews and vouchers.

Bookings preserve relevant snapshots of experience, variant, location, schedule, pricing and policy information so historical records remain accurate after later content changes.

### Experience content

The model supports experiences, variants, locations, media, itinerary items, requirements, policies, languages, add-ons, hosts, team members, availability and exceptions.

### Partners and vouchers

The intended relationship is:

`partner → referral → booking → voucher`

Attribution windows, voucher percentages and redemption rules must be explicit and auditable.

#### Referral security boundary

- Browser routes never read private referral, verification, session, event, customer, booking or voucher rows directly.
- `/r/[partnerCode]` records visits through `register_partner_referral_visit`.
- Public landing data is limited to `get_public_referral_landing`.
- Contact-verification and referral-session tokens are random, stored only as SHA-256 hashes and consumed through service-role-only RPCs.
- Booking requests may expose `selectedReferralId`; the secure referral-session cookie is hashed server-side and passed separately to `create_experience_booking`.
- Partner and reward snapshots, voucher calculation, issuance, expiry and refund cancellation remain database-authoritative.

### Identity and roles

Authentication identities, profiles, public team profiles and authorization roles remain distinct concerns. Internal permissions are governed by profiles, roles and RLS rather than public team-member content.

## Canonical data path

```text
Supabase schema / RLS / RPC
  → src/server/repositories (query + Zod validation)
  → src/lib/view-models when shared across surfaces
  → Server Component or feature composition
  → presentational components with typed props only
```

Rules:

1. Do not hand-copy database row shapes into UI files.
2. Repositories own Supabase access and authorization-sensitive reads and writes.
3. View models expose only what the UI needs with consistent nullability.
4. Presentational components must not import Supabase clients, server modules or generated database rows directly.
5. Public map and calendar flows consume `get_experience_map` and `get_experience_calendar` through repositories and view models.
6. After migrations, regenerate types and update Zod and view-model parsers in the same change set.
7. Public strategy cards are loaded through `get_public_strategy_cards(requested_locale text)`; translated strategy rows include role-specific `simple_workflow_steps` JSON arrays and are validated at the repository boundary.

## Database baseline

For every exposed table or backend contract:

1. Create or change it through a reviewed migration.
2. Enable RLS for every table reachable through the Data API.
3. Use deny-by-default policies based on identity, ownership and roles.
4. Put privileged mutations in trusted server code or carefully reviewed security-definer functions.
5. Add indexes used by policy predicates and verified queries.
6. Test anonymous, authenticated, owner, operator and administrator access.

Storage buckets require explicit object policies. Realtime tables require RLS and should only be added to publications when live updates are truly needed.

## Database rules

- Use UUID primary keys unless a strong reason is documented.
- Use foreign keys and explicit constraints for business invariants.
- Store money in integer minor units where applicable.
- Store percentages in basis points where applicable.
- Use UTC timestamps and convert for display at the application edge.
- Avoid destructive schema changes without a migration and recovery plan.
- Add indexes based on verified query patterns.
- Do not expose service-role credentials to clients.

## Row-level security

- RLS must be enabled on user-facing and privileged tables.
- Authorization must be enforced in the database or secured backend, not only in React.
- Prefer stable policy expressions such as `(select auth.uid())` where applicable.
- Consolidate overlapping permissive policies when they obscure access behavior.
- Test anonymous, authenticated, owner and privileged-role access paths.

## Read models

Complex admin and dashboard screens should use purpose-built views or RPC functions instead of joining many normalized tables in browser code. Candidate read models include dashboard summaries, booking queues, booking details, capacity calendars, partner performance, customer summaries and finance summaries.

## Auditability

Sensitive actions such as refunds, role changes, price changes, cancellations, voucher redemption and publication changes should produce durable audit records.

## Type synchronization checklist

1. Add or adjust a migration under `supabase/migrations`.
2. Apply it to the target environment.
3. Regenerate `src/types/database.ts`.
4. Update repository selects, Zod schemas and view-model mappers.
5. Run typecheck and relevant tests.

## Verification

A connection is not proven until configured credentials are used successfully. Verify user-scoped access against a dedicated read-only health contract, and confirm anonymous access is denied unless deliberately allowed. Infrastructure liveness and dependency readiness remain separate concerns.

## Known review areas

- Verify composite foreign keys between bookings, slots, variants and experiences.
- Review RLS performance warnings and overlapping policies.
- Keep authentication security settings aligned with admin risk.
- Ensure server-side workflows exist for sensitive multi-table changes.

## Documentation updates

When a migration changes a major domain, update the relevant section here with the new intent, invariant or relationship. Do not copy full SQL migrations into this document.
