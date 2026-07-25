# Agent Playbook

Operational guide for coding agents and humans working in CostaPulse.

## Before editing

1. Read [AGENTS.md](../AGENTS.md) non-negotiables and the relevant `.cursor/rules/*.mdc` files.
2. Confirm the change fits existing layers ([ARCHITECTURE-INDEX.md](ARCHITECTURE-INDEX.md)).
3. For data work: inspect `supabase/migrations`, RLS, and `src/types/database.ts` — never invent columns or buckets.
4. For UI: prefer `src/components/ui` + `src/components/shared`; fetch only in server/repositories; pass view models.
5. Plan tests at the right level before claiming done.

## Canonical commands

```bash
npm run dev            # Next.js (Turbopack)
npm run lint           # ESLint, zero warnings
npm run typecheck      # tsc --noEmit
npm run test           # Vitest unit/component
npm run test:coverage  # Vitest + coverage thresholds
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run guardrails     # i18n, mocks, route discoverability, stack, companion tests
npm run build          # Production build + standalone prepare
npm run check          # format:check + lint + typecheck + test + build
npm run production:check # Repository-wide lint, types, tests, and production build
npm run storybook      # Component catalog (ui + shared)
```

Agents must not remove, weaken, skip, or reintroduce `--passWithNoTests` to greenwash CI.

## Git hooks (Husky)

Local gates run automatically; do not bypass them to land broken work.

| Hook         | Runs                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `pre-commit` | Secrets → staged formatting/lint → fast guardrails (including route + sitemap coverage) |
| `commit-msg` | Conventional Commits via commitlint                                                     |
| `pre-push`   | `npm run typecheck` + `npm run test`                                                    |

Pre-commit is intentionally fast and deterministic: it checks secrets, formats
and lints staged files, and runs repository guardrails. Pre-push owns the full
TypeScript and Vitest checks. CI owns formatting verification, coverage,
repository-wide linting, the production build, and Storybook.
Skipping hooks (`--no-verify` / `HUSKY=0`) is for emergencies only and must be
called out in the PR.

Local hooks provide fast feedback; CI remains the authoritative production
quality gate. Neither can prove parity of mutable live data, Railway dashboard
overrides, DNS, external services, or a deployment that has not happened yet;
those remain release-time checks.

## File map

| Path                                  | Responsibility                                                        |
| ------------------------------------- | --------------------------------------------------------------------- |
| `src/app`                             | Thin routes, layouts, `loading.tsx` / `error.tsx`                     |
| `src/features`                        | Page compositions (home, experiences, booking, map, admin, analytics) |
| `src/components/ui`                   | Design-system primitives (no business data)                           |
| `src/components/shared`               | Cross-domain UI + empty/loading/error                                 |
| `src/components/layout`               | Shell, navbar, mobile nav                                             |
| `src/server/repositories`             | Supabase reads/writes, Zod, view-model mapping                        |
| `src/server/*`                        | Auth, bookings, availability, payments, readiness                     |
| `src/lib/view-models`                 | Pure RPC/DB → UI mappers                                              |
| `src/lib/supabase`                    | User and admin clients                                                |
| `src/lib/url`                         | Shareable catalog/map filter params                                   |
| `src/lib/media`                       | Storage path → URL resolution                                         |
| `src/lib/pricing`, `src/lib/datetime` | Locale-aware money/date formatting                                    |
| `src/i18n`                            | Locale registry                                                       |
| `messages`                            | next-intl message catalogs                                            |
| `supabase/migrations`                 | Schema, RLS, RPCs                                                     |
| `.cursor/rules`                       | Focused agent rules                                                   |
| `.storybook`                          | Storybook config                                                      |

## Data flow (required)

```text
Repository (src/server/repositories)
  → Zod / generated types
  → View model (src/lib/view-models or repo mapper)
  → Server Component / feature composition
  → Presentational UI (components/ui|shared|feature components)
```

Presentational components must not import `@/lib/supabase/*` or `@supabase/*`.

## Supabase types sync

After schema/RPC migrations:

1. Apply migrations locally or via the project workflow.
2. Regenerate TypeScript types into `src/types/database.ts` (Supabase MCP `generate_typescript_types` or CLI).
3. Update Zod schemas / view-model parsers to match — do not hand-maintain parallel row interfaces.

## Design tokens

Brand CSS variables in `src/app/globals.css` are the source of truth (`--navy`, `--coral`, `--turquoise`, `--sand`, …). Semantic shadcn tokens alias those values. See `.cursor/rules/design-system.mdc`.

## Hardcoded content audit notes

Marketing routes (`/destinations`, `/about`, `/partners`) may still use i18n placeholders until CMS-backed. Do not add new hardcoded prices, capacities, or inventory. Prefer DB + messages for new copy.

## Definition of done checklist

- [ ] Database / Storage / Backend / Frontend form one typed contract when those layers changed
- [ ] Migrations, constraints, RLS, Storage policies updated when needed
- [ ] No hardcoded business content or production mocks introduced
- [ ] Every enabled locale covered; language switch preserves context
- [ ] Every new page is reachable from navigation or a real navigated parent
      flow; every new indexable public page is included in the sitemap
- [ ] UI uses design-system tokens/primitives; shared states reused
- [ ] Presentational components have no direct DB/Supabase access
- [ ] `npm run lint`, `typecheck`, `test` (and `build` when relevant) pass
- [ ] No secrets, debug leftovers, or unrelated churn

## Related docs

- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [ARCHITECTURE-INDEX.md](ARCHITECTURE-INDEX.md)
- [DATA-CONTRACTS.md](DATA-CONTRACTS.md)
- [TOKENS.md](TOKENS.md)
- [SUPABASE.md](../SUPABASE.md)
- [ENVIRONMENT.md](../ENVIRONMENT.md)
- [RAILWAY.md](../RAILWAY.md)
- [docs/PROJECT-REFERENCES.md](PROJECT-REFERENCES.md)
