# CostaPulse — Frontend

## Purpose

This document records durable frontend structure, conventions and integration rules for the public website, authenticated areas and admin platform.

## Frontend responsibilities

- Present public experiences, services, partners and team members.
- Guide customers through clear booking flows.
- Provide authenticated customer and crew interfaces.
- Provide role-aware admin interfaces.
- Consume confirmed backend contracts and generated database types.
- Handle loading, empty, success and failure states accessibly.

## Required workflow

Before building or changing a feature:

1. Inspect existing routes, components, utilities and design tokens.
2. Inspect the current Supabase schema and generated types.
3. Confirm the backend contract and authorization boundary.
4. Reuse existing components before creating new ones.
5. Implement responsive and accessible states.
6. Validate typecheck, linting, tests and real integration.

Never guess database fields, RPC names, routes or permissions.

## Application areas

### Public website

Includes discovery, experience cards, experience profiles, team profiles, partner referral entry points, the `/why-costapulse` shared-value strategy page and booking journeys. The strategy page consumes the public, RLS-scoped `strategy_cards_public` read model through the strategies repository and maps its nested JSON into frontend view models before rendering.

### Customer area

Includes user-specific bookings, vouchers, confirmations, profile information and permitted actions.

### Crew platform

Includes authenticated crew information and workflows such as assignments and sign-on/sign-off records. Live records are loaded from the database and are never stored as documentation.

### Admin platform

Includes role-aware modules for content, bookings, availability, customers, partners, team, reviews, finance and system administration.

## Component rules

- Prefer reusable domain components over page-specific duplication.
- Keep data fetching and mutation boundaries explicit.
- Do not duplicate backend business logic in client components.
- Use server components or server-side loading where it improves security and performance.
- Keep forms typed and validate on both client and server.
- Provide meaningful error recovery.
- Avoid generic placeholder UI when real domain states are known.

## Routing and navigation

- Use the established Next.js App Router structure.
- Keep public, authenticated and admin layouts clearly separated.
- Enforce protected access server-side.
- Use role-aware navigation for UX while retaining backend enforcement.

## Quality requirements

- Responsive from mobile through desktop.
- Keyboard accessible.
- Semantic HTML and appropriate labels.
- Predictable focus handling in dialogs and forms.
- Fast loading with deliberate skeleton or progress states.
- Clear empty states and actionable errors.
- No silent failures.

## Documentation discipline

Durable frontend decisions belong here or in the design-system document. Component-level implementation details belong in code. Concrete work belongs in GitHub Issues.
