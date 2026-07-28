# CostaPulse — Architecture

## Purpose

This document records the durable technical architecture and major architectural decisions for CostaPulse.

## Current runtime

CostaPulse is a Next.js 16 App Router application using React 19, strict TypeScript, Tailwind CSS 4 and next-intl. Pages are Server Components by default; interactive islands use `"use client"` at the smallest practical boundary.

The production runtime uses Next.js standalone output on Railway. `next.config.ts` enables standalone output, compression, optimized images and baseline response headers. Sentry wraps the configuration and initializes only when `NEXT_PUBLIC_SENTRY_DSN` is present.

## Core stack

- Next.js 16 and React 19
- Strict TypeScript
- Tailwind CSS 4
- next-intl
- Supabase PostgreSQL, Auth, Storage and RLS
- Stripe payments
- Resend transactional email
- PostHog consent-gated analytics
- Sentry error monitoring
- Railway hosting with Railpack
- GitHub for source control, Issues and project knowledge

## Source-of-truth boundaries

- Supabase is the source of truth for schema, permissions and live application data.
- SQL migrations are the source of truth for database evolution.
- Source code is the source of truth for implemented behavior.
- `/docs` explains architecture, conventions and intent.
- GitHub Issues describe concrete work.

## Required implementation order

1. Inspect the existing database, migrations and generated types.
2. Design or change the database deliberately.
3. Implement secured backend logic.
4. Build the frontend on top of confirmed contracts.
5. Validate integration, permissions and failure states.

Agents must never guess a table, field, route, role or backend contract.

## Public routes

| Route                                   | Responsibility                                          |
| --------------------------------------- | ------------------------------------------------------- |
| `/`                                     | Home and catalog teaser                                 |
| `/experiences`                          | Published experience catalog                            |
| `/experiences/map`                      | MapLibre discovery using `get_experience_map`           |
| `/experiences/[slug]`                   | Experience detail and booking widget                    |
| `/destinations`, `/about`, `/partners`  | Marketing pages, currently i18n-backed until CMS-backed |
| `/book`, `/book/[slug]`, success/cancel | Booking wizard and payment outcomes                     |
| `/r/[partnerCode]`                      | Partner QR entry and visit registration                 |
| `/referral/[visitToken]`                | Tokenized contact verification, `noindex`               |
| `/partner/qr/[partnerId]`               | Owner-only printable partner material, `noindex`        |
| `/admin`                                | Role-protected admin dashboard                          |

Operational endpoints such as `/api/health`, `/api/ready`, booking, availability and Stripe webhook routes are not marketing pages.

## Code ownership map

| Path                         | Responsibility                                     |
| ---------------------------- | -------------------------------------------------- |
| `src/app`                    | Thin routes, layouts, loading and error boundaries |
| `src/app/(marketing)`        | Public marketing route group and layout            |
| `src/app/book`               | Booking wizard routes                              |
| `src/app/api`                | Health, readiness, webhooks and trusted API routes |
| `src/features`               | Page and domain compositions                       |
| `src/features/referrals`     | Public referral UI                                 |
| `src/features/partner`       | Partner-owned QR material                          |
| `src/features/admin`         | Admin dashboard composition                        |
| `src/features/analytics`     | Consent and PostHog provider                       |
| `src/features/shell`         | Public AppShell data loading                       |
| `src/components/ui`          | Design-system primitives without business data     |
| `src/components/shared`      | Cross-domain composed UI and universal states      |
| `src/components/layout`      | App shell, navbar and mobile navigation            |
| `src/server/repositories`    | Supabase I/O, validation and boundary mapping      |
| `src/server/auth`            | Role and access helpers                            |
| `src/server/bookings`        | Booking schemas and pricing logic                  |
| `src/server/referrals`       | Hashed tokens, sessions, QR and verification email |
| `src/server/availability`    | Slot filters and summaries                         |
| `src/server/payments`        | Stripe webhook handling                            |
| `src/server/readiness`       | Readiness report assembly                          |
| `src/lib/view-models`        | Pure RPC/database-to-UI mappers                    |
| `src/lib/supabase/server.ts` | Cookie-aware user-scoped client                    |
| `src/lib/supabase/admin.ts`  | Server-only privileged client                      |
| `src/lib/url`                | Typed shareable URL state                          |
| `src/lib/map/config.ts`      | Map style and fallback viewport                    |
| `src/lib/media`              | Storage path resolution                            |
| `src/lib/env`                | Validated environment access                       |
| `src/types/database.ts`      | Generated Supabase types                           |
| `supabase/migrations`        | Schema, RLS, RPCs and Storage policies             |
| `messages`                   | next-intl catalogs                                 |
| `src/i18n`                   | Locale registry                                    |

## Data flow

```text
Supabase schema / RLS / RPC
  → src/server/repositories (query + Zod)
  → src/lib/view-models when shared
  → Server Component or feature composition
  → presentational components with typed props
```

Presentational components never call Supabase directly. Privileged service-role use is restricted to trusted server code through `src/lib/supabase/admin.ts`.

## Integrations and frontend libraries

- `src/lib/integrations.ts` exposes soft-fail server clients for Stripe and Resend.
- Sentry is wired through the instrumentation modules and remains disabled without a DSN.
- PostHog initializes only after analytics consent and when keys exist.
- MapLibre is dynamically loaded for map discovery.
- Storybook 9 documents shared and UI components.
- `sonner`, `embla-carousel-react`, `vaul`, `react-day-picker` and `date-fns` support approved interface patterns.
- Do not add TanStack Query for server-rendered catalog data.
- Do not add `nuqs` while the existing typed catalog-filter utilities cover URL state.

## Rendering and caching

Catalog and detail pages fetch published inventory through repositories. Availability, identity, customer data and booking state must never use public caching. Empty database states render truthful empty UI, never fabricated experiences, prices or reviews.

## Architectural rules

- Prefer one clear implementation over parallel alternatives.
- Reuse established components and utilities.
- Keep privileged credentials server-side.
- Do not place sensitive multi-table mutations in browser code.
- Enforce authorization through RLS and secured backend entry points.
- Preserve historical booking data through snapshots where appropriate.
- Use idempotency for payments and externally retried workflows.
- Record major architectural changes here.

## Decision log

### ADR-001 — Repository as project knowledge base

CostaPulse keeps durable project information, technical memory and DevOps guidance in the repository. Notion and loose documentation files are not part of the official knowledge system.

### ADR-002 — Limited documentation set

The repository is limited to `README.md`, `AGENTS.md` and the ten numbered documents in `/docs`. Existing approved files must be updated instead of creating topic-specific notes or reports.

### ADR-003 — Railway Railpack deployment

Production tracks `main` and deploys through Railway Railpack using `railway.json`. A root deployment Dockerfile is intentionally not used.
