# CostaPulse — Coding Agent Guardrails

Binding instructions for every coding agent working in this repository. Keep this file as the policy source of truth.

## Documentation guardrail

The repository has exactly twelve approved documentation files:

- `README.md`
- `AGENTS.md`
- `docs/01-PROJECT-CONTEXT.md`
- `docs/02-PRODUCT-SCOPE.md`
- `docs/03-ARCHITECTURE.md`
- `docs/04-DATABASE.md`
- `docs/05-BACKEND.md`
- `docs/06-FRONTEND.md`
- `docs/07-DESIGN-SYSTEM.md`
- `docs/08-DEVOPS.md`
- `docs/09-SECURITY.md`
- `docs/10-ROADMAP.md`

Do not create any additional documentation, notes, plans, reports, summaries, instruction files or temporary text files in any format or directory.

This prohibition includes `.md`, `.mdx`, `.txt`, `.rst` and similarly purposed files, including files such as `NOTES.md`, `TODO.md`, `PLAN.md`, `IMPLEMENTATION.md`, feature documentation, architecture variants, generated reports and temporary agent summaries.

When project knowledge changes, update the relevant existing approved document. When work must be planned or tracked, use a GitHub Issue. Live customer, booking, partner, crew and other operational data belongs in Supabase.

Source code, tests, database migrations, configuration files, lockfiles, required framework files and tooling files are not considered documentation files.

Never delete, rename or replace one of the twelve approved documentation files unless the current task explicitly instructs it.

## Role boundary

The coding agent is responsible for frontend implementation only unless the task explicitly grants additional responsibility.

Database architecture, SQL migrations, PostgreSQL functions, RLS policies, Storage buckets and policies, backend contracts, authorization rules, business logic and API design are defined outside the coding agent workflow.

The coding agent must consume that architecture exactly as it exists. It may not redesign, replace, extend or bypass it without explicit written instructions in the current task.

## Read first

Read `AGENTS.md` first, then only the approved documents relevant to the current task:

| Doc                                                      | Purpose                                             |
| -------------------------------------------------------- | --------------------------------------------------- |
| [README.md](README.md)                                   | Concise human entry point                           |
| [docs/01-PROJECT-CONTEXT.md](docs/01-PROJECT-CONTEXT.md) | Project identity and durable context                |
| [docs/02-PRODUCT-SCOPE.md](docs/02-PRODUCT-SCOPE.md)     | Product domains, roles and flows                    |
| [docs/03-ARCHITECTURE.md](docs/03-ARCHITECTURE.md)       | System boundaries and architectural decisions       |
| [docs/04-DATABASE.md](docs/04-DATABASE.md)               | Database intent, relationships and RLS principles   |
| [docs/05-BACKEND.md](docs/05-BACKEND.md)                 | Server-side workflows and contracts                 |
| [docs/06-FRONTEND.md](docs/06-FRONTEND.md)               | Frontend architecture and integration rules         |
| [docs/07-DESIGN-SYSTEM.md](docs/07-DESIGN-SYSTEM.md)     | Visual language and reusable UI principles          |
| [docs/08-DEVOPS.md](docs/08-DEVOPS.md)                   | Development, deployment and infrastructure guidance |
| [docs/09-SECURITY.md](docs/09-SECURITY.md)               | Security boundaries and review requirements         |
| [docs/10-ROADMAP.md](docs/10-ROADMAP.md)                 | Major milestones and durable technical debt         |

## Cursor rules (`.cursor/rules/`)

| Rule                     | Scope                                     |
| ------------------------ | ----------------------------------------- |
| `core-stack.mdc`         | Always — stack, workflow, quality bar     |
| `no-hardcoding.mdc`      | Always — no mocks / magic business values |
| `react-architecture.mdc` | UI / features / app                       |
| `supabase-backend.mdc`   | Server, migrations, Supabase clients      |
| `testing.mdc`            | Test files                                |
| `i18n.mdc`               | Locales and messages                      |
| `design-system.mdc`      | Tokens, `ui` / `shared`, stories          |

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
- Vitest/Jest + React Testing Library

Do not add major frameworks, infrastructure services, UI kits or duplicate libraries without a proven need and explicit approval.

## Mandatory Supabase-first workflow

Before writing, changing or deleting any frontend code, the coding agent must:

1. Inspect the live Supabase project through MCP.
2. Inspect the actual database schema, tables, columns, relationships, constraints, enums, views, functions and RPC contracts relevant to the task.
3. Inspect the actual RLS policies, authentication requirements, Storage buckets, Storage policies and asset paths relevant to the task.
4. Inspect existing migrations and generated Supabase TypeScript types.
5. Inspect the existing backend contracts, server actions, route handlers, data-access modules, validation schemas, hooks, utilities and reusable components.
6. Determine the exact existing contract the frontend must use.
7. Only after completing that inspection, implement the frontend.

Supabase and the existing backend are the single source of truth.

The coding agent must never rely on assumptions, memory, guessed naming conventions or a previously observed schema. Every frontend task starts with a fresh inspection of the current implementation through MCP and the repository.

## Strictly forbidden

The coding agent must never:

- Invent tables, columns, relationships, enums, RPC functions, bucket names, policies, routes, API responses or TypeScript shapes.
- Create mock data, fake reviews, fake ratings, fake bookings, placeholder arrays, static JSON datasets or fabricated backend responses in production code.
- Deliver static mockups, screenshots, prototypes or visual-only implementations when functional frontend work was requested.
- Create buttons, links, forms, filters, menus, calendars, booking flows or interactions that do not work end-to-end.
- Add placeholder handlers, TODO behavior, fake success states or hardcoded fallback records.
- Create or modify migrations, tables, views, functions, RLS policies, Storage buckets, Storage policies, Edge Functions or backend business logic unless the current task explicitly instructs it.
- Bypass RLS, expose privileged keys, move authorization to the browser or trust browser-calculated business state.
- Duplicate existing components, queries, hooks, utilities, schemas, data-access modules or backend behavior.
- Replace an existing working architecture with a preferred alternative.
- Add unsolicited features, redesign flows or make independent product decisions.
- Hardcode customer copy, prices, discounts, capacities, durations, locations, URLs, currencies, roles, statuses, locale lists or business rules.
- Use Storage files as a content database.
- Stop after the interface looks correct without verifying real functionality.
- Create documentation outside the twelve approved documentation files.

Empty database states must render truthful empty states. Missing backend support must be reported as a blocker rather than replaced with invented data or behavior.

## Required implementation behavior

Every frontend implementation must:

- Use real Supabase data through the verified existing backend contract.
- Use generated Supabase types, validated RPC outputs or dedicated Zod schemas.
- Map database responses into intentional typed view models at the backend boundary.
- Keep Supabase clients, queries, authorization and business logic outside presentational components.
- Reuse existing components, hooks, queries, utilities, tokens and design-system primitives.
- Use Server Components by default and add `use client` only at the smallest interactive boundary.
- Implement real loading, empty, error, success, validation, disabled and authorization states.
- Be responsive, accessible and production-ready.
- Preserve all enabled locales and existing route, query, referral and booking context.
- Work correctly for zero, one or many records and missing optional media or metadata.
- Produce no console errors, TypeScript errors, broken routes or dead interactions.
- Update the relevant approved documentation file when a lasting contract, architecture, convention or project fact changes.

## Route discoverability and sitemap

Every new App Router page must be reachable through the website in the same change set.

- Add every new public static page to the verified database-backed site navigation, including translations for every enabled locale.
- Add every new account, partner or admin section page to the appropriate navigation configuration.
- Detail, create, result and other nested flow pages do not need a global navigation item when their nearest static parent section is in navigation and the new page is linked from that real, working section flow.
- Add every new indexable public page to `src/app/sitemap.ts`. Dynamic public pages must be emitted from their real backend records; private, authenticated, transactional, success/cancel and `noindex` pages must not be added.
- Update route information in the relevant approved documentation file and update navigation/sitemap tests when the route surface changes.
- Never ship an orphan page that is only reachable by manually typing its URL.

The staged-page discoverability guardrail runs in pre-commit. Do not bypass it or satisfy it with a dead link, fabricated navigation record or inappropriate sitemap entry.

## Responsive by default

Every frontend implementation must be fully responsive and production-ready across smartphone, tablet, laptop, desktop and large desktop viewports.

Mandatory responsive requirements:

- Build mobile-first.
- Support portrait and landscape orientations where relevant.
- Prevent horizontal scrolling, overflow, clipped content, broken layouts and unreadable text.
- Use responsive typography, spacing, grids, containers, media and component composition.
- Keep navigation, menus, forms, dialogs, drawers, calendars, maps, tables, galleries and booking flows fully usable at every breakpoint.
- Use touch-friendly controls with a minimum target size of 44 × 44 CSS pixels where applicable.
- Preserve keyboard navigation, focus states, screen-reader behavior and reduced-motion support at every breakpoint.
- Do not hide essential functionality on smaller screens without providing an equivalent accessible interaction.
- Do not treat desktop resizing as sufficient validation; verify actual mobile, tablet and laptop layouts.

A frontend feature is incomplete until it has been verified and corrected on representative smartphone, tablet, laptop and desktop viewport sizes.

## Cross-platform and cross-browser correctness

The complete website must render and function correctly across supported operating systems, browsers, input methods and device classes.

Mandatory cross-platform requirements:

- Support current stable versions of Chrome, Safari, Firefox and Edge.
- Verify rendering on macOS, Windows, iOS/iPadOS and Android where the relevant browser engine differs.
- Do not rely on browser-specific APIs, CSS behavior, hover-only interactions or unsupported experimental features without a verified fallback.
- Account for Safari/WebKit differences in viewport units, sticky positioning, scrolling, form controls, date inputs, media playback and safe-area insets.
- Support touch, mouse, keyboard and trackpad interaction without losing functionality.
- Use standards-compliant semantic HTML, CSS and JavaScript.
- Preserve correct hydration and server/client rendering behavior in Next.js.
- Prevent layout shifts, font fallback breakage, missing icons, distorted media and platform-specific overflow.
- Ensure forms, dialogs, menus, navigation, calendars, maps, uploads and checkout flows remain functional across supported platforms.
- Use feature detection and progressive enhancement where platform capabilities differ.
- Do not declare a task complete based on a single browser or operating system.

A frontend feature is incomplete until its critical user flow has been verified in representative Chromium, WebKit and Firefox environments, with platform-specific issues fixed rather than ignored.

## Design system

All frontend code must use the CostaPulse design system, tokens and reusable primitives.

- No arbitrary Tailwind values when a token exists.
- No inline visual styling when a reusable pattern exists.
- No duplicate UI components or page-specific copies of shared patterns.
- New reusable patterns belong in the appropriate shared or design-system layer.
- Build mobile-first and target WCAG 2.2 AA.
- Include keyboard, focus, screen-reader and reduced-motion behavior where relevant.

## Reusable React architecture

UI components must be reusable, composable and driven by typed props rather than page-specific database access.

- Presentational components may not directly query Supabase.
- Fetch and normalize data in server components, route handlers, server actions or dedicated data-access modules.
- Pass stable, serializable view models into UI components.
- Prefer small primitives and domain components that compose across pages.
- Use explicit typed variants for legitimate visual differences.
- Do not duplicate a component because one page needs a small variation.
- Use stable database identifiers as React keys.
- Do not use array indexes when a stable identifier exists.
- Do not create generic abstractions before at least two real use cases exist, unless the abstraction is a foundational design-system primitive.

Recommended separation, adapted to the current repository rather than recreated in parallel:

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

## Frontend data contracts

- Derive frontend types from generated Supabase types, validated RPC outputs or dedicated Zod schemas.
- Never manually recreate database row shapes across multiple files.
- View models expose only what the UI needs and use consistent naming and nullability.
- Centralize query keys, filters, pagination and URL-state parsing.
- Shareable filter state belongs in the URL.
- Media URLs must be resolved through the existing shared media utility or component using verified Storage paths and bucket configuration.
- Dates, times, currencies and localized labels must use shared locale-aware utilities.
- Never rebuild server-authoritative pricing, availability, capacity, referral, voucher, permission or payment logic in React.

## Testing and verification

The coding agent must test the complete requested frontend flow against the actual Supabase project and existing backend. Visual correctness alone is not completion.

Every changed flow must be tested at the appropriate levels:

- Unit tests for frontend transformation and validation logic.
- Component tests for UI states and interactions.
- Integration tests for verified frontend/backend contracts where configured.
- Integration tests for critical end-to-end journeys where configured.

Test representative conditions, including:

- zero, one and multiple records
- missing optional media or metadata
- long translated text
- loading, empty and error states
- invalid input and denied authorization
- keyboard and screen-reader interaction
- smartphone, tablet, laptop, desktop and large desktop layouts
- portrait and landscape orientations where relevant
- no horizontal overflow or clipped content
- touch interactions and minimum target sizes
- Chromium, WebKit and Firefox rendering
- macOS, Windows, iOS/iPadOS and Android behavior where relevant
- mouse, keyboard, touch and trackpad input
- real navigation and route state
- real form submission and server response

Before completion, run the configured equivalents of:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

Never remove, weaken or skip tests merely to make checks pass.

## Definition of done

A frontend task is complete only when:

- The live Supabase project was inspected through MCP before implementation.
- The actual database, Storage and backend contracts were identified and followed exactly.
- The frontend uses real data and real backend behavior.
- No schema, contract, data or behavior was invented.
- No production mocks, placeholder functionality or static mockups remain.
- The requested user flow works end-to-end.
- Every new page is reachable through global navigation or a real navigated parent flow, and every indexable public route is represented correctly in the sitemap.
- Loading, empty, error, validation, success and authorization states work.
- The UI follows the CostaPulse design system and works responsively and accessibly.
- The implementation was verified on representative smartphone, tablet, laptop and desktop viewports.
- The critical flow was verified in Chromium, WebKit and Firefox.
- Platform-specific behavior was checked on representative desktop and mobile operating systems where relevant.
- There is no horizontal overflow, clipped content, broken layout, browser-specific rendering defect or unusable interaction at any supported viewport or platform.
- Repeated UI and domain states use shared components instead of copied implementations.
- Presentational components contain no direct database calls or duplicated business logic.
- Relevant automated tests, type checks and build checks pass.
- No secrets, unrelated changes, debug code or unsupported infrastructure entered the repository.
- No documentation file was created outside the twelve approved files.
- Lasting changes were recorded in the relevant approved documentation file.

## Required final report

The coding agent's final report must state:

1. Which Supabase schema objects, RLS policies, Storage buckets and backend contracts were inspected through MCP.
2. Which existing repository components, types, hooks, queries and utilities were reused.
3. Which frontend files were created or changed.
4. Which approved documentation files were updated, or why no documentation update was required.
5. Which real end-to-end flows were verified.
6. Which smartphone, tablet, laptop and desktop viewport sizes were tested and what responsive issues were fixed.
7. Which browsers, browser engines, operating systems and input methods were verified and what platform-specific issues were fixed.
8. Which commands and tests were run and their results.
9. Anything that could not be verified.
10. Any missing backend capability that blocked implementation, without inventing a workaround.
