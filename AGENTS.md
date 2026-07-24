# CostaPulse — Agent Operating Guide

This file is the binding working contract for every AI coding agent and human contributor in the CostaPulse repository.

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
- Which migration, schema, RLS, backend, and frontend validations were performed
- Which checks could not be performed and why

A task is not complete merely because code was generated. The repository and Supabase state must support the implementation.

## 5. Mandatory implementation order

Every feature and functional change must be developed in this order:

```text
1. Database
2. Backend
3. Frontend
4. End-to-end validation
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

### Phase 2 — Backend second

After the database contract is verified:

1. Implement server-side repositories, services, route handlers, server actions, jobs, or webhook handlers.
2. Parse all external input with explicit schemas.
3. Enforce authorization and business rules server-side.
4. Recalculate prices, discounts, voucher amounts, capacity, and booking eligibility from trusted persisted data.
5. Use transactions, constraints, or locks for concurrency-sensitive operations.
6. Return stable typed contracts and predictable errors to the frontend.
7. Keep privileged Supabase and Stripe operations server-only.
8. Add unit and integration tests for business logic, database interaction, authorization, and failure states.
9. Verify backend behavior against the actual Supabase schema using Supabase MCP.

Do not start frontend integration until the backend contract and failure behavior are defined and tested.

### Phase 3 — Frontend third

After database and backend foundations are working:

1. Build the user interface against the real typed backend contract.
2. Never duplicate authoritative business rules in the browser.
3. Treat client calculations as previews only; the server remains authoritative.
4. Implement loading, empty, validation, error, unauthorized, unavailable, sold-out, payment-failure, and success states.
5. Preserve mobile-first behavior, accessibility, localization readiness, and premium visual quality.
6. Do not mock data when a working backend contract is available.
7. Remove temporary mocks before declaring the feature complete.
8. Add component and end-to-end tests for the user journey.

### Phase 4 — End-to-end validation

Before completion:

1. Verify the migration and RLS state through Supabase MCP.
2. Verify backend reads and writes against Supabase.
3. Verify the frontend uses the intended backend contract.
4. Test the complete user journey and critical failure paths.
5. Run linting, formatting, type checking, tests, production build, and production start checks.
6. Use GitHub MCP to review the final repository diff.
7. Confirm Railway compatibility and that no secrets or unrelated changes entered the repository.

### Permitted phase skipping

A phase may be skipped only when the change demonstrably does not touch that layer.

Examples:

- A copy-only text correction may skip database and backend work.
- A pure design-token adjustment may skip database and backend work.
- A database-only index optimization may not require frontend work.

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
  fixtures/
supabase/
  migrations/
  seed.sql
```

Rules:

- Keep route files thin.
- Keep business rules out of React components.
- Never import server-only code into client components.
- Avoid large catch-all utility files.
- Co-locate feature-specific tests and types where practical.
- Add a local `AGENTS.md` only when a directory genuinely needs different rules.

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

A customer benefit created after an eligible referred booking is paid and confirmed. The baseline is 10% of the qualifying booking amount, but percentage and eligibility rules must be configurable.

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
8. The customer receives clear voucher instructions.
9. The partner validates or redeems it through an authenticated or signed flow.

Requirements:

- Referral codes must be opaque and non-sequential.
- Invalid or disabled codes must fail gracefully.
- A query string alone may not overwrite locked booking attribution.
- Attribution windows must be explicit and documented.
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
- Provide meaningful alternative text.
- Use empty alt text for decorative images.
- Maintain sufficient contrast.
- Announce asynchronous errors accessibly.
- Ensure dialogs, date pickers, menus, and carousels manage focus correctly.

## 13. Internationalization

Design for multilingual support from the start. Likely languages are English, Spanish, Dutch, French, and German.

- Do not hard-code copy deep inside reusable components.
- Use locale-aware date, number, and currency formatting.
- Do not concatenate translated sentence fragments.
- Allow text expansion.
- Keep routes and SEO metadata compatible with localized pages.
- Separate canonical and translated content where appropriate.

## 14. SEO

For public pages:

- Use meaningful server-rendered titles and descriptions.
- Add canonical URLs.
- Generate Open Graph metadata.
- Use valid structured data where appropriate.
- Never fabricate ratings or misleading schema.
- Provide indexable experience, location, category, and team profile pages.
- Optimize images and Core Web Vitals.
- Use descriptive URLs and heading structure.
- Include sitemap and robots configuration.

## 15. Data, validation, and API design

- Validate every external input at the server boundary.
- Prefer explicit schemas over loose objects.
- Treat database rows and third-party payloads as untrusted until parsed.
- Return predictable typed errors.
- Never leak stack traces, SQL details, secrets, or internal identifiers.
- Use migrations for every schema change.
- Add indexes based on real query patterns.
- Use RLS wherever Supabase data is reachable through user sessions.
- Keep privileged operations in trusted server code.

## 16. Authentication and authorization

Customer checkout should not require an account without a strong product reason.

For protected areas:

- Use explicit roles such as `customer`, `team_member`, `operator`, `partner`, and `admin`.
- Enforce authorization server-side.
- Never rely on hidden buttons or client route guards as authorization.
- Apply least privilege.
- Strongly protect refunds, voucher redemption, reports, availability changes, and publishing.
- Audit sensitive actions with actor, time, target, and outcome.

## 17. Privacy and legal readiness

Build for GDPR-conscious operation.

- Collect only data needed for booking and delivery.
- Document the purpose of personal-data fields.
- Do not log payment details or unnecessary personal data.
- Support retention and deletion workflows.
- Separate marketing consent from transactional communication.
- Require consent before non-essential analytics or advertising cookies.
- Keep legal copy configurable and versioned where acceptance must be proven.
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
- Never incorrectly cache booking-sensitive or user-specific responses.
- Revalidate availability and pricing at commitment.
- Validate production behavior in Railway's Node.js runtime.

Production-critical logs should include safe identifiers for requests, bookings, payments, experiences, referrals, state transitions, and error categories.

Never log secrets, full card data, access tokens, or unnecessary personal information. Emit logs in a format useful in Railway's log stream.

Track business events such as experience views, availability checks, checkout starts, payment results, booking state changes, referrals, voucher issuance, and voucher redemption. Analytics is never the operational source of truth.

## 19. Testing requirements

Every meaningful change needs effective test coverage.

### Unit tests

Use for pricing, capacity, cancellation deadlines, attribution, vouchers, state transitions, schemas, and time-zone logic.

### Integration tests

Use for database constraints, RLS, booking creation, concurrency, webhooks, voucher issuance, redemption, and authorization.

### End-to-end tests

Protect the revenue-critical flow:

1. Discover an experience.
2. Select date, time, participants, and options.
3. See an accurate total.
4. Enter customer details.
5. Complete payment in test mode.
6. Receive a confirmed booking.
7. Verify referral attribution and voucher issuance when applicable.

Also test payment failure, expired availability, duplicate webhooks, cancellation, refunds, unauthorized access, and mobile usability.

Do not remove or weaken tests merely to make CI pass.

## 20. Code quality

- Use TypeScript strict mode.
- Avoid `any`; justify rare exceptions locally.
- Prefer small named functions and explicit boundary types.
- Use descriptive domain names.
- Avoid premature abstraction.
- Do not duplicate server business logic in the client.
- Keep components focused and composable.
- Comment non-obvious decisions, not obvious syntax.
- Remove dead code.
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

## 21. Environment variables

- Commit a safe `.env.example` with names and comments only.
- Never commit live credentials or personal tokens.
- Validate required variables at startup.
- Separate public variables from server-only variables.
- Use development and test credentials locally.
- Use Railway-managed variables for production secrets and configuration.
- Never assume local `.env` files exist in production.
- Never expose Railway internal variables or server secrets to the browser.

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
- Include migrations, generated types, tests, and documentation required by the change.

Pull requests must explain:

- What changed and why
- User and business impact
- Database and migration changes
- RLS and authorization implications
- Backend contracts
- Screenshots or recordings for UI changes
- Testing performed
- Railway deployment implications
- Risks, assumptions, and follow-up work

## 23. Agent execution protocol

### Before coding

1. Read this file and any nearer `AGENTS.md`.
2. Use GitHub MCP to inspect current repository state and patterns.
3. Use Supabase MCP to inspect all relevant database and authentication state.
4. Identify affected layers: database, backend, frontend, infrastructure, tests, and documentation.
5. Plan the work in the mandatory Database → Backend → Frontend order.
6. Identify revenue, security, data, concurrency, deployment, and UX risks.

### While coding

1. Complete and validate database work first.
2. Complete and validate backend work second.
3. Complete and validate frontend work third.
4. Keep the application runnable after each logical step.
5. Reuse established patterns and primitives.
6. Never invent API behavior, schema, environment values, legal terms, prices, capacity, or availability rules.
7. Add tests alongside behavior.
8. Preserve accessibility, mobile quality, and Railway compatibility.
9. Use GitHub MCP and Supabase MCP throughout, not only at the beginning.
10. Do not make unrelated changes.

### Before finishing

1. Reinspect Supabase schema, migrations, RLS, and relevant data contracts through Supabase MCP.
2. Review the complete GitHub diff through GitHub MCP.
3. Run relevant linting, type checks, tests, production build, and production start checks.
4. Test mobile and desktop UI behavior.
5. Test empty, loading, error, success, unavailable, sold-out, payment, and unauthorized states.
6. Confirm no secrets or sensitive data entered the diff.
7. Confirm Railway `PORT`, runtime, variables, logging, and health-check compatibility.
8. Report files changed, MCP checks performed, tests run, assumptions, and remaining risks.

## 24. Definition of done

A task is done only when:

- The mandatory Database → Backend → Frontend sequence was followed, or unaffected layers were explicitly justified.
- GitHub MCP was used to inspect and validate repository state.
- Supabase MCP was used for every relevant database, authentication, storage, or data-contract concern.
- The requested user outcome works end to end.
- Database constraints and RLS enforce critical invariants.
- Backend business rules and authorization are server-side.
- Frontend code uses stable typed backend contracts.
- Data changes are migration-backed and verified.
- Errors and edge cases are handled clearly.
- Accessibility and responsive behavior are preserved.
- Relevant tests pass.
- Linting, type checking, production build, and production start pass where configured.
- Railway deployment compatibility is preserved.
- Security, privacy, localization, and SEO implications were considered.
- Documentation and `.env.example` are updated when needed.
- GitHub MCP confirms no unrelated files, secrets, debug output, dead code, or Vercel-specific assumptions remain.

## 25. Owner decisions agents must not guess

Surface assumptions when implementation depends on unresolved decisions such as:

- Exact experiences, prices, commissions, deposits, taxes, and currencies
- Voucher percentage, validity, transferability, and redemption rules
- Partner attribution window and commission model
- Automatic versus manual confirmation
- Cancellation and refund terms
- Customer eligibility, age, health, waiver, or licence requirements
- Maritime, tourism, transport, food-service, insurance, and permit requirements
- Service areas and pickup locations
- Weather cancellation policy
- Brand assets and final tone
- Railway regions, domains, scaling, volumes, cron jobs, and service topology

When progress remains possible, isolate uncertain policy behind configuration or a clearly marked interface rather than hard-coding an assumption.

---

**North star:** CostaPulse should make booking an exceptional Costa Blanca experience feel as exciting, clear, and dependable as the experience itself.
