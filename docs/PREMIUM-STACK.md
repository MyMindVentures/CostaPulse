# CostaPulse Premium Stack

Canonical stack reference for coding agents. Follow the repository and lockfile; do not substitute equivalent libraries without explicit approval.

## Runtime and application

- Node.js 22+
- npm 10+
- Next.js 16 App Router with standalone Node.js output
- React 19
- TypeScript 5 in strict mode
- Railway deployment through Railpack and `railway.json`

## UI and frontend

- Tailwind CSS 4
- CostaPulse design tokens and reusable design-system components
- shadcn/ui-compatible Radix primitives
- `class-variance-authority`, `clsx`, and `tailwind-merge`
- Lucide icons
- `next-intl` for routing, translations, formatting, and the language switch
- React Hook Form with Zod resolvers for complex forms
- Scope B UX primitives: `sonner` (toasts), `vaul` (drawers), `embla-carousel-react` (galleries), `react-day-picker` + `date-fns` (calendar)

Do not add one-off styling systems, arbitrary UI kits, duplicate component libraries, or hardcoded user-facing copy.

## Data, auth, and storage

- Supabase PostgreSQL
- `@supabase/ssr` and `@supabase/supabase-js`
- Supabase Auth, RLS, migrations, generated types, and Storage
- Zod for all external and backend boundaries

Database and backend contracts are authoritative. Storage contains binary assets only; content and asset metadata belong in PostgreSQL.

## Commerce and communication

- Stripe for payments and webhook-authoritative payment state
- Resend for transactional email

These integrations do not define business policy. Never invent prices, booking rules, refunds, permissions, or email content.

## Observability and analytics

- Sentry for errors and performance monitoring
- PostHog for product analytics

Analytics is never an operational source of truth. Never log secrets or unnecessary personal data.

## Testing and quality

- Vitest
- React Testing Library and jest-dom
- Playwright
- ESLint 9
- Prettier with Tailwind sorting
- Husky + lint-staged + full production-parity check (pre-commit)
- commitlint (conventional commit messages)
- `npm run guardrails` (i18n catalogs, no production mocks, stack deps, companion tests)

Required checks where applicable:

```bash
npm run format:check
npm run guardrails
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Local git hooks: `pre-commit` (secrets + staged formatting/lint + guardrails + repository-wide lint, typecheck, unit tests, and production build), `commit-msg` (commitlint), `pre-push` (typecheck + unit tests). CI still owns Storybook and e2e.

## Agent rules

1. Inspect `package.json`, the lockfile, existing code, and relevant architecture docs before implementation.
2. Use the existing stack and patterns; new dependencies require a documented, unavoidable need.
3. Implement functional work in this order: Database → Storage → Backend → Frontend → Tests.
4. Keep privileged Supabase, Stripe, Resend, and secret-bearing code server-only.
5. Use real typed contracts—no production mocks, placeholder data, bucket content files, duplicated business logic, or invented schemas.
6. Build every frontend change through the CostaPulse design system and `next-intl`.
7. Keep Railway compatibility and standalone production startup intact.
8. Do not mark work complete until affected flows and failure states are tested.

Related canonical docs: `AGENTS.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `RAILWAY.md`, `SUPABASE.md`, and `ENVIRONMENT.md`.
