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

### Reusable and data-driven React architecture

- UI components must be reusable, composable and driven by typed props instead of page-specific database access.
- Components render real backend data and must not contain embedded experience, location, team-member, availability or pricing records.
- Fetch and normalize data in server components, route handlers, server actions or dedicated data-access modules; pass stable view models into presentational components.
- Keep Supabase clients, queries, RPC calls, authorization and data transformation outside presentational UI components.
- Prefer small primitives and domain components that can be composed across listing pages, detail pages, map popovers, calendars, booking flows and admin surfaces.
- Use explicit typed variants for legitimate visual differences. Do not duplicate a component because one page needs a slightly different layout.
- Prefer slots, children and narrowly scoped render props over large components with many unrelated boolean flags.
- Repeated domain states must use shared components, including price displays, media, badges, capacity, availability, team-member summaries, location details, loading, empty and error states.
- Server Components are the default. Add `use client` only at the smallest interactive boundary.
- Client components may receive serializable view models and callbacks, but must not import server-only modules or privileged Supabase clients.
- Lists require stable database identifiers as keys. Never use array indexes when a stable ID exists.
- Components must remain correct for zero, one or many records and for missing optional media or metadata.
- Never create generic abstractions before at least two real use cases exist, unless the pattern is a foundational design-system primitive.

### Frontend data contracts

- Derive frontend types from generated Supabase types, validated RPC outputs or dedicated Zod schemas. Do not manually recreate database row shapes in multiple files.
- Map raw database responses into intentional view models at the backend boundary.
- View models must expose only what the UI needs and must use consistent names and nullability.
- Centralize query keys, filters, pagination and URL-state parsing in typed modules.
- Dynamic filters such as date range, experience type, location and team member must be represented in the URL when they affect shareable page state.
- Public map and calendar components must consume the verified `get_experience_map` and `get_experience_calendar` contracts rather than rebuilding availability logic in React.
- Media URLs must be resolved through one shared utility or media component using database storage paths and the verified bucket configuration.
- Dates, times, currencies and localized labels must be formatted through shared locale-aware utilities, never ad hoc inside cards.

### Recommended component layers

Use this separation where relevant:

```text
components/ui/          foundational design-system primitives
components/shared/      cross-domain compositions and universal states
components/experiences/ experience cards, galleries, pricing and detail sections
components/map/         map shell, markers, popovers and map/list synchronization
components/availability/calendar, slots, capacity and date filters
components/team/        team-member cards, avatars and summaries
components/booking/     booking form sections and checkout compositions
lib/supabase/queries/   typed server-side database and RPC access
lib/view-models/        database-to-UI transformations
lib/validation/         shared Zod schemas
```

Adapt this structure to the existing repository rather than creating parallel folders or duplicate conventions.

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

Reusable components must be tested with representative variations, including:

- zero, one and multiple records
- missing optional media or metadata
- long translated text
- loading, empty and error states
- keyboard and screen-reader interaction
- mobile and desktop layouts

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
- Repeated UI and domain states use shared components instead of copied page-specific implementations.
- Presentational components contain no direct database calls or duplicated business logic.
- Relevant automated tests and build checks pass.
- No secrets, unrelated changes, debug code or unsupported infrastructure entered the repository.

In the final report, state what changed, which layers were inspected, which tests ran and what could not be verified.
