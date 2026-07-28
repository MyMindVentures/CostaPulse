# CostaPulse — Security

## Purpose

This document records durable security principles, access boundaries and review requirements for CostaPulse.

## Core principles

- Apply least privilege.
- Enforce authorization server-side.
- Keep secrets out of client code and source control.
- Minimize collection and exposure of personal data.
- Audit sensitive actions.
- Prefer secure defaults and explicit exceptions.

## Authentication

- Use Supabase Auth as the identity layer unless a later architectural decision replaces it.
- Require strong authentication for privileged accounts.
- Enable leaked-password protection where supported.
- Use MFA for administrator, finance and other high-impact roles where practical.
- Protect account recovery and session handling against abuse.

## Authorization

- Use RLS, secured RPC functions and trusted server-side entry points.
- Frontend role checks only improve UX; they are not a security boundary.
- Keep public team profiles separate from internal user permissions.
- Review grants, policies and role mappings whenever a domain changes.

## Secrets

Never expose or commit:

- Supabase service-role keys
- Stripe secret keys
- Webhook signing secrets
- Database passwords
- Private API credentials
- Infrastructure access tokens

Use environment-specific secret management and rotate credentials after suspected exposure.

## Payments and webhooks

- Verify Stripe webhook signatures.
- Process events idempotently.
- Never accept client-reported payment success as authoritative.
- Restrict refunds and financial actions by role.
- Record reasons and audit events for sensitive financial changes.

## Personal and sensitive data

- Collect only data required for product and legal purposes.
- Limit medical, emergency and identity-related information to authorized roles and necessary timeframes.
- Avoid including personal records in logs, issues or documentation.
- Define retention and deletion behavior for personal data.
- Respect applicable GDPR requirements.

## Storage

- Use explicit bucket policies.
- Separate public media from private customer, crew and administrative assets.
- Validate file type, size and ownership.
- Do not rely on unguessable URLs as access control.

## Audit logging

Sensitive actions should record actor, action, entity, timestamp, reason and relevant before/after context where lawful and appropriate. Examples include role changes, refunds, cancellations, publication changes, price changes and voucher redemption.

## Secure development

- Validate all external input.
- Escape or safely render user-controlled content.
- Protect mutations against unauthorized and repeated execution.
- Keep dependencies current through deliberate updates.
- Review security implications of new integrations.
- Do not disclose stack traces, secrets or unnecessary internal details to users.

## Incident response

For a suspected incident:

1. Contain access or disable the affected integration.
2. Preserve relevant logs and evidence.
3. Rotate exposed credentials.
4. Assess affected data and users.
5. Restore safe service.
6. Record durable lessons and preventive changes.

Temporary incident tracking belongs in a restricted issue or appropriate secure system, not in public documentation.

## Review triggers

Review this document when adding roles, payment flows, storage buckets, third-party integrations, sensitive data fields, privileged admin actions or new deployment infrastructure.
