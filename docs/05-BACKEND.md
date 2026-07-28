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

## Payment principles

- Stripe is the external payment source.
- Supabase stores the operational booking and reconciled payment state.
- Verify webhook signatures.
- Process webhook events idempotently.
- Never trust payment success reported only by the client.
- Refunds require authorization, reason capture and audit logging.

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
