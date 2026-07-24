# CostaPulse premium stack

CostaPulse uses Next.js 16, React 19, strict TypeScript 5, Tailwind CSS 4, shadcn/ui-compatible Radix primitives, Supabase SSR, next-intl, Stripe, Resend, PostHog, Sentry, Zod and React Hook Form. Railway runs the npm-built standalone Next.js server in Docker.

The initialization intentionally implements no commerce features. Integration clients and dependencies are foundations, not permission to create pricing, booking, payment or authorization policy without an owner decision.

Canonical implementation documents live at the repository root: `ARCHITECTURE.md`, `DEPLOYMENT.md`, `RAILWAY.md`, `SUPABASE.md`, and `ENVIRONMENT.md`.
