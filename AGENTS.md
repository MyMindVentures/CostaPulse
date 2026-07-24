# CostaPulse — Agent Operating Guide

This file is the binding working contract for every AI coding agent and human contributor in the CostaPulse repository.

## 0. Non-negotiable hard guardrails

These rules override convenience, speed, prototypes, temporary shortcuts, and agent preferences. A change that violates any rule below is incomplete and must not be merged.

### 0.1 Nothing hard-coded

- Do not hard-code user-facing copy, prices, percentages, capacities, durations, availability, experience details, locations, contact details, legal text, feature flags, identifiers, URLs, bucket names, storage paths, currencies, locale lists, roles, statuses, or business rules inside components or route handlers.
- Persist business and editorial content in the approved database or content source and expose it through typed backend contracts.
- Store deployment-specific values and secrets in validated environment configuration.
- Keep true technical constants centralized, named, typed, documented, and configurable where business requirements may change.
- Never duplicate authoritative values across database, backend, and frontend.
- No magic strings or magic numbers in production logic.

### 0.2 All content in all supported European languages

- Every customer-facing content model and feature must support all European languages enabled by CostaPulse.
- The supported locale registry must be centralized and configurable; components may not define their own locale lists.
- No feature is complete when any enabled locale falls back to untranslated production copy.
- Database-backed editorial content must use a normalized translation model or another explicitly approved multilingual structure.
- Validation must detect missing, empty, stale, or unpublished translations for every enabled locale.
- Dates, times, numbers, currencies, pluralization, metadata, validation messages, emails, transactional messages, accessibility labels, alt text, and structured content must be locale-aware.
- Machine-generated translations may be used only as reviewable drafts, never silently published as approved content.

### 0.3 Mandatory language switcher

- Every public customer journey must provide a visible, accessible language switcher.
- Switching language must preserve the current page, query parameters, selected experience, referral attribution, booking context, and other safe navigation state.
- The selected locale must persist consistently across navigation and return visits.
- Localized routes, canonical URLs, hreflang links, metadata, sitemap entries, and structured data must stay synchronized.
- Locale detection may suggest a language but must not trap or silently override the customer's explicit choice.

### 0.4 No mock data and no bucket-file content source

- Production code must not use mock records, placeholder arrays, fake reviews, fabricated ratings, demo bookings, static JSON content, fixture content, or locally bundled pseudo-database files.
- Do not read JSON, CSV, Markdown, text, or other files from Supabase Storage buckets as an alternative to a proper database/content model.
- Storage buckets are for approved binary assets such as images, video, documents, and generated exports; their metadata and relationships belong in the database.
- Tests may use isolated factories and fixtures under test-only paths. Test fixtures must never be imported by production code or shipped as runtime fallbacks.
- Empty database states must render deliberate empty states rather than fabricated content.

### 0.5 Database and backend are authoritative

- Every functional frontend flow must be designed from the verified database schema and stable backend contract.
- Frontend code may not query undocumented tables, infer schema, invent fields, bypass authorization, or implement an independent business-rule model.
- All writes go through approved server-side services, route handlers, server actions, or RPCs with validation and authorization.
- Direct browser access to Supabase is allowed only for explicitly approved, RLS-protected read or write paths with a documented reason.
- Prices, discounts, availability, capacity, booking eligibility, referrals, vouchers, payment state, permissions, and workflow transitions are always recalculated or verified server-side.
- Schema migrations, generated database types, backend validators, API contracts, frontend types, and tests must evolve together in one coherent change.

### 0.6 Frontend must use the design system

- All production UI must use approved design tokens, typography, spacing, colors, radii, shadows, breakpoints, icons, motion, and reusable primitives from the CostaPulse design system.
- Do not introduce one-off visual values, inline styling, arbitrary Tailwind values, duplicate components, or unapproved third-party UI patterns when an existing primitive or token applies.
- New visual patterns must first be implemented as reusable design-system primitives with documented variants, states, accessibility behavior, and responsive rules.
- Every component must support loading, empty, error, disabled, focus, hover, active, validation, and responsive states where applicable.
- Visual consistency, WCAG 2.2 AA accessibility, mobile-first behavior, and premium brand quality are release requirements.

### 0.7 Premium stack only

- Use the approved stack defined in this document and established by the repository.
- Do not introduce low-quality shortcuts, abandoned packages, duplicate libraries, client-side-only security solutions, untyped integrations, or infrastructure that conflicts with Railway, Supabase, Stripe, Next.js, or the existing architecture.
- New dependencies require a demonstrated need, active maintenance, acceptable security posture, TypeScript support, bundle/runtime impact review, and compatibility with the current stack.
- Prefer robust, supported, observable, testable, server-authoritative implementations over quick demos.

### 0.8 Every flow must be tested

- Every new or changed user flow requires automated coverage at the correct levels: unit, integration, component, and end-to-end.
- Happy paths alone are insufficient. Test validation, empty states, authorization, unavailable data, concurrency, retries, network/server failures, payment failures, duplicate events, localization, responsive behavior, and accessibility where relevant.
- Revenue-critical flows must run against realistic test database state and approved payment test mode, not UI-only mocks.
- A flow is not complete while tests are skipped, quarantined, weakened, or replaced with manual assertions.
- Lint, formatting, strict type checking, unit/integration tests, Playwright flows, production build, and production start checks must pass before completion where configured.

### 0.9 Database, Storage, Backend, and Frontend must be seamless

Every feature must form one traceable vertical contract:

```text
Database schema and constraints
→ Storage policies and asset metadata when applicable
→ RLS and authorization
→ Server repository/service
→ Validated backend contract
→ Typed frontend integration
→ Design-system UI
→ Automated end-to-end verification
```

- No orphan database fields, storage objects, backend endpoints, frontend controls, or untranslated content.
- Storage uploads must create or update database metadata atomically or through a recoverable workflow.
- Deleting or replacing an asset must preserve referential integrity and clean up obsolete objects safely.
- The frontend must display only states that the backend can actually produce and handle every documented backend error.
- Contract changes must update migrations, policies, generated types, validators, services, UI, and tests together.
- Completion reports must state how all affected layers were inspected, changed, and validated.

## 1. Product mission

CostaPulse is a premium booking and discovery platform for authentic Costa Blanca experiences.

The product should make it effortless for visitors to discover, compare, book, pay for, and enjoy carefully selected local experiences, including:

- Yacht charters and skipper-led boating experiences
- Paddleboarding and watersports
- BBQ and private hospitality services
- Outdoor and adventure activities
- Local concierge services
- Partner referrals through trackable QR codes

CostaPulse must feel trustworthy, premium, local, energetic, and effortless on mobile.

## 2. Product principles

Every decision must support these principles:

1. **Conversion first** — The path from discovery to paid booking must be obvious and frictionless.
2. **Mobile first** — Assume customers are travelling and browsing on a phone.
3. **Trust by design** — Show clear prices, inclusions, availability, policies, host identity, reviews, and safety information.
4. **Premium without complexity** — Use polished visuals without creating a heavy or confusing experience.
5. **Local authenticity** — CostaPulse must feel specific to the Costa Blanca.
6. **Operational realism** — Respect capacity, schedules, locations, weather, lead times, and manual confirmation.
7. **Accessible by default** — Accessibility is part of product quality.
8. **Privacy and security by default** — Collect only necessary data and protect it throughout the system.

## 3. Required technical direction

Unless the repository explicitly establishes a different approved choice, use:

- Next.js with the App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- Supabase for PostgreSQL, authentication, storage, and server-side data access
- Stripe for payments, refunds, and webhook-driven payment state
- Railway for production hosting and deployment
- Zod for runtime validation
- React Hook Form for complex forms
- Playwright for critical end-to-end flows
- Vitest or Jest with React Testing Library for unit and component tests

Do not introduce a major framework, ORM, state-management library, UI kit, infrastructure service, or deployment dependency without a clear need and documented trade-off.

## 4. Mandatory MCP usage

Every coding agent must use the available **Supabase MCP** and **GitHub MCP** as primary sources of truth whenever the task touches their domain.

### GitHub MCP is mandatory

Use GitHub MCP before, during, and after implementation to:

- Inspect the repository, default branch, current files, and established patterns
- Read the nearest `AGENTS.md` files before editing
- Inspect relevant commits, branches, pull requests, issues, and repository configuration when available
- Read the latest version of every file before modifying it
- Avoid overwriting concurrent or newer changes
- Make focused file changes with accurate commit messages
- Review the final diff or compare the resulting commit against its base
- Confirm that only intended files changed

Rules:

- Never work from an assumed or stale repository state.
- Never invent a file, branch, API contract, dependency, or configuration that can be verified through GitHub MCP.
- Never replace an existing file without first reading its latest blob SHA or equivalent current version.
- Do not bypass GitHub MCP by relying only on copied snippets when repository access is available.
- Keep commits focused, reviewable, and free from unrelated changes.

### Supabase MCP is mandatory

Use Supabase MCP for every task involving or potentially affecting:

- Database schemas, tables, columns, relations, constraints, indexes, views, or functions
- Migrations and migration history
- Row-level security policies
- Authentication, users, sessions, or roles
- Storage buckets and storage policies
- Realtime behavior
- Server-side data access
- Booking, payment, voucher, referral, partner, availability, profile, or review data
- Generated database types
- Production or staging data assumptions

Use Supabase MCP to:

- Inspect the actual schema before designing code
- Verify existing migrations before adding a new migration
- Inspect relations, constraints, indexes, RLS policies, functions, and triggers
- Confirm generated types and database contracts
- Apply or verify migrations through the approved Supabase workflow
- Run safe read-only validation queries where appropriate
- Verify that policies and constraints enforce the intended security and business rules
- Confirm that backend code matches the real database rather than an imagined schema

Rules:

- Never guess table names, columns, enum values, policies, relationships, or migration state.
- Never treat TypeScript interfaces as proof of the database schema.
- Never change production data destructively without explicit owner approval.
- Never disable RLS to make development easier.
- Never expose the Supabase service-role key to client-side code.
- Never edit an already deployed migration to rewrite history; create a new migration.
- If Supabase MCP is unavailable, do not invent database facts. Continue only with work that is provably independent of Supabase and clearly report the blocked validation.

### Tool evidence in completion reports

For meaningful feature work, the agent's final report must state:

- What was inspected through GitHub MCP
- What was inspected or changed through Supabase MCP
- Which migration, schema, RLS, storage, backend, frontend, localization, design-system, and end-to-end validations were performed
- Which checks could not be performed and why

A task is not complete merely because code was generated. The repository and Supabase state must support the implementation.

## 5. Mandatory implementation order

Every feature and functional change must be developed in this order:

```text
1. Database
2. Storage and storage policies when applicable
3. Backend
4. Frontend
5. End-to-end validation
```

This is the default and required dependency direction. The frontend must consume stable backend contracts, and the backend must operate against a verified database model.

### Phase 1 — Database first

Before writing backend or frontend code:

1. Use Supabase MCP to inspect the current schema, migrations, constraints, indexes, RLS, functions, triggers, and generated types relevant to the task.
2. Define the data model and invariants required by the feature.
3. Reuse existing tables and columns when they represent the domain correctly.
4. Add a new migration for every schema change.
5. Add appropriate foreign keys, uniqueness rules, checks, indexes, defaults, and timestamps.
6. Add or update RLS policies before exposing data paths.
7. Protect concurrency-sensitive behavior at database level where possible.
8. Regenerate or update database types after schema changes.
9. Validate the migration and resulting schema through Supabase MCP.

Do not proceed to backend implementation while the required database contract is unclear, unsafe, or unverified.

### Phase 2 — Storage second when applicable

After the database contract is verified and before frontend upload or asset rendering work:

1. Inspect actual buckets, object naming conventions, limits, MIME rules, and storage policies through Supabase MCP.
2. Define database metadata and ownership for every uploaded asset.
3. Enforce upload, read, replace, and delete permissions through storage policies and server-side authorization.
4. Use deterministic, collision-resistant object paths without exposing sensitive identifiers unnecessarily.
5. Validate file type, size, ownership, and intended use before accepting uploads.
6. Keep bucket objects and database metadata synchronized through recoverable workflows.
7. Verify signed/public URL behavior, expiry, caching, transformations, replacement, and cleanup.

Do not treat bucket files as editorial or business content records.

### Phase 3 — Backend third

After the database and applicable storage contracts are verified:

1. Implement server-side repositories, services, route handlers, server actions, jobs, or webhook handlers.
2. Parse all external input with explicit schemas.
3. Enforce authorization and business rules server-side.
4. Recalculate prices, discounts, voucher amounts, capacity, and booking eligibility from trusted persisted data.
5. Use transactions, constraints, or locks for concurrency-sensitive operations.
6. Return stable typed contracts and predictable errors to the frontend.
7. Keep privileged Supabase and Stripe operations server-only.
8. Add unit and integration tests for business logic, database interaction, authorization, storage behavior, and failure states.
9. Verify backend behavior against the actual Supabase schema and policies using Supabase MCP.

Do not start frontend integration until the backend contract and failure behavior are defined and tested.

### Phase 4 — Frontend fourth

After database, storage when applicable, and backend foundations are working:

1. Build the user interface against the real typed backend contract.
2. Use only approved design-system tokens and components.
3. Never duplicate authoritative business rules in the browser.
4. Treat client calculations as previews only; the server remains authoritative.
5. Implement loading, empty, validation, error, unauthorized, unavailable, sold-out, payment-failure, and success states.
6. Implement all enabled locales and the language switcher as part of the feature, not as later polish.
7. Preserve mobile-first behavior, accessibility, localization, and premium visual quality.
8. Do not mock data when a working backend contract is available.
9. Remove temporary mocks before declaring the feature complete.
10. Add component and end-to-end tests for the user journey.

### Phase 5 — End-to-end validation

Before completion:

1. Verify migration, RLS, storage, and translation-content state through Supabase MCP.
2. Verify backend reads, writes, uploads, replacements, and deletes against Supabase when applicable.
3. Verify the frontend uses the intended backend contract and design-system primitives.
4. Test the complete user journey in every enabled locale and test critical failure paths.
5. Run linting, formatting, type checking, tests, production build, and production start checks.
6. Use GitHub MCP to review the final repository diff.
7. Confirm Railway compatibility and that no secrets, mocks, hard-coded business content, bucket-content files, arbitrary styling, or unrelated changes entered the repository.

### Permitted phase skipping

A phase may be skipped only when the change demonstrably does not touch that layer.

Examples:

- A correction to an existing translation record may skip schema changes but still requires localization validation.
- A pure design-token adjustment may skip database and backend work.
- A database-only index optimization may not require storage or frontend work.

Even when skipping a phase, the agent must explicitly state why that layer is unaffected. Agents must not label a functional feature as “frontend-only” merely to avoid inspecting its data and backend dependencies.

## 6. Railway hosting and deployment

CostaPulse is hosted on **Railway**. All infrastructure, build, runtime, logging, health-check, and environment-variable decisions must be Railway-compatible.

### Deployment rules

- Treat the application as a long-running Node.js service or container.
- Production build and start commands must work without Vercel tooling.
- Listen on Railway's injected `PORT` and bind to `0.0.0.0` when required.
- Keep the runtime stateless.
- Do not use the local application filesystem for persistent uploads, sessions, generated assets, or operational data.
- Store persistent data in Supabase or another explicitly approved managed service.
- Store media in Supabase Storage or another approved object store.
- Use Railway-managed environment variables for production secrets and configuration.
- Emit logs to standard output and standard error.
- Add a safe lightweight health endpoint such as `/api/health` when needed.
- Support graceful shutdown where background work or open connections require it.
- Keep deploys reproducible from the repository and lockfile.
- Prefer Railway's native build system unless a Dockerfile is necessary.
- Keep Dockerfiles production-focused, minimal, and non-root where practical.
- Run database migrations through an explicit controlled deployment step.
- Do not let every web instance race to execute migrations on startup.
- Configure Stripe webhooks against the production custom domain or Railway domain.
- Never hard-code a temporary Railway deployment URL into business logic.

Do not add Vercel-specific dependencies unless explicitly approved, including:

- Vercel KV, Postgres, Blob, Edge Config, or Cron
- Vercel-specific deployment APIs or environment assumptions
- A `vercel.json` file
- Runtime features that require Vercel Edge

Keep code platform-agnostic where practical, while treating Railway compatibility as mandatory.

## 7. Repository structure

Prefer a feature-oriented structure:

```text
src/
  app/                    # Routes, layouts, route handlers, metadata
  components/
    ui/                   # Reusable design-system primitives
    shared/               # Cross-feature composed components
  features/
    experiences/
    bookings/
    availability/
    payments/
    partners/
    vouchers/
    profiles/
    reviews/
  lib/                    # Shared integrations and infrastructure
  server/                 # Server-only services and repositories
  styles/
  types/
  config/
public/
tests/
  e2e/
  fixtures/               # Test-only; never imported by production runtime
supabase/
  migrations/
  seed.sql                # Development/test setup only; never a production fallback
```

Rules:

- Keep route files thin.
- Keep business rules out of React components.
- Never import server-only code into client components.
- Avoid large catch-all utility files.
- Co-locate feature-specific tests and types where practical.
- Add a local `AGENTS.md` only when a directory genuinely needs stricter or different rules.

## 8. Core domain model

Use consistent domain terminology.

### Experience

A bookable offering with a public profile, host or team member, location, media, pricing, duration, capacity, inclusions, requirements, cancellation policy, and availability rules.

### Experience variant

A purchasable configuration such as a private charter, group session, duration, vessel, package, or add-on combination.

### Availability slot

A bookable start time with capacity and operational status. Recheck availability server-side immediately before commitment.

### Booking

The customer reservation record and operational source of truth.

Recommended states:

```text
draft
pending_payment
payment_processing
confirmed
pending_manual_confirmation
cancelled
completed
refunded
partially_refunded
no_show
```

Keep booking state separate from payment state.

### Partner

A hospitality business or local partner promoting CostaPulse through a unique referral link or QR code.

### Referral

An attribution record connecting a partner, customer session, and eventual booking. Attribution must survive navigation and cannot depend only on client-side state.

### Voucher

A customer benefit created after an eligible referred booking is paid and confirmed. The baseline is 10% of the qualifying booking amount, but percentage and eligibility rules must be configurable and database-backed.

Voucher records should include:

- Non-guessable unique code
- Partner
- Booking
- Customer
- Original qualifying amount
- Voucher value
- Currency
- Issue date
- Expiry date
- Status
- Redemption timestamp

Voucher issuance and redemption must be idempotent and auditable.

## 9. Booking and payment invariants

These rules are non-negotiable:

- Never trust browser-submitted prices, discounts, capacity, partner, or voucher values.
- Recalculate monetary totals on the server from persisted data.
- Store money in integer minor units with currency.
- Use Stripe webhooks as the authority for payment completion.
- Verify webhook signatures and make handlers idempotent.
- Prevent double booking with database-level concurrency protection.
- Never confirm a booking only because the client returned from a checkout success URL.
- Preserve an audit trail for cancellations, refunds, voucher issuance, and redemption.
- Store instants in UTC and retain the experience's local IANA time zone.
- Display customer-facing times in the experience's local time zone unless explicitly changed.
- Define cancellation deadlines with exact date-time rules.
- Never expose Stripe secrets, Supabase service-role keys, webhook secrets, or privileged credentials to the client.

## 10. Partner QR referral flow

Expected flow:

1. A partner receives a unique QR code or referral URL.
2. The visitor opens a branded partner landing experience.
3. The referral identifier is validated server-side and safely persisted.
4. The visitor browses and books an eligible experience.
5. The booking stores the attributed partner and referral source.
6. Payment succeeds and the booking becomes eligible.
7. A voucher is issued exactly once.
8. The customer receives clear localized voucher instructions.
9. The partner validates or redeems it through an authenticated or signed flow.

Requirements:

- Referral codes must be opaque and non-sequential.
- Invalid or disabled codes must fail gracefully.
- A query string alone may not overwrite locked booking attribution.
- Attribution windows must be explicit, configurable, and documented.
- Redemption must resist replay and race conditions.
- Partner reporting must use trusted server-side data.
- Do not expose unnecessary customer personal data to partners.

## 11. UX and visual system

CostaPulse should feel like a premium Mediterranean experience brand.

### Experience rules

- Lead with emotional imagery while keeping booking information accessible.
- Make the primary booking CTA dominant.
- Explain whether prices are per person, per group, starting prices, taxes, deposits, or add-ons.
- Use progressive disclosure.
- Provide useful empty, loading, error, unavailable, and sold-out states.
- Never use hidden fees, fake scarcity, dark patterns, or misleading availability.

### Design-system enforcement

- The design system is the only source of truth for production UI.
- Use semantic tokens rather than raw colors, pixel values, shadows, radii, or typography values.
- Prefer existing primitives and variants; extend the system before creating one-off UI.
- Arbitrary Tailwind values require an explicit documented exception and should normally become a token.
- Do not copy-paste near-identical components between features.
- Every new primitive requires accessibility, responsive, interaction-state, and component tests.

### Visual direction

Prefer:

- Sunlit Mediterranean imagery
- Deep coastal blue, turquoise, warm sand, white, and selective coral or sunset accents
- Strong editorial typography with highly readable body text
- Generous spacing and restrained motion
- Selective rather than excessive rounded surfaces
- Real photography over generic stock imagery

Avoid generic SaaS styling, excessive glass effects, neon treatments, low contrast, and decorative UI that slows booking.

### Responsive validation

Validate at minimum:

- 320 px mobile width
- Typical modern phone widths
- Tablet portrait and landscape
- Standard laptop
- Wide desktop

Normal page content must never scroll horizontally.

## 12. Accessibility

Target WCAG 2.2 AA.

- Use semantic HTML before ARIA.
- Ensure complete keyboard navigation.
- Preserve visible focus states.
- Associate labels, descriptions, and errors with controls.
- Do not communicate state through color alone.
- Respect reduced-motion preferences.
- Provide meaningful localized alternative text.
- Use empty alt text for decorative images.
- Maintain sufficient contrast.
- Announce asynchronous errors accessibly.
- Ensure dialogs, date pickers, menus, and carousels manage focus correctly.

## 13. Internationalization

Internationalization is mandatory architecture, not optional polish.

- Maintain one centralized, typed registry of all enabled European locales.
- Every public and transactional content item must have a validated translation for every enabled locale before publication.
- Do not hard-code copy inside reusable components, pages, route handlers, emails, metadata, or validation schemas.
- Use locale-aware date, time, number, currency, unit, list, and plural formatting.
- Do not concatenate translated sentence fragments.
- Allow significant text expansion and different word order.
- Provide a persistent accessible language switcher across every public flow.
- Preserve route, query, referral, booking, and safe form state when switching language.
- Keep localized routes, canonical URLs, alternate hreflang links, metadata, structured data, sitemap entries, emails, and notifications aligned.
- Separate canonical domain data from translated editorial fields.
- Missing translations must fail validation or block publication; production must not silently display source-language copy.
- Translation completeness must be covered by automated tests.

## 14. SEO

For public pages:

- Use meaningful localized server-rendered titles and descriptions.
- Add canonical URLs and hreflang alternatives.
- Generate localized Open Graph metadata.
- Use valid structured data where appropriate.
- Never fabricate ratings or misleading schema.
- Provide indexable localized experience, location, category, and team profile pages.
- Optimize images and Core Web Vitals.
- Use descriptive localized URLs and heading structure.
- Include synchronized localized sitemap and robots configuration.

## 15. Data, storage, validation, and API design

- Validate every external input at the server boundary.
- Prefer explicit schemas over loose objects.
- Treat database rows, storage metadata, and third-party payloads as untrusted until parsed.
- Return predictable typed errors.
- Never leak stack traces, SQL details, secrets, storage internals, or internal identifiers.
- Use migrations for every schema change.
- Add indexes based on real query patterns.
- Use RLS wherever Supabase data is reachable through user sessions.
- Use storage policies for every bucket and object operation.
- Store asset metadata, ownership, ordering, captions, alt text, locale data, and domain relationships in PostgreSQL rather than content files in buckets.
- Keep privileged operations in trusted server code.

## 16. Authentication and authorization

Customer checkout should not require an account without a strong product reason.

For protected areas:

- Use explicit roles such as `customer`, `team_member`, `operator`, `partner`, and `admin` from one authoritative role model.
- Enforce authorization server-side and through RLS/storage policies where applicable.
- Never rely on hidden buttons or client route guards as authorization.
- Apply least privilege.
- Strongly protect refunds, voucher redemption, reports, availability changes, asset management, translation publishing, and publishing.
- Audit sensitive actions with actor, time, target, and outcome.

## 17. Privacy and legal readiness

Build for GDPR-conscious operation.

- Collect only data needed for booking and delivery.
- Document the purpose of personal-data fields.
- Do not log payment details or unnecessary personal data.
- Support retention and deletion workflows across database and storage.
- Separate marketing consent from transactional communication.
- Require consent before non-essential analytics or advertising cookies.
- Keep legal copy configurable, localized, and versioned where acceptance must be proven.
- Treat health, identity, licence, and safety data as sensitive.

Agents must not invent legal guarantees. Flag legal, insurance, licensing, tax, maritime, tourism, food-service, transport, or consumer-protection assumptions for owner review.

## 18. Performance and observability

- Prefer server components for content-heavy pages.
- Use client components only when interactivity requires them.
- Avoid unnecessary global state.
- Lazy-load non-critical media and scripts.
- Use responsive images with stable dimensions.
- Prevent layout shift.
- Keep third-party scripts minimal.
- Cache public content intentionally.
- Never incorrectly cache booking-sensitive, locale-sensitive, or user-specific responses.
- Revalidate availability and pricing at commitment.
- Validate production behavior in Railway's Node.js runtime.

Production-critical logs should include safe identifiers for requests, bookings, payments, experiences, referrals, state transitions, storage operations, locale, and error categories.

Never log secrets, full card data, access tokens, signed asset URLs, or unnecessary personal information. Emit logs in a format useful in Railway's log stream.

Track business events such as experience views, availability checks, checkout starts, payment results, booking state changes, referrals, voucher issuance, voucher redemption, language changes, and asset-processing failures. Analytics is never the operational source of truth.

## 19. Testing requirements

Every meaningful change and every user flow needs effective automated coverage.

### Unit tests

Use for pricing, capacity, cancellation deadlines, attribution, vouchers, state transitions, schemas, time-zone logic, locale formatting, translation completeness, and storage path generation.

### Integration tests

Use for database constraints, RLS, storage policies, booking creation, concurrency, webhooks, voucher issuance, redemption, authorization, translation publication, and asset lifecycle behavior.

### Component tests

Use for design-system variants, interaction states, forms, language switching, accessibility, errors, loading states, and responsive behavior where practical.

### End-to-end tests

Protect the complete revenue-critical flow in every enabled locale:

1. Select or switch language.
2. Discover an experience from real test database content.
3. Select date, time, participants, and options.
4. See an accurate localized total.
5. Enter customer details.
6. Complete payment in test mode.
7. Receive a confirmed localized booking result.
8. Verify referral attribution and voucher issuance when applicable.

Also test missing translations, payment failure, expired availability, duplicate webhooks, cancellation, refunds, unauthorized access, storage failures, asset replacement/deletion, mobile usability, keyboard operation, and accessible error handling.

Do not remove or weaken tests merely to make CI pass. Do not use production-runtime mocks to satisfy end-to-end coverage.

## 20. Code quality

- Use TypeScript strict mode.
- Avoid `any`; justify rare exceptions locally.
- Prefer small named functions and explicit boundary types.
- Use descriptive domain names.
- Avoid premature abstraction.
- Do not duplicate server business logic in the client.
- Do not duplicate locale registries, design tokens, schemas, or status definitions.
- Keep components focused and composable.
- Comment non-obvious decisions, not obvious syntax.
- Remove dead code, mocks, placeholders, debug output, and temporary fallbacks.
- Keep linting, formatting, type checking, tests, and builds clean.

Suggested commands once configured:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

Use the package manager established by the lockfile. Never create multiple lockfiles.

## 21. Environment variables and configuration

- Commit a safe `.env.example` with names and comments only.
- Never commit live credentials or personal tokens.
- Validate required variables at startup.
- Separate public variables from server-only variables.
- Use development and test credentials locally.
- Use Railway-managed variables for production secrets and deployment-specific configuration.
- Never assume local `.env` files exist in production.
- Never expose Railway internal variables or server secrets to the browser.
- Do not place editorial content or business rules in environment variables when they belong in the database.

Possible categories include:

```text
PORT
NODE_ENV
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

These are examples, not permission to add unused configuration. Railway injects `PORT`; consume it rather than fixing a production port.

## 22. Git and pull request workflow

- Create focused branches from the current default branch unless instructed otherwise.
- Use concise conventional commit messages.
- Keep commits logically scoped.
- Do not rewrite shared history.
- Never force-push unless explicitly requested and safe.
- Do not mix broad refactors with product features.
- Include migrations, storage policies, generated types, translations, design-system changes, tests, and documentation required by the change.

Pull requests must explain:

- What changed and why
- User and business impact
- Database and migration changes
- RLS, storage, and authorization implications
- Backend contracts
- Localization coverage and language-switch behavior
- Design-system components and tokens used or added
- Screenshots or recordings for UI changes
- Automated testing performed for every changed flow
- Railway deployment implications
- Risks, assumptions, and follow-up work

## 23. Agent execution protocol

### Before coding

1. Read this file and any nearer `AGENTS.md`.
2. Use GitHub MCP to inspect current repository state and patterns.
3. Use Supabase MCP to inspect all relevant database, authentication, storage, and translation-content state.
4. Identify affected layers: database, storage, backend, frontend, localization, design system, infrastructure, tests, and documentation.
5. Plan the work in the mandatory Database → Storage → Backend → Frontend → End-to-end order.
6. Identify revenue, security, data, concurrency, localization, accessibility, deployment, and UX risks.
7. Identify and reject any proposed hard-coded values, mock runtime data, bucket-content files, or one-off styling before implementation begins.

### While coding

1. Complete and validate database work first.
2. Complete and validate storage work second when applicable.
3. Complete and validate backend work third.
4. Complete and validate frontend and localization work fourth.
5. Keep the application runnable after each logical step.
6. Reuse established schemas, services, configuration, design-system primitives, and locale infrastructure.
7. Never invent API behavior, schema, environment values, legal terms, prices, capacity, availability rules, translations, or storage structure.
8. Add tests alongside every behavior and flow.
9. Preserve accessibility, mobile quality, premium design, and Railway compatibility.
10. Use GitHub MCP and Supabase MCP throughout, not only at the beginning.
11. Do not make unrelated changes.

### Before finishing

1. Reinspect Supabase schema, migrations, RLS, storage policies, buckets, and relevant data contracts through Supabase MCP.
2. Review the complete GitHub diff through GitHub MCP.
3. Search the diff for hard-coded business content, magic values, mocks, fixture imports, static content files, bucket-content reads, arbitrary visual values, missing translations, and duplicated contracts.
4. Run relevant linting, type checks, unit/integration/component tests, Playwright flows, production build, and production start checks.
5. Test every changed flow in every enabled locale.
6. Test mobile and desktop UI behavior and the language switcher.
7. Test empty, loading, error, success, unavailable, sold-out, payment, storage, and unauthorized states.
8. Confirm no secrets or sensitive data entered the diff.
9. Confirm Railway `PORT`, runtime, variables, logging, and health-check compatibility.
10. Report files changed, MCP checks performed, affected layers, tests run, locale coverage, design-system compliance, assumptions, and remaining risks.

## 24. Definition of done

A task is done only when:

- The mandatory Database → Storage → Backend → Frontend → End-to-end sequence was followed, or unaffected layers were explicitly justified.
- GitHub MCP was used to inspect and validate repository state.
- Supabase MCP was used for every relevant database, authentication, storage, or data-contract concern.
- The requested user outcome works end to end.
- No user-facing or business content is improperly hard-coded.
- No production flow depends on mock data, placeholder data, fixture files, static JSON/Markdown content, or files read from storage buckets as a content database.
- Every enabled European locale is complete and tested, and the language switcher preserves the user journey.
- Database constraints, RLS, and storage policies enforce critical invariants.
- Backend business rules and authorization are server-side.
- Frontend code uses stable typed backend contracts and approved design-system primitives.
- Database, Storage, Backend, and Frontend behavior are traceable and synchronized.
- Data changes are migration-backed and verified.
- Asset metadata and lifecycle remain consistent with storage objects.
- Errors and edge cases are handled clearly.
- Accessibility and responsive behavior are preserved.
- Every changed flow has passing automated coverage.
- Linting, type checking, production build, and production start pass where configured.
- Railway deployment compatibility is preserved.
- Security, privacy, localization, storage, design-system, and SEO implications were validated.
- Documentation and `.env.example` are updated when needed.
- GitHub MCP confirms no unrelated files, secrets, debug output, dead code, mocks, hard-coded business values, arbitrary styling, missing translations, or Vercel-specific assumptions remain.

## 25. Owner decisions agents must not guess

Surface assumptions when implementation depends on unresolved decisions such as:

- Exact experiences, prices, commissions, deposits, taxes, and currencies
- Exact enabled European locales and publication workflow
- Voucher percentage, validity, transferability, and redemption rules
- Partner attribution window and commission model
- Automatic versus manual confirmation
- Cancellation and refund terms
- Customer eligibility, age, health, waiver, or licence requirements
- Maritime, tourism, transport, food-service, insurance, and permit requirements
- Service areas and pickup locations
- Weather cancellation policy
- Brand assets, final tone, and design-token changes
- Storage limits, transformation strategy, retention, and asset moderation
- Railway regions, domains, scaling, volumes, cron jobs, and service topology

When progress remains possible, isolate uncertain policy behind database-backed configuration or a clearly marked typed interface rather than hard-coding an assumption.

---

**North star:** CostaPulse should make booking an exceptional Costa Blanca experience feel as exciting, clear, dependable, multilingual, and technically seamless as the experience itself.