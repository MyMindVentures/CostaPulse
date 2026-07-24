# CostaPulse — Agent Operating Guide

This file defines the working contract for AI coding agents and human contributors in the CostaPulse repository.

## 1. Product mission

CostaPulse is a premium booking and discovery platform for authentic Costa Blanca experiences.

The product should make it effortless for visitors to discover, compare, book, pay for, and enjoy carefully selected local experiences, including:

- Yacht charters and skipper-led boating experiences
- Paddleboarding and watersports
- BBQ and private hospitality services
- Outdoor and adventure activities
- Local concierge services
- Partner referrals through trackable QR codes

CostaPulse must feel trustworthy, premium, local, energetic, and easy to use on mobile.

## 2. Product principles

Every implementation decision should support these principles:

1. **Conversion first** — Make the path from discovery to paid booking obvious and frictionless.
2. **Mobile first** — Assume most customers are browsing outdoors or while travelling on a phone.
3. **Trust by design** — Show clear pricing, inclusions, availability, cancellation terms, host identity, reviews, and safety information.
4. **Premium without complexity** — Use polished visuals and interactions without making the interface heavy or confusing.
5. **Local authenticity** — CostaPulse should feel specific to the Costa Blanca, not like a generic marketplace template.
6. **Operational realism** — Booking logic must account for capacity, schedules, locations, weather dependencies, lead times, and manual confirmation where required.
7. **Accessible by default** — Accessibility is part of product quality, not a later enhancement.
8. **Privacy and security by default** — Collect only necessary data and protect all booking, payment, customer, and partner information.

## 3. Default technical direction

Until the repository establishes a different stack, prefer:

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

Do not introduce a major framework, state-management library, UI kit, ORM, or infrastructure dependency without a clear need and a documented trade-off.

## 4. Railway hosting and deployment

CostaPulse is hosted on **Railway**. Railway is the production deployment target and all infrastructure, build, runtime, logging, health-check, and environment-variable decisions must be compatible with Railway.

### Deployment rules

- Treat the application as a long-running Node.js service or container deployed on Railway.
- Ensure the production build and start commands work without Vercel-specific tooling.
- The application must listen on the `PORT` environment variable provided by Railway and bind to `0.0.0.0` when required by the runtime.
- Keep the runtime stateless. Do not rely on the local filesystem for persistent uploads, sessions, generated assets, or operational data.
- Store persistent application data in Supabase or another explicitly approved managed service.
- Store uploaded media in Supabase Storage or another explicitly approved object-storage service, not on Railway's ephemeral application filesystem.
- Use Railway-managed environment variables for production secrets and configuration.
- Emit logs to standard output and standard error so Railway can collect them.
- Add a lightweight health endpoint such as `/api/health` when the app requires deployment health checks.
- Health checks must not expose secrets or detailed internal diagnostics.
- Support graceful shutdown where background work, open connections, or in-flight requests require it.
- Keep deploys reproducible from the repository and lockfile.
- Prefer Railway's native build system unless a Dockerfile is necessary for deterministic builds or system dependencies.
- When a Dockerfile is used, keep it production-focused, minimal, non-root where practical, and compatible with Railway's injected `PORT`.
- Database migrations must run through an explicit, controlled deployment step. Do not make every web process race to execute migrations on startup.
- Stripe webhook routes must use the public Railway production domain or the configured CostaPulse custom domain.
- Configure trusted application URLs through environment variables; never hard-code a temporary Railway deployment URL into business logic.

### Platform restrictions

Do not add or depend on Vercel-specific services or assumptions unless the owner explicitly requests them. This includes:

- Vercel KV
- Vercel Postgres
- Vercel Blob
- Edge Config
- Vercel Cron
- Vercel Analytics as a required operational dependency
- Vercel-specific middleware, routing, deployment APIs, or environment assumptions
- A `vercel.json` file without an explicit requirement

Keep application code platform-agnostic where practical, while treating Railway compatibility as mandatory.

## 5. Repository structure

Prefer a feature-oriented structure that keeps domain logic out of presentation components.

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
  server/                 # Server-only services, repositories, actions
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
- Put business rules in domain services, not React components.
- Do not import server-only code into client components.
- Avoid large catch-all utility files.
- Co-locate feature-specific tests and types where practical.
- Add a short local `AGENTS.md` only when a subdirectory genuinely needs different rules.

## 6. Core domain model

Use clear domain terminology consistently.

### Experience

A bookable offering with a public profile, host/team member, location, media, pricing, duration, capacity, inclusions, requirements, cancellation policy, and availability rules.

### Experience variant

A purchasable configuration of an experience, such as private charter, group session, duration, vessel, package, or add-on combination.

### Availability slot

A bookable start time with capacity and operational status. Availability must be checked server-side immediately before booking is finalized.

### Booking

The customer reservation record. It is the operational source of truth and must not be inferred only from a Stripe payment.

Recommended booking states:

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

Keep payment state separate from booking state.

### Partner

A hospitality business or local partner that promotes CostaPulse through a unique referral link or QR code.

### Referral

An attribution record connecting a partner, customer session, and eventual booking. Referral attribution must survive navigation and must not depend only on client-side state.

### Voucher

A customer benefit generated after an eligible referred booking is successfully paid and confirmed. The intended baseline is 10% of the qualifying booking amount, but the percentage and eligibility rules must be configurable.

Voucher records should include:

- Unique non-guessable code
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

## 7. Booking and payment invariants

These rules are non-negotiable:

- Never trust price, discount, capacity, partner, or voucher values submitted by the browser.
- Recalculate all monetary totals on the server from persisted data.
- Store money in integer minor units and always store the currency.
- Use Stripe webhooks as the authoritative source for payment completion.
- Verify webhook signatures.
- Make webhook handlers idempotent.
- Prevent double booking with a database constraint, transaction, lock, or equivalent concurrency-safe mechanism.
- Never mark a booking confirmed solely because the client returned from a checkout success URL.
- Preserve a full audit trail for cancellations, refunds, voucher issuance, and voucher redemption.
- Use explicit time zones. Store instants in UTC and retain the experience's local IANA time zone.
- Display all customer-facing dates and times in the experience's local time zone unless the user explicitly chooses another.
- Define cancellation deadlines using exact date-time rules, not vague day calculations.
- Do not expose Stripe secret keys, Supabase service-role keys, webhook secrets, or other privileged credentials to the client.

## 8. Partner QR referral flow

The QR partner system is a core CostaPulse growth loop.

Expected flow:

1. A partner receives a unique QR code or referral URL.
2. The visitor opens a branded partner landing experience.
3. The referral identifier is validated server-side and safely persisted.
4. The visitor browses and books an eligible experience.
5. The booking stores the attributed partner and referral source.
6. Payment succeeds and the booking becomes eligible.
7. A voucher is issued exactly once.
8. The customer receives clear voucher instructions.
9. The partner can validate or redeem the voucher through an authenticated or signed flow.

Requirements:

- Referral codes must be opaque and non-sequential.
- Invalid or disabled codes must fail gracefully.
- Never allow a query string alone to overwrite an already locked booking attribution without an explicit rule.
- Define attribution windows and document them.
- Protect voucher redemption against replay and race conditions.
- Provide partner-facing reporting from trusted server-side data.
- Avoid exposing customer personal data to partners unless operationally necessary and legally justified.

## 9. UX and visual system

CostaPulse should feel like a premium Mediterranean experience brand.

### Experience

- Lead with emotional imagery, but keep booking information immediately accessible.
- Make the primary booking CTA visually dominant.
- Show price format clearly: per person, per group, from-price, taxes, deposits, and add-ons.
- Use progressive disclosure for details.
- Provide useful empty, loading, error, unavailable, and sold-out states.
- Never use dark patterns, hidden fees, fake scarcity, or misleading availability.

### Visual direction

Prefer:

- Sunlit Mediterranean imagery
- Deep coastal blue, turquoise, warm sand, white, and selective coral or sunset accents
- Strong editorial typography with highly readable body text
- Generous spacing and restrained motion
- Rounded surfaces used selectively rather than everywhere
- Real photography over generic stock imagery whenever possible

Avoid:

- Generic SaaS dashboards on customer-facing pages
- Excessive gradients, glass effects, neon treatments, and animation
- Low-contrast text over photography
- Decorative UI that slows booking completion

### Responsive design

Validate at minimum:

- 320 px mobile width
- Typical modern phone widths
- Tablet portrait and landscape
- Standard laptop
- Wide desktop

There must be no horizontal scrolling in normal page content.

## 10. Accessibility

Target WCAG 2.2 AA.

Required practices:

- Use semantic HTML before ARIA.
- Ensure complete keyboard navigation.
- Keep visible focus states.
- Associate labels, descriptions, and errors with form controls.
- Do not communicate state through color alone.
- Respect reduced-motion preferences.
- Provide meaningful alternative text for informative images.
- Use empty alt text for purely decorative images.
- Maintain sufficient color contrast.
- Announce asynchronous booking and payment errors accessibly.
- Ensure dialogs, date pickers, menus, and carousels have correct focus behavior.

## 11. Internationalization and localization

Design for multilingual support from the beginning, even when the first release uses one language.

Likely languages include English, Spanish, Dutch, French, and German.

Rules:

- Do not hard-code customer-facing copy deep inside reusable components.
- Use locale-aware formatting for dates, numbers, and currency.
- Do not concatenate translated sentence fragments.
- Allow text expansion without breaking layouts.
- Keep route strategy and SEO metadata compatible with localized pages.
- Store canonical content independently from translated content where appropriate.

## 12. SEO and discoverability

For public pages:

- Use meaningful server-rendered titles and descriptions.
- Add canonical URLs.
- Generate Open Graph and social sharing metadata.
- Use structured data where valid, such as `Product`, `TouristTrip`, `LocalBusiness`, `Person`, `Review`, `BreadcrumbList`, or `FAQPage`.
- Do not generate misleading schema or ratings.
- Provide indexable experience, location, category, and team profile pages.
- Optimize images and Core Web Vitals.
- Use descriptive URLs and heading structure.
- Include sitemap and robots configuration.

## 13. Data, validation, and API design

- Validate every external input at the server boundary.
- Prefer explicit schemas over loose objects.
- Treat database rows and third-party payloads as untrusted until parsed.
- Return predictable typed errors.
- Never leak stack traces, SQL details, secrets, or internal identifiers to customers.
- Use database migrations for every schema change.
- Never edit an already deployed migration to change production history; add a new migration.
- Add indexes based on actual query patterns.
- Use row-level security where Supabase data can be reached through user sessions.
- Keep privileged operations on trusted server code only.

## 14. Authentication and authorization

Customer checkout should not require an account unless there is a strong product reason.

For protected areas:

- Use explicit roles such as `customer`, `team_member`, `operator`, `partner`, and `admin`.
- Enforce authorization server-side for every protected action.
- Never rely on hidden buttons or client route guards as authorization.
- Apply least privilege.
- Require strong controls for refunds, voucher redemption, partner reporting, availability changes, and content publishing.
- Log sensitive operational actions with actor, time, target, and outcome.

## 15. Privacy and legal readiness

Build for GDPR-conscious operation.

- Collect only data needed for booking and service delivery.
- Document the purpose of personal data fields.
- Do not log full payment details or unnecessary personal information.
- Support retention and deletion workflows.
- Make marketing consent explicit and separate from transactional communication.
- Use consent controls before non-essential analytics or advertising cookies.
- Keep legal copy configurable and versioned where acceptance must be proven.
- Treat health, identity, licence, and safety information as sensitive.

Agents must not invent legal guarantees. Flag legal, insurance, licensing, tax, maritime, tourism, or consumer-protection assumptions for owner review.

## 16. Performance standards

- Prefer server components for content-heavy pages.
- Use client components only when interactivity requires them.
- Avoid unnecessary global state.
- Lazy-load non-critical media and scripts.
- Use responsive optimized images with stable dimensions.
- Prevent layout shift.
- Keep third-party scripts minimal.
- Cache public content intentionally, but never cache user-specific or booking-sensitive responses incorrectly.
- Revalidate availability and pricing at the point of commitment.
- Avoid runtime features that require a Vercel Edge environment.
- Validate production behavior in Railway's Node.js runtime.

## 17. Observability

Production-critical flows need structured observability.

Capture:

- Request or correlation identifier
- Booking identifier
- Payment provider identifier
- Experience identifier
- Partner/referral identifier when relevant
- State transition
- Error category
- Safe diagnostic context

Never log secrets, full card data, access tokens, or unnecessary personal information.

Track business events such as:

- Experience viewed
- Availability checked
- Checkout started
- Payment succeeded or failed
- Booking confirmed or cancelled
- Referral attributed
- Voucher issued
- Voucher redeemed

Analytics must not become the source of truth for operational records.

Logs must remain useful in Railway's log stream and should use structured JSON where it materially improves filtering and incident diagnosis.

## 18. Testing requirements

Every meaningful change should include the smallest effective test coverage.

### Unit tests

Use for:

- Pricing calculations
- Capacity rules
- Cancellation deadlines
- Referral attribution
- Voucher calculations and expiry
- State transitions
- Validation schemas
- Date and time-zone logic

### Integration tests

Use for:

- Database constraints and policies
- Booking creation
- Concurrency-sensitive availability
- Stripe webhook handling
- Voucher issuance and redemption
- Authorization boundaries

### End-to-end tests

Protect the revenue-critical journey:

1. Discover an experience.
2. Select date, time, participants, and options.
3. See an accurate total.
4. Enter customer details.
5. Complete payment in test mode.
6. Receive a confirmed booking.
7. Verify partner attribution and voucher issuance when applicable.

Also test payment failure, expired availability, duplicate webhook delivery, cancellation, refund, and mobile usability.

Do not remove, skip, or weaken tests merely to make CI pass.

For deployment-related changes, also verify:

- The production build completes.
- The production start command launches successfully.
- The service listens on Railway's injected `PORT`.
- The health endpoint returns a safe successful response.
- Required environment variables fail fast with clear server-side diagnostics.

## 19. Code quality conventions

- Use TypeScript strict mode.
- Avoid `any`; justify rare exceptions locally.
- Prefer small named functions and explicit types at boundaries.
- Use descriptive domain names instead of abbreviations.
- Avoid premature abstraction.
- Do not duplicate business logic between client and server; server logic is authoritative.
- Keep components focused and composable.
- Add comments for non-obvious decisions, not for obvious syntax.
- Remove dead code rather than commenting it out.
- Keep linting, formatting, type checking, tests, and builds clean.

Suggested commands once the app is initialized:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

Use the package manager already established by the lockfile. Do not create multiple lockfiles.

## 20. Environment variables

- Commit a safe `.env.example` with names and comments only.
- Never commit live credentials or personal tokens.
- Validate required variables at startup.
- Clearly separate public variables from server-only variables.
- Use development and test credentials locally.
- Use Railway-managed environment variables for production configuration and secrets.
- Never assume local `.env` files exist in production.
- Do not expose Railway-provided internal variables to the browser unless explicitly safe and necessary.

Potential categories:

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

These are examples, not permission to add unused configuration. Railway normally injects `PORT`; application code must consume it rather than assigning a fixed production port.

## 21. Git and pull request workflow

Unless instructed otherwise:

- Create focused branches from the current default branch.
- Use concise conventional commit messages.
- Keep commits logically scoped.
- Do not rewrite shared history.
- Never force-push unless explicitly requested and safe.
- Do not mix broad refactors with product features.
- Include migrations, generated types, tests, and documentation required by the change.

Pull requests should explain:

- What changed
- Why it changed
- User and business impact
- Screenshots or recordings for visible UI changes
- Testing performed
- Database or environment changes
- Railway deployment implications
- Risks, assumptions, and follow-up work

## 22. Agent execution protocol

Before coding:

1. Read this file and any nearer `AGENTS.md`.
2. Inspect the repository, package scripts, existing patterns, and current branch.
3. Understand the requested outcome and identify revenue, security, data, deployment, and UX risks.
4. Prefer the smallest coherent implementation that fully solves the request.

While coding:

1. Preserve established architecture and style.
2. Keep the application runnable after each logical step.
3. Reuse existing primitives before creating new ones.
4. Never invent API behavior, environment values, legal terms, pricing, operational capacity, or availability rules.
5. Add or update tests alongside behavior.
6. Maintain accessibility and responsive behavior.
7. Preserve Railway compatibility and avoid Vercel-specific assumptions.
8. Do not make unrelated changes.

Before finishing:

1. Review the diff.
2. Run relevant linting, type checks, tests, production build, and production start checks.
3. Check mobile and desktop behavior for UI work.
4. Check empty, loading, error, success, unavailable, and unauthorized states.
5. Confirm no secrets or sensitive data entered the diff.
6. Confirm Railway runtime, `PORT`, environment-variable, logging, and health-check compatibility for deployment-related work.
7. Summarize changed files, validation performed, assumptions, and remaining risks.

## 23. Definition of done

A task is done only when:

- The requested user outcome works end to end.
- Business rules are enforced server-side.
- Data changes are migration-backed and safe.
- Errors are handled clearly.
- Accessibility and responsive behavior are preserved.
- Relevant tests pass.
- Linting, type checking, production build, and production start pass where configured.
- Railway deployment compatibility is preserved.
- Security, privacy, localization, and SEO implications were considered.
- Documentation and `.env.example` are updated when needed.
- No unrelated code, secrets, debug output, dead code, or Vercel-specific deployment assumptions remain.

## 24. Owner decisions that agents must not guess

Stop and surface the assumption when implementation depends on unresolved decisions such as:

- Exact experiences, prices, commissions, deposits, taxes, and currencies
- Voucher percentage, validity, transferability, and redemption rules
- Partner attribution window and commission model
- Automatic versus manual booking confirmation
- Cancellation and refund terms
- Customer eligibility, age, health, waiver, or licence requirements
- Maritime, tourism, transport, food-service, insurance, and local permit requirements
- Supported service areas and pickup locations
- Weather cancellation policy
- Brand assets and final written tone
- Railway service topology, regions, custom domains, scaling, persistent volumes, cron jobs, and deployment strategy unless already configured in the repository

When progress is still possible, isolate the uncertain policy behind configuration or a clearly marked interface rather than hard-coding an assumption.

---

**North star:** CostaPulse should make booking an exceptional Costa Blanca experience feel as exciting, clear, and dependable as the experience itself.
