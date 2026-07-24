# CostaPulse — Premium AI-First Webapp Stack

Production-oriented foundation for CostaPulse, a premium Costa Blanca experience platform. The repository follows a secure, maintainable stack designed for fast product development and reliable collaboration with coding agents.

## Premium stack

### Application framework

- **Next.js 16 + React 19** — builds the website, application screens, server-rendered pages and server-side endpoints in one codebase.
- **TypeScript** — catches many programming mistakes before deployment and makes data structures explicit for developers and coding agents.
- **Next.js App Router** — is the single source of truth for pages, layouts, URLs and navigation. Do not introduce React Router alongside it.
- **next-intl** — handles multilingual routes and translated interface text.

### Interface and forms

- **Tailwind CSS 4** — provides responsive, consistent styling without scattered custom CSS.
- **Radix UI primitives + shadcn-style components** — provide accessible building blocks such as dialogs, menus, buttons and form controls while keeping the component source under project control.
- **Lucide React** — supplies a consistent icon set.
- **React Hook Form** — manages forms with little boilerplate and avoids unnecessary rerenders.
- **Zod** — validates user input and external data at runtime on both client and server boundaries.

### Supabase backend

- **Supabase PostgreSQL** — is the central source of truth for operational application data.
- **Supabase Auth** — handles registration, login, sessions and identity. Protected access must also be verified server-side.
- **Supabase Data API** — supports authenticated, policy-controlled database access without a separate Prisma or Express layer by default.
- **Row Level Security (RLS)** — enforces which rows each user or role may read or change, even when frontend code is bypassed.
- **Supabase Storage** — stores images and documents; every bucket and object operation requires explicit access policies.
- **Supabase Realtime** — is reserved for features that genuinely need live updates.
- **Supabase Edge Functions or trusted Next.js server code** — run privileged logic, integrations and secret-bearing operations that must never execute in the browser.

See [SUPABASE.md](SUPABASE.md) for security requirements, client boundaries and the database baseline.

### Integrations and observability

- **Stripe** — processes payments and subscription-related workflows; webhook verification and secret operations remain server-side.
- **Resend** — sends transactional email from trusted server code.
- **Sentry** — records application errors and production diagnostics.
- **PostHog** — measures product usage and user journeys without becoming a source of business-critical state.

### Testing and code quality

- **Vitest** — tests functions, validation rules and application logic quickly.
- **React Testing Library** — tests components through user-visible behaviour rather than implementation details.
- **Playwright** — tests complete browser flows such as authentication, navigation and future booking journeys.
- **ESLint + Prettier** — keep code quality and formatting consistent.
- **`npm run check`** — runs formatting checks, linting, type checking, unit tests and a production build as the local quality gate.

### Hosting and delivery

- **Railway** — hosts the complete Next.js application using Railpack, exposes the health endpoint and terminates public TLS.
- **Supabase** — hosts PostgreSQL, Auth, Storage, the Data API, Realtime and optional Edge Functions.
- **GitHub** — is the source of truth for version control and reviewable changes.
- **GitHub Actions** — should run the same quality gate automatically before changes are accepted or deployed.

## Architecture rules

1. PostgreSQL is the source of truth for persistent business data.
2. Next.js App Router is the only routing system; navigation must use framework links and route layouts rather than custom `activePage` state.
3. Supabase Auth identifies users, while server-side checks and RLS enforce authorization.
4. Every exposed table and Storage bucket uses deny-by-default policies.
5. Secrets, service-role access, payments, webhooks and privileged mutations remain server-only.
6. Server data is not copied into a global UI store without a specific reason.
7. Zod validates input at every trust boundary; TypeScript alone is not runtime validation.
8. Realtime is added only where live updates improve the product.
9. New functionality is delivered as a complete, tested userflow rather than as disconnected frontend screens.
10. Prisma, Express and a second router are not added by default because Supabase and Next.js already cover those responsibilities.

## Standard build order per userflow

1. Describe the user goal, happy path, failure cases and permissions.
2. Design or extend the PostgreSQL schema through a migration.
3. Add indexes, constraints and deny-by-default RLS policies.
4. Define trusted server operations, Edge Functions or external integrations where needed.
5. Implement authentication and authorization checks.
6. Define the App Router route, layout and navigation entry.
7. Build accessible components and forms.
8. Connect data through the appropriate Supabase client or trusted server layer.
9. Validate inputs and outputs with Zod.
10. Test logic, permissions, navigation, refresh behaviour and the complete browser flow.
11. Finish responsive styling, loading states, empty states and error handling.

## Current routes

- `/` — public landing page
- `/admin` — non-indexed dashboard shell (placeholder data only)
- `/api/health` — Railway health probe
- `/sitemap.xml` and `/robots.txt` — search-engine controls

No booking or payment feature is implemented in this initialization.

## Local development

Requirements: Node.js 22 and npm 10 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The landing page and health endpoint work without integration credentials. Add only the values needed for integrations being developed. Run the complete local gate with `npm run check`.

The repository includes a committed `package-lock.json`, so use `npm ci` where reproducible installs are required.

## Production

CostaPulse is hosted exclusively on **Railway** using **Railpack**, not Docker. Railway reads `railway.json`, uses Railpack's Node detection with the `package.json` scripts, injects `PORT`, checks `/api/health`, and terminates public TLS.

The repository default branch and Railway production deployment branch are both `main`.

See [DEPLOYMENT.md](DEPLOYMENT.md), [RAILWAY.md](RAILWAY.md), [ENVIRONMENT.md](ENVIRONMENT.md), and [SUPABASE.md](SUPABASE.md).
