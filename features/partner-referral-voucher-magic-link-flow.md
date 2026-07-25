# Partner Referral Voucher Magic-Link Flow

## Purpose

Build the complete CostaPulse referral voucher flow for bookings that originate from a partner QR code.

The business model is:

- A customer scans a partner QR code.
- The referral is attributed to that partner.
- The customer books and pays for a CostaPulse experience.
- CostaPulse creates a voucher worth 10% of the paid booking amount.
- The voucher is valid only at the referring partner.
- The customer receives a personal magic link by email.
- The voucher page contains a unique QR code.
- The voucher QR code is valid for 30 days.
- The partner scans and redeems the voucher.
- Redeemed vouchers become payable to the partner through the partner payout flow.

Supabase is the single source of truth. Do not redesign or guess the schema. Inspect the current database, RPCs, RLS policies, storage configuration, Edge Functions and generated TypeScript types through Supabase MCP before changing code.

## Core business rules

1. Only bookings with valid partner attribution may create a partner voucher.
2. A voucher is created only after the booking has been definitively paid and accepted according to the current booking workflow.
3. The voucher percentage is 10% of the qualifying paid booking amount, unless the existing booking or referral snapshot already defines the percentage.
4. The historical percentage and calculated amount must remain immutable after voucher issuance, except through an explicit refund or finance correction flow.
5. One qualifying booking creates at most one voucher for the attributed partner.
6. The voucher is valid only at the partner that generated the referral.
7. The voucher is single-use.
8. The voucher expires 30 days after issuance.
9. The customer does not need a password or full customer account to access the voucher page.
10. No raw voucher token, magic-link token or predictable database identifier may be stored or exposed publicly.
11. The voucher must not become payable to the partner until it has been redeemed.
12. Redemption and payout assignment must be transaction-safe and idempotent.

## End-to-end flow

```text
Partner QR code scanned
        ↓
Partner referral visit registered
        ↓
Customer books an experience
        ↓
Booking is paid and confirmed
        ↓
10% voucher is issued
        ↓
Customer receives magic-link email
        ↓
Customer opens personal voucher page
        ↓
Voucher page shows unique QR code
        ↓
Partner scans QR code
        ↓
Server validates voucher and partner
        ↓
Partner confirms redemption
        ↓
Voucher is atomically redeemed
        ↓
Voucher becomes eligible for partner payout
```

## Voucher calculation

Use the definitive qualifying paid booking amount from the existing booking and payment architecture.

```text
voucher amount = qualifying paid booking amount × 10%
```

Example:

```text
Paid booking amount: €250
Voucher percentage: 10%
Voucher value: €25
```

Respect the existing money representation, currency fields, percentage snapshots and rounding conventions. Do not introduce floating-point money calculations.

## Magic-link requirements

The customer receives a personal email containing a link such as:

```text
https://costapulse.club/voucher/{magic-token}
```

Requirements:

- Generate a cryptographically secure random token.
- Store only a one-way hash of the token.
- The token grants access only to the associated voucher page.
- The page must expose only the minimum required booking and customer information.
- The link becomes unusable when the voucher is expired, cancelled or otherwise invalid.
- Track issuance, delivery, first access and last access timestamps where useful.
- Support safe token rotation or reissuing when the email must be sent again.
- Do not expose customer email, phone number, internal booking reference or participant details on the public voucher page.

## Voucher QR-code requirements

The voucher page contains a separate QR code for redemption.

The QR code must not contain:

- the voucher database UUID;
- the voucher amount;
- the customer email;
- the booking reference;
- any predictable sequential identifier.

Use a secure redemption token, for example:

```text
https://costapulse.club/redeem/{redemption-token}
```

Store only the hashed redemption token server-side.

The redemption token must be:

- cryptographically random;
- unique;
- single-use;
- bound to one voucher;
- bound to one partner;
- invalid after expiry, cancellation or redemption.

## Voucher page

The customer-facing voucher page should display:

- voucher value;
- partner name;
- partner logo where available;
- validity end date;
- voucher status;
- QR code;
- single-use notice;
- short redemption instructions;
- the originating experience name;
- safe customer display name only when explicitly appropriate;
- CostaPulse contact support.

Suggested content:

```text
€25 VOUCHER

Valid at
La Plata Casa Matilde

Valid until
24 August 2026

[ UNIQUE QR CODE ]

Single use. Present this QR code at the partner location.
```

## Voucher statuses

Use or extend the existing voucher status model only after inspecting the actual schema.

The flow should support the equivalent of:

```text
issued
redeemed
expired
cancelled
```

Additional operational states may exist, but avoid duplicating an existing status machine.

## Issuance timing

When the voucher is issued:

```text
issued_at = definitive voucher issuance timestamp
expires_at = issued_at + 30 days
```

Issuance must be idempotent. Reprocessing the same successful booking or payment event must never create a second voucher.

## Partner redemption flow

When the partner scans the voucher QR code:

1. Resolve the redemption token server-side.
2. Require an authenticated partner or a secure partner redemption session.
3. Confirm that the current partner owns the voucher.
4. Validate that the partner is active.
5. Validate that the voucher is issued.
6. Validate that the voucher is not expired.
7. Validate that the voucher is not cancelled.
8. Validate that the voucher was not previously redeemed.
9. Display the voucher amount and safe customer context.
10. Require explicit partner confirmation.
11. Redeem the voucher atomically.
12. Store the redemption timestamp and actor.
13. Write an audit record.
14. Mark the voucher as eligible for partner payout.

Two concurrent redemption attempts must never result in double redemption.

## Partner payout integration

The flow must integrate with the existing partner financial backend, including:

- `partner_financial_profiles`;
- `partner_payouts`;
- `partner_payout_items`;
- existing finance and administrator roles;
- bank-detail snapshots;
- payout status tracking.

Financial state progression:

```text
Voucher issued
→ not payable yet

Voucher redeemed
→ payable to the partner

Voucher assigned to payout
→ reserved for payment

Payout paid
→ financially settled
```

A redeemed voucher must not be assigned to more than one active payout.

## Refunds, cancellations and chargebacks

Implement clear server-side rules consistent with the current booking and payment model.

Required behavior:

- Full refund before voucher issuance: do not issue a voucher.
- Full refund after issuance but before redemption: cancel the voucher.
- Partial refund before redemption: recalculate or adjust the voucher through an explicit controlled flow.
- Voucher already redeemed: do not silently cancel it; create a finance or manual-review case.
- Chargeback: block or cancel an unredeemed voucher and prevent payout settlement where possible.
- Cancelled booking before definitive payment: no voucher.
- Duplicate payment webhooks or retries: no duplicate voucher.

Record every financial adjustment in an auditable way.

## Required backend capabilities

Inspect the current Supabase project and add only what is missing.

The backend should provide the equivalent of:

- secure magic-link token generation and hashing;
- secure redemption-token generation and hashing;
- idempotent voucher issuance after a qualifying paid booking;
- 30-day expiry calculation;
- customer-safe voucher read RPC;
- partner-safe redemption preview RPC;
- atomic partner redemption RPC;
- voucher cancellation and expiry handling;
- redemption audit history;
- payout eligibility integration;
- email delivery trigger or Edge Function integration;
- scheduled expiry processing;
- refund and chargeback handling.

Do not allow the browser to perform privileged direct multi-table mutations.

## Suggested secured RPCs or server actions

Use existing RPCs when available. Add new functions only after inspecting the current schema and naming conventions.

Potential capabilities:

```text
issue_partner_voucher_for_booking
get_customer_voucher_by_magic_token
get_partner_voucher_redemption_preview
redeem_partner_voucher
cancel_partner_voucher
expire_partner_vouchers
reissue_voucher_magic_link
```

Exact names and parameters must follow the existing project conventions.

## Email delivery

The voucher email should be triggered only after successful voucher issuance.

Email content should include:

- partner name;
- voucher amount;
- expiry date;
- personal magic link;
- explanation that the voucher is valid only at that partner;
- single-use notice;
- CostaPulse support contact.

The sending process must be idempotent and retry-safe.

Track delivery state where the current contact-event architecture supports it.

## Security

- Store token hashes, never raw tokens.
- Use constant-time-safe token comparison where supported.
- Apply RLS to voucher access paths.
- Public or anonymous voucher reads must occur through a narrowly scoped server function.
- Partner redemption must verify the authenticated partner against the voucher partner.
- Finance and administrator actions must be role-checked server-side.
- Do not expose partner bank details through voucher or redemption APIs.
- Do not trust QR-code payload values without server validation.
- Add rate limiting or abuse protection around token lookup and redemption endpoints.
- Add audit logging for issuance, access, redemption, cancellation, expiry and payout assignment.

## Admin dashboard requirements

Add voucher management to the existing admin dashboard.

Suggested areas:

```text
Partners
  → Partner Detail
    → Vouchers
    → Finance

Bookings
  → Booking Detail
    → Referral
    → Voucher
```

Admin capabilities:

- see the attributed partner;
- see voucher percentage and value;
- see issued, expiry and redemption timestamps;
- see magic-link delivery status;
- resend the magic link;
- cancel an unredeemed voucher;
- inspect audit history;
- see payout eligibility and payout assignment;
- flag exceptions for finance review.

## Partner dashboard requirements

The partner should be able to:

- scan a voucher QR code;
- preview the voucher before confirming;
- redeem a valid voucher;
- see recent redemptions;
- see pending payable voucher value;
- see payout history;
- never see unrelated customer or booking data.

## Customer experience requirements

The voucher page must:

- work without a password;
- be mobile-first;
- show the QR code clearly;
- show the expiry date prominently;
- explain where the voucher is valid;
- display expired, redeemed or cancelled states clearly;
- prevent caching of sensitive tokenized content where appropriate;
- avoid exposing sensitive query parameters in analytics or logs.

## Validation checklist

Before completion, verify:

1. A partner QR referral is attributed correctly.
2. A qualifying paid booking creates exactly one voucher.
3. The voucher value equals the configured percentage of the qualifying paid amount.
4. The voucher expires exactly 30 days after issuance.
5. The customer receives a working personal magic link.
6. Only a hashed magic token is stored.
7. The voucher page exposes no private booking or customer data.
8. The voucher QR code contains a secure redemption token.
9. Only a hashed redemption token is stored.
10. A voucher can be redeemed only by the matching partner.
11. An expired voucher cannot be redeemed.
12. A cancelled voucher cannot be redeemed.
13. A redeemed voucher cannot be redeemed again.
14. Two concurrent scans cannot create duplicate redemption.
15. A redeemed voucher becomes eligible for payout.
16. One voucher cannot be assigned to two payouts.
17. Refund and chargeback scenarios behave safely.
18. Email retries do not create duplicate vouchers.
19. All sensitive actions create audit records.
20. TypeScript checks, linting and production build succeed.

## Coding-agent workflow

1. Inspect the current repository architecture.
2. Inspect Supabase through MCP.
3. Inspect vouchers, referrals, bookings, payment events, partner payouts, contact events, RLS and existing RPCs.
4. Inspect existing Edge Functions and email infrastructure.
5. Implement missing backend capabilities first.
6. Regenerate or update Supabase TypeScript types.
7. Build the admin, partner and customer frontend flows.
8. Reuse existing design tokens, components, auth guards, layouts and data utilities.
9. Run all validation commands.
10. Report every created or changed file, RPC, route and assumption.

Do not create a parallel voucher system. Extend the current CostaPulse booking, referral, voucher and partner-finance architecture only.
