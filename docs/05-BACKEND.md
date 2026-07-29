# CostaPulse — Backend

## Purpose

This document describes server-side responsibilities, workflow contracts and backend conventions. It does not replace source code or database migrations.

## Backend responsibilities

The backend protects business invariants and orchestrates workflows that must not be performed directly by the browser, including:

- Booking creation and confirmation
- Capacity holds and expiry
- Stripe checkout and webhook processing
- Payment reconciliation
- Cancellations and refunds
- Partner attribution and voucher issuance
- Notifications
- Privileged admin actions
- Audit logging
- Scheduled maintenance jobs

## Security boundary

- Secrets and service-role credentials remain server-side.
- Privileged multi-table mutations use secured functions, server actions or equivalent server-side entry points.
- Every backend entry point validates authentication, authorization and input.
- Frontend role checks are for user experience only and never replace backend enforcement.

## Workflow documentation format

Document durable workflow contracts using:

1. Purpose
2. Trigger
3. Input
4. Authentication and authorization
5. Validation
6. Database actions
7. External side effects
8. Output
9. Failure scenarios
10. Idempotency and audit events

## Booking workflow principles

- Verify that the selected slot, experience and variant belong together.
- Recalculate trusted prices server-side.
- Protect capacity with transactional holds or equivalent locking.
- Preserve booking snapshots.
- Make externally retried operations idempotent.
- Record status transitions and reasons.

## Partner attribution and voucher principles

- Attribution is established from a verified partner identity and preserved with the booking snapshot.
- Voucher eligibility is evaluated only after the booking reaches the required server-authoritative payment and acceptance state.
- Voucher percentage, amount, currency, validity and redemption scope come from current backend configuration or immutable booking/referral snapshots; the frontend must not hardcode them.
- One qualifying booking may create at most one voucher for the attributed partner unless the verified contract explicitly states otherwise.
- Issuance and redemption are idempotent, auditable and protected against duplicate processing.
- A voucher may be redeemed only within its configured scope and only by an authorized actor.
- Refunds and finance corrections must adjust voucher liability through an explicit audited workflow rather than silent mutation.
- Magic links and QR redemption flows expose only scoped, time-limited capabilities and never privileged database or Storage access.

## Booking-story workflow principles

- Booking stories are created only for verified bookings and authorized media.
- Admin mutations control story publication state, media ordering and cover selection.
- Public reads expose only approved and published story data through the verified backend contract.
- Presentational clients never infer publication rights or query protected story records directly.
- File and media access follows the canonical media architecture and Storage authorization rules.

## Credential access and sharing workflow principles

- Admin-authorized users create credential access grants through server actions that validate payloads and call reviewed RPCs.
- Magic-link invitations are sent through Supabase Auth with callback routing to a protected credential portal.
- Authenticated portal reads and tokenized shared reads use separate backend contracts and never expose service-role credentials.
- Shared-link tokens are generated server-side, persisted only as SHA-256 hashes, and resolved through security-definer RPCs.
- File open/download actions are permission-gated in backend contracts before issuing short-lived signed Storage URLs.
- Download and denied-access events are persisted as auditable records.

Current credential workflow entry points:

- server actions in `src/server/credentials/actions.ts` for grant creation, share-link creation, invite resend and revoke;
- callback route `src/app/auth/callback/route.ts` for magic-link code exchange and grant validation;
- secure file link handlers under `/api/credentials/files/[fileId]` and `/api/shared/credentials/[token]/files/[fileId]`.

## Payment principles

- Stripe is the external payment source.
- Supabase stores the operational booking and reconciled payment state.
- Verify webhook signatures.
- Process webhook events idempotently.
- Never trust payment success reported only by the client.
- Refunds require authorization, reason capture and audit logging.

## Team-member availability workflow

- Public calendars call `get_public_team_member_availability` once per bounded visible range. The RPC filters active team members, public visibility, and published linked services or experiences before returning the stable safe projection.
- Effective status is server-authoritative with this precedence: cancelled, confirmed assignment, unavailable, fully booked, partially booked, limited, on request, travelling, available.
- Experience capacity uses `booking_reserved_capacity`, which includes current booking states and active non-expired holds without exposing booking or hold identifiers.
- Admin and owner writes use validated server actions against RLS-protected `team_member_availability`. Conflict checks use the security-invoker `check_team_member_availability_conflicts` RPC.
- Mutations revalidate the public calendar, team-member calendar, affected day route, and admin availability route.

## Error handling

- Return stable machine-readable error codes.
- Avoid exposing secrets, internal stack traces or unnecessary personal data.
- Log enough context to diagnose failures without leaking sensitive values.
- Distinguish validation, authorization, conflict, external dependency and internal errors.

## Candidate server-side workflows

- `create-booking`
- `create-checkout-session`
- `stripe-webhook`
- `confirm-manual-booking`
- `cancel-booking`
- `refund-booking`
- `issue-partner-voucher`
- `release-expired-holds`
- `send-booking-notification`
- `admin-booking-action`

These names describe expected responsibilities and must be reconciled with the actual codebase before implementation.

## Change discipline

When backend behavior changes, update code, tests, contracts and the relevant durable explanation here. Concrete implementation tasks remain in GitHub Issues.
