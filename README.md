# CostaPulse

CostaPulse is a premium Costa Blanca experience platform for discovering, booking and managing curated local experiences such as yacht trips, paddlesurf mentoring, kayak sessions and private BBQ services.

The application uses Next.js, React, TypeScript, Supabase, Stripe and Railway. Supabase is the source of truth for live application and business data. The repository is the source of truth for code, technical decisions and durable project knowledge.

## Documentation

CostaPulse has exactly twelve approved documentation files:

- [`README.md`](README.md) — concise human entry point
- [`AGENTS.md`](AGENTS.md) — binding coding-agent guardrails
- [`docs/01-PROJECT-CONTEXT.md`](docs/01-PROJECT-CONTEXT.md) — project identity and context
- [`docs/02-PRODUCT-SCOPE.md`](docs/02-PRODUCT-SCOPE.md) — product domains, roles and capabilities
- [`docs/03-ARCHITECTURE.md`](docs/03-ARCHITECTURE.md) — runtime, routes, boundaries and decisions
- [`docs/04-DATABASE.md`](docs/04-DATABASE.md) — Supabase, schema, RLS and data contracts
- [`docs/05-BACKEND.md`](docs/05-BACKEND.md) — secured workflows and backend rules
- [`docs/06-FRONTEND.md`](docs/06-FRONTEND.md) — frontend architecture and integration
- [`docs/07-DESIGN-SYSTEM.md`](docs/07-DESIGN-SYSTEM.md) — brand, tokens and UI guardrails
- [`docs/08-DEVOPS.md`](docs/08-DEVOPS.md) — local development, Railway, environments and deployment
- [`docs/09-SECURITY.md`](docs/09-SECURITY.md) — security and privacy boundaries
- [`docs/10-ROADMAP.md`](docs/10-ROADMAP.md) — major milestones and technical debt

Do not create additional documentation files. Update the relevant approved file instead. Use GitHub Issues for concrete tasks and Supabase for operational data.

Before implementation, feature work must be structured through [`.github/ISSUE_TEMPLATE/feature.md`](.github/ISSUE_TEMPLATE/feature.md). The issue must define the relevant database, Storage, backend, authorization, routing, user flow, acceptance criteria, tests and definition of done. Mark non-applicable sections explicitly instead of omitting them, and keep every issue atomic.

## Core architecture

```text
Supabase schema / RLS / RPC
  → server repositories and validation
  → typed view models
  → Server Components and feature compositions
  → reusable presentational components
```

Key rules:

1. PostgreSQL and Supabase are authoritative for persistent application data.
2. Next.js App Router is the only routing system.
3. RLS and trusted server code enforce authorization.
4. Secrets, payments, webhooks and privileged mutations remain server-only.
5. Website media is resolved through database-backed media records and Supabase Storage.
6. Features are implemented as complete typed flows: database, backend, frontend and tests.
7. Empty database states render truthful empty UI; production mocks are forbidden.

## Local development

Requirements:

- Node.js 22+
- npm 10+

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Run the complete local quality gate with:

```bash
npm run check
```

Additional commands and environment details are documented in [`docs/08-DEVOPS.md`](docs/08-DEVOPS.md).

## Deployment

Production deploys from `main` to Railway through Railpack and the committed `railway.json`. Supabase hosts PostgreSQL, Auth, Storage and backend database capabilities.

Canonical production URL: `https://www.costapulse.club`