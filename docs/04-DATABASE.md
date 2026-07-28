# CostaPulse — Database

## Purpose

This document explains the database model, relationships, security conventions and known data-layer decisions. Actual schema changes must be implemented through SQL migrations.

## Source of truth

- Supabase PostgreSQL is the live data source.
- `/supabase/migrations` is the authoritative schema history.
- Generated TypeScript database types must reflect the deployed schema.
- This document summarizes intent and structure; it does not replace migrations.

## Main domains

### Booking engine

The core booking flow is based on:

`experiences → experience_variants → availability_slots → booking_holds → bookings`

Related records may include participants, add-ons, price rules, payments, status history, contact history, waivers, reviews and vouchers.

Bookings should preserve relevant snapshots of experience, variant, location, schedule, pricing and policy information so historical records remain accurate after later content changes.

### Experience content

The model supports experiences, variants, locations, media, itinerary items, requirements, policies, languages, add-ons, hosts, team members, availability and exceptions.

### Partners and vouchers

The intended relationship is:

`partner → referral → booking → voucher`

Attribution windows, voucher percentages and redemption rules must be explicit and auditable.

### Identity and roles

Authentication identities, profiles, public team profiles and authorization roles must remain distinct concerns. Internal permissions are governed by profiles, roles and RLS rather than public team-member content.

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

## Known review areas

- Verify composite foreign keys between bookings, slots, variants and experiences.
- Review RLS performance warnings and overlapping policies.
- Keep authentication security settings aligned with admin risk.
- Ensure server-side workflows exist for sensitive multi-table changes.

## Documentation updates

When a migration changes a major domain, update the relevant section here with the new intent, invariant or relationship. Do not copy full SQL migrations into this document.
