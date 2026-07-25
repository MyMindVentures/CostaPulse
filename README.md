# CostaPulse

CostaPulse is a premium Costa Blanca experience platform for discovering, booking and managing curated local experiences such as yacht trips, paddlesurf mentoring, kayak sessions and private BBQ services.

The project is built as a production-ready Next.js application with Supabase as the operational backend, Stripe for payments and Railway for hosting.

## Core product architecture

Every experience is rendered through three reusable, dynamic presentation components:

```text
Experience data + published media assets
                ↓
       shared repositories and view models
                ↓
     ExperiencePreview
     ExperienceDetail
     ExperienceBooking
```

### ExperiencePreview

Used on the homepage, experience catalog, related experiences, map results and other compact discovery surfaces.

It renders dynamic data such as:

- title and short description;
- category and location;
- duration and capacity;
- starting price and pricing model;
- rating and review count;
- host information;
- preview or hero media with focal-point positioning.

### ExperienceDetail

Used on `/experiences/[slug]` as the complete public profile page for an experience.

It composes:

- hero media;
- image and video gallery;
- highlights and inclusions;
- variants and pricing;
- itinerary;
- requirements and policies;
- meeting points and map data;
- availability;
- reviews;
- booking CTA and booking widget.

### ExperienceBooking

Used in the booking flow on `/book` and `/book/[slug]`.

It renders the selected experience, booking draft, date, timeslot, party size, location, language, variant and estimated price while the user progresses through the booking workflow.

## Technology stack

### Application

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript**
- **next-intl** for translated UI
- **Zod** for runtime validation
- **React Hook Form** for forms

The App Router is the only routing system. Do not introduce React Router or route state through custom `activePage` logic.

### Interface

- **Tailwind CSS 4**
- **Radix UI primitives**
- **shadcn-style owned components**
- **Lucide React** icons
- responsive layouts and accessible interaction patterns

### Backend

- **Supabase PostgreSQL** as the source of truth
- **Supabase Auth** for identity and sessions
- **Supabase Storage** for public and protected media
- **Row Level Security** for authorization
- **Supabase Data API** for typed application access
- trusted Next.js server code or Edge Functions for privileged operations

See [SUPABASE.md](SUPABASE.md) for database, RLS and client-boundary rules.

### Payments and integrations

- **Stripe** for checkout and payment processing
- **Resend** for transactional email
- **Sentry** for production diagnostics
- **PostHog** for product analytics

Secrets, webhooks, service-role access and payment mutations remain server-only.

## Media architecture

Website media has one canonical database source of truth:

```text
public.media_assets
```

The table stores both the physical Storage reference and the website placement metadata, including:

```text
bucket_id
storage_path
asset_key
media_type
mime_type
alt_text
caption
width
height
focal_x
focal_y
status
visibility
scope_type
scope_key
placement_key
role
breakpoint
display_order
is_primary
is_active
starts_at
ends_at
metadata
```

Public frontend reads use:

```text
public.published_media_assets
```

This is a filtered view, not a second media-management table. It exposes only active, public and published media within a valid publication window.

Typical experience media records use:

```text
scope_type = experience
scope_key = <experience slug>
placement_key = preview | hero | gallery | booking
```

Frontend components never guess bucket names or hardcode filenames. They resolve media by scope and placement and use the stored focal point, alt text and public Storage path.

## Repository structure

```text
src/
├── app/
│   ├── (public)/
│   ├── (booking)/
│   ├── admin/
│   └── api/
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── features/
│   ├── experiences/
│   │   ├── preview/
│   │   ├── detail/
│   │   └── booking/
│   ├── booking/
│   ├── home/
│   └── map/
├── lib/
│   ├── media/
│   ├── supabase/
│   └── view-models/
├── server/
│   └── repositories/
└── types/
```

Compatibility aliases may exist for older component names, but new code should use:

```text
ExperiencePreview
ExperiencePreviewViewModel
ExperienceDetail
ExperienceBooking
```

## Main routes

- `/` — public landing page with featured experience previews
- `/experiences` — public experience catalog
- `/experiences/[slug]` — full experience detail page
- `/experiences/map` — map-based experience discovery
- `/book` — standalone booking flow
- `/book/[slug]` — booking flow for a selected experience
- `/admin` — administration area
- `/api/health` — Railway health endpoint
- `/sitemap.xml` and `/robots.txt` — search-engine controls

## Architecture rules

1. PostgreSQL is the source of truth for persistent business data.
2. Next.js App Router is the only routing system.
3. Supabase Auth identifies users; server checks and RLS enforce authorization.
4. Exposed tables and Storage buckets use deny-by-default policies.
5. Secrets, payments, webhooks and privileged mutations remain server-only.
6. Server data is not copied into global client state without a concrete need.
7. Zod validates input and external data at trust boundaries.
8. Realtime is introduced only where live updates improve the product.
9. Features are delivered as complete userflows: database, backend and frontend.
10. Prisma, Express and an additional router are not introduced by default.
11. Website media is managed through the single canonical `media_assets` table.
12. Experience UI is implemented through the reusable preview, detail and booking presentations.

## Standard implementation order

1. Define the user goal, happy path, failures and permissions.
2. Design or update the PostgreSQL schema through a migration.
3. Add constraints, indexes and RLS policies.
4. Implement trusted backend operations and integrations.
5. Add repository queries and validated view models.
6. Define App Router routes and layouts.
7. Build reusable frontend components.
8. Connect dynamic data and media.
9. Add loading, empty and error states.
10. Test authorization, navigation and the complete browser flow.

## Local development

Requirements:

- Node.js 22
- npm 10 or newer

```bash
cp .env.example .env.local
npm install
npm run dev
```

For reproducible installations, use:

```bash
npm ci
```

Run the complete quality gate with:

```bash
npm run check
```

Useful commands include:

```bash
npm run test:coverage
npm run storybook
npm run build
```

## Testing and quality

- **Vitest** for application logic and validation
- **React Testing Library** for user-visible component behaviour
- **Playwright** for complete browser journeys
- **ESLint** and **Prettier** for consistency
- `npm run check` as the local quality gate

Agent guidance:

- [AGENTS.md](AGENTS.md)
- [docs/AGENT-PLAYBOOK.md](docs/AGENT-PLAYBOOK.md)

## Deployment

CostaPulse is hosted on **Railway** using **Railpack**, not Docker.

Railway:

- deploys from the `main` branch;
- detects the Node.js application through `package.json`;
- injects `PORT`;
- checks `/api/health`;
- terminates public TLS.

Supabase hosts PostgreSQL, Auth, Storage, the Data API and optional Edge Functions.

See:

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [RAILWAY.md](RAILWAY.md)
- [ENVIRONMENT.md](ENVIRONMENT.md)
- [SUPABASE.md](SUPABASE.md)
