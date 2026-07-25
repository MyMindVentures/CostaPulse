# Architecture Index

Quick path → responsibility map. Narrative detail: [ARCHITECTURE.md](../ARCHITECTURE.md).

| Path                         | Owns                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| `src/app`                    | Thin App Router entrypoints, layouts, loading/error boundaries |
| `src/app/(marketing)`        | Public marketing route group + shared marketing layout         |
| `src/app/book`               | Booking wizard routes                                          |
| `src/app/api`                | Health, readiness, webhooks, trusted API routes                |
| `src/features/home`          | Home page composition                                          |
| `src/features/experiences`   | Catalog, detail, cards, booking widget sections                |
| `src/features/map`           | MapLibre discovery shell, list sync, filters                   |
| `src/features/booking`       | Booking wizard steps and session helpers                       |
| `src/features/referrals`     | Public referral contact and verification UI                    |
| `src/features/partner`       | Partner-owned QR promotional material                          |
| `src/features/admin`         | Admin dashboard composition                                    |
| `src/features/analytics`     | Consent + PostHog provider                                     |
| `src/features/shell`         | Public AppShell data loader (marketing + booking)              |
| `src/components/ui`          | shadcn/Radix primitives (no domain records)                    |
| `src/components/shared`      | Brand, locale switcher, price/duration, empty/loading/error    |
| `src/components/layout`      | AppShell, Navbar, mobile navigation                            |
| `src/server/repositories`    | Supabase I/O, validation, view-model mapping at boundary       |
| `src/server/auth`            | Role access helpers                                            |
| `src/server/bookings`        | Booking schemas and pricing logic                              |
| `src/server/referrals`       | Referral tokens, sessions, QR and email services               |
| `src/server/availability`    | Slot filters and summaries                                     |
| `src/server/payments`        | Stripe webhook handling                                        |
| `src/server/readiness`       | Readiness report assembly                                      |
| `src/lib/view-models`        | Pure mappers for map/calendar/navigation/team                  |
| `src/lib/supabase/server.ts` | Cookie-aware user-scoped client                                |
| `src/lib/supabase/admin.ts`  | Server-only privileged client                                  |
| `src/lib/url`                | Typed shareable catalog/map search params                      |
| `src/lib/map/config.ts`      | Map style URL + fallback viewport constants                    |
| `src/lib/media`              | Storage path resolution                                        |
| `src/lib/env`                | Validated environment access                                   |
| `src/types/database.ts`      | Generated Supabase types                                       |
| `supabase/migrations`        | Schema, RLS, RPCs, Storage policies                            |
| `messages`                   | next-intl catalogs                                             |
| `src/i18n`                   | Locale registry                                                |

## Boundary rules

- Presentational UI never calls Supabase.
- Privileged service-role usage only via `src/lib/supabase/admin.ts` in trusted server code.
- Public map/calendar consume verified RPC contracts (`get_experience_map`, `get_experience_calendar`).
- Empty database → empty UI; never fabricate inventory.
