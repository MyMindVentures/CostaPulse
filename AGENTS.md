# CostaPulse — Coding Agent Rules

Binding instructions for every coding agent working in this repository.

## Stack

Use the established stack only:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- Supabase: PostgreSQL, Auth, Storage and RLS
- Stripe
- Railway
- Zod
- React Hook Form
- Playwright
- Vitest/Jest + React Testing Library

Do not add major frameworks, infrastructure services, UI kits or duplicate libraries without a proven need.

## Mandatory workflow

For every functional feature, work in this order:

```text
Database → Storage → Backend → Frontend → Tests
```

Skip a layer only when it is genuinely unaffected.

Before editing:

1. Read the latest repository files through GitHub.
2. Inspect the real Supabase schema, migrations, RLS and Storage when relevant.
3. Never guess existing files, tables, columns, contracts or configuration.

## Hard guardrails

### No hardcoding

- No hardcoded customer copy, prices, discounts, capacities, durations, locations, URLs, currencies, roles, statuses, locale lists or business rules.
- No magic strings or numbers in production logic.
- Business and editorial content comes from the database through typed backend contracts.
- Secrets and environment-specific values belong in validated environment variables.
- True technical constants must be centralized, named and typed.

### Multilingual by default

- Every customer-facing feature and content model must support every enabled European locale.
- Use one centralized locale registry.
- Every public flow must have an accessible language switcher.
- Switching language must preserve the current route, query parameters, referral attribution and booking context.
- Copy, metadata, validation, emails, dates, times, numbers, currencies, pluralization, alt text and accessibility labels must be localized.
- A feature is incomplete while an enabled locale is missing content.

### No mock production data

- No fake reviews, ratings, bookings, placeholder arrays, static JSON content or runtime fixtures.
- Never use files in Storage buckets as a content database.
- Buckets are for binary assets; their metadata and relationships belong in PostgreSQL.
- Test fixtures may exist only in test code and may never be imported by production code.
- Empty database states must produce real empty states.

### Database and backend are authoritative

- Build frontend flows only against the verified database schema and typed backend contracts.
- All input, authorization and business rules are enforced server-side.
- Prices, availability, capacity, referrals, vouchers, permissions and payment state are recalculated or verified server-side.
- Never trust browser-submitted totals or workflow state.
- Use migrations for schema changes and keep generated types synchronized.
- Never disable RLS or expose privileged keys to the client.

### Storage integrity

- Validate file type, size, ownership and authorization before upload.
- Keep Storage objects and database metadata synchronized.
- Use secure, collision-resistant paths.
- Implement safe replacement, deletion and cleanup.
- Never invent bucket names or policies; inspect them first.

### Design system only

- All frontend code must use the CostaPulse design system, tokens and reusable primitives.
- No arbitrary Tailwind values, inline visual styling, duplicate UI components or one-off visual patterns when a token or primitive exists.
- New patterns must become reusable, accessible design-system components.
- Build mobile-first and target WCAG 2.2 AA.
- Handle loading, empty, error, disabled, focus, validation and responsive states.

### Premium implementation quality

- Prefer typed, secure, maintainable and server-authoritative implementations over shortcuts.
- Keep business logic out of React components.
- Keep server-only code out of client bundles.
- Avoid `any`, dead code, broad utility files and unnecessary abstractions.
- Preserve Railway compatibility and never depend on Vercel-only services.

## Testing

Every changed flow must be tested at the appropriate levels:

- Unit tests for business logic and validation
- Integration tests for database, RLS, authorization, Storage and webhooks
- Component tests for UI states and interactions
- Playwright tests for critical end-to-end journeys

Test happy paths and relevant failures, including authorization, empty states, invalid input, unavailable data, concurrency, localization, mobile behavior, payment failure and duplicate events.

Before completion, run the configured equivalents of:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

Never remove, weaken or skip tests merely to make checks pass.

## Definition of done

A task is complete only when:

- Database, Storage, Backend and Frontend form one coherent typed contract.
- Relevant migrations, constraints, RLS and Storage policies are correct.
- No hardcoded business content, production mocks or bucket-based content remain.
- Every enabled locale is supported and the language switch works.
- The UI follows the design system and works responsively and accessibly.
- Relevant automated tests and build checks pass.
- No secrets, unrelated changes, debug code or unsupported infrastructure entered the repository.

In the final report, state what changed, which layers were inspected, which tests ran and what could not be verified.