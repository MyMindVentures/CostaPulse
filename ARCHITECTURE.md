# Architecture

## Runtime

CostaPulse is a Next.js 16 App Router application using React 19, strict TypeScript, Tailwind CSS 4 and next-intl. Pages are Server Components by default; interactive islands use `"use client"` at the smallest practical boundary. The production image uses Next.js standalone output for Railway.

`next.config.ts` enables standalone output for the multi-stage Docker image, compression, optimized images and baseline response headers. The runtime image runs as an unprivileged `nextjs` user. Sentry wraps the Next.js config through `withSentryConfig` and initializes only when `NEXT_PUBLIC_SENTRY_DSN` is set.

## Public routes

Marketing pages live under the `(marketing)` route group and share `AppShell` (Navbar + footer).

| Route                                   | Role                                                                  |
| --------------------------------------- | --------------------------------------------------------------------- |
| `/`                                     | Home / catalog teaser                                                 |
| `/experiences`                          | Published experience catalog                                          |
| `/experiences/map`                      | Interactive map discovery (MapLibre + `get_experience_map`)           |
| `/experiences/[slug]`                   | Experience detail + booking widget                                    |
| `/destinations`, `/about`, `/partners`  | Marketing placeholders (content from i18n until CMS-backed)           |
| `/book`, `/book/[slug]`, success/cancel | Booking wizard and payment outcomes                                   |
| `/admin`                                | Admin dashboard (must remain role-gated before operational mutations) |

Operational endpoints (`/api/health`, `/api/ready`, bookings, availability, Stripe webhooks) and metadata routes (`sitemap`) are not marketing pages.

## Boundaries

- `src/app` contains thin route, layout, `loading.tsx` and `error.tsx` modules.
- `src/features` owns page compositions (home, experiences, booking, admin, analytics).
- `src/components/ui` holds shadcn/Radix primitives with no CostaPulse business data.
- `src/components/shared` holds reusable composed UI (brand, empty/error/loading, locale switcher, price/duration).
- `src/server/repositories` owns Supabase reads/writes, Zod validation and view-model mapping.
- `src/lib/view-models` holds pure mappers/schemas for RPCs such as `get_experience_map` and `get_experience_calendar`.
- `src/lib/map/config.ts` owns MapLibre style URL resolution and Costa Blanca fallback viewport constants.
- `src/lib/url/catalog-filters.ts` owns typed, shareable catalog/map filter search params.
- `src/lib/supabase/server.ts` creates a cookie-aware user-scoped client and never reads the service key.
- `src/lib/supabase/admin.ts` is server-only and creates a non-persistent privileged client only when explicitly called.
- Presentational components never call Supabase directly.

## Design system

CostaPulse brand CSS variables in `src/app/globals.css` are the source of truth (`--navy`, `--coral`, `--turquoise`, `--sand`, …). shadcn semantic tokens (`--background`, `--primary`, `--ring`, …) alias those brand values. Do not introduce a second palette or default shadcn purple/neutral theme.

## Integrations

- `src/lib/integrations.ts` exposes soft-fail server clients for Stripe and Resend. Missing keys do not break public rendering.
- Sentry is wired through `instrumentation.ts`, `instrumentation-client.ts`, and the server/edge config modules. Capture is disabled when the DSN is absent.
- PostHog initializes in the client only when keys are set and analytics consent is granted.

## Deferred frontend libraries (Scope B)

Installed for Map View:

- `maplibre-gl` — interactive map (dynamic client import; OpenFreeMap style via `NEXT_PUBLIC_MAP_STYLE_URL`)

Still candidate when needed:

- `sonner` — accessible toasts
- `embla-carousel-react` — media galleries
- `vaul` / shadcn Drawer — mobile sheets
- `react-day-picker` — if a richer calendar primitive is required beyond current booking UI

Do not add TanStack Query for server-rendered catalog data. Do not add `nuqs` while `catalog-filters` covers URL state.

## Security status

The dashboard must be protected with Supabase authentication and a server/database-enforced admin role before operational data or mutations are added. The service-role key may only be used in trusted server code. CSP currently permits the declared Supabase, PostHog and Sentry endpoints; narrow it when exact regional hosts are provisioned.

## Rendering and caching

Catalog and detail pages fetch published inventory through repositories. Availability, identity, customer data and booking state must never use public caching. Empty database states must render real empty UI—never fabricated experiences, reviews or prices.

## Official references reviewed

Implementation choices follow the official Next.js App Router, deployment, metadata and standalone output documentation; React 19 reference; TypeScript handbook; Tailwind CSS Next.js guide; shadcn/ui Next.js / Tailwind v4 guide; next-intl App Router guide; and official vendor guides linked in the deployment documents.
