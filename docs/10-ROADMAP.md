# CostaPulse — Roadmap

## Purpose

This document records the durable project direction, current phase, major milestones and known technical debt. Detailed implementation work belongs in GitHub Issues.

## Current direction

CostaPulse is evolving into a premium Costa Blanca platform that combines public experience discovery and booking with customer, partner, team, crew and administrative capabilities.

The immediate architectural priority is to keep the database, secured backend workflows and frontend aligned while consolidating all durable project knowledge in the repository.

## Documentation milestone

- [x] Establish the repository as the official project knowledge base.
- [x] Limit `/docs` to ten numbered documents.
- [ ] Ensure `AGENTS.md` directs coding agents to this structure.
- [ ] Remove or merge obsolete loose documentation files after verifying their useful content has been preserved.
- [ ] Keep `README.md` as a concise human entry point.

## Backend hardening

- [ ] Verify composite relationships between bookings, availability slots, variants and experiences.
- [ ] Review and optimize RLS policies.
- [ ] Consolidate overlapping permissive policies where appropriate.
- [ ] Strengthen privileged authentication and MFA requirements.
- [ ] Add or confirm a central audit-log mechanism.
- [ ] Add purpose-built admin read models.

## Server-side workflows

- [ ] Secure booking creation.
- [ ] Implement or verify checkout-session creation.
- [ ] Implement or verify Stripe webhook processing.
- [ ] Secure confirmation, cancellation and refund workflows.
- [ ] Automate partner voucher issuance.
- [ ] Release expired booking holds.
- [ ] Add reliable notifications and failed-job visibility.

## Admin platform

Recommended sequence:

1. Admin shell and protected access
2. Overview dashboard
3. Bookings
4. Calendar and availability
5. Experiences and media
6. Customers
7. Partners and referrals
8. Finance
9. Team, crew, reviews and content
10. System and security administration

## Public and customer platform

- [ ] Complete reusable global navigation and layout foundations.
- [ ] Complete experience discovery and profile flows.
- [ ] Complete availability and booking journeys.
- [ ] Complete payment confirmation and customer booking access.
- [ ] Complete partner QR referral entry and voucher presentation.

## Crew platform

- [ ] Define and implement authenticated crew profiles.
- [ ] Implement assignments and vessel relationships.
- [ ] Implement sign-on/sign-off records.
- [ ] Add certification and document capabilities where product scope confirms them.
- [ ] Ensure private crew information is protected by role and ownership policies.

## Technical debt

Track only durable themes here. Every actionable item should have a corresponding GitHub Issue when work is scheduled.

Current themes:

- Missing or incomplete secured backend orchestration
- RLS performance and clarity
- Admin read-model coverage
- Auditability of privileged actions
- Consistent reusable frontend foundations
- Deployment, recovery and monitoring documentation

## Updating this roadmap

- Keep this file concise and current.
- Use GitHub Issues for acceptance criteria, implementation notes and task progress.
- Remove completed low-level tasks instead of turning this file into a changelog.
- Add only major milestones, dependencies and lasting technical-debt themes.
