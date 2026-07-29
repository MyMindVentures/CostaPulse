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

The strategy page passes the active locale to `get_public_strategy_cards`, validates exactly five distinct public ecosystem roles, and presents them through a single-open, accessible accordion. Each expanded card renders its translated, database-owned workflow as semantic numbered steps. Stable role anchors such as `#customer-strategy` open the matching panel and retain the sticky-navigation scroll offset; localized display labels must be resolved through the centralized role display map so database role keys are never exposed as customer-facing copy.

### Partner discovery

The public partner directory is an editorial discovery experience rather than an analytics dashboard. Partner cards and map markers are synchronized views of the same selected partner. Selection, filters, sorting and relevant shareable state should remain URL-aware where established, while the map remains usable as an enhancement rather than the only way to access partner content.

Public partner surfaces must use the verified public read model and may not expose private outreach notes, internal performance data or unrestricted customer information.

### Booking stories and previous adventures

Experience detail pages may render approved booking stories as a reusable public section. The frontend must:

- consume only the verified published story contract;
- keep public story media tied to the related experience;
- support image and video presentation where the backend allows it;
- provide an accessible fullscreen or focused viewer with keyboard, touch and reduced-motion behavior;
- preserve truthful empty and unavailable states;
- avoid duplicating admin or publication logic in React.

Admin story management must reuse the established media and upload architecture for record editing, media ordering and cover selection.

### Customer area

Includes user-specific bookings, vouchers, confirmations, profile information and permitted actions.

### Crew platform

Includes authenticated crew information and workflows such as assignments and sign-on/sign-off records. Live records are loaded from the database and are never stored as documentation.

### Credential portals

Credential-sharing surfaces are split between authenticated and tokenized routes:

- Authenticated portal routes: `/portal/credentials` and `/portal/credentials/[documentId]`
- Shared token routes: `/shared/credentials/[token]` and `/shared/credentials/[token]/[documentId]`
- Secure file-link handlers: `/api/credentials/files/[fileId]` and `/api/shared/credentials/[token]/files/[fileId]`

Rules for these surfaces:

- Route guards and repository contracts must enforce access before rendering sensitive data.
- File links in the UI must resolve through secure API handlers that issue short-lived signed URLs only after backend permission checks.
- Shared token pages are non-indexable and are not added to sitemap output.
- Admin grant/share management is exposed in the role-aware admin area under `/admin/documents/shares` and uses server actions backed by validated RPC contracts.

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
- Map/list interfaces must maintain one canonical selected record and synchronize all visual representations through stable identifiers.
- Public media viewers must expose accessible fallbacks and must not depend on hover-only controls.

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
- Map canvases and media viewers must retain measurable responsive dimensions after third-party runtime classes initialize.
- Selected cards, markers, dialogs and viewer state must remain synchronized without causing horizontal overflow or inaccessible hidden content.

## Documentation discipline

Durable frontend decisions belong here or in the design-system document. Component-level implementation details belong in code. Concrete work belongs in GitHub Issues.
