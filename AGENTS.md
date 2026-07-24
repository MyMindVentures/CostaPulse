# CostaPulse — Coding Agent Rules

Binding non-negotiables for every coding agent. Detailed guidance lives in Cursor rules and docs — do not duplicate long policy here.

## Read first

| Doc                                                      | Purpose                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| [docs/AGENT-PLAYBOOK.md](docs/AGENT-PLAYBOOK.md)         | Commands, file map, before-edit checklist, definition of done |
| [docs/ARCHITECTURE-INDEX.md](docs/ARCHITECTURE-INDEX.md) | Path → responsibility index                                   |
| [docs/DATA-CONTRACTS.md](docs/DATA-CONTRACTS.md)         | Repository → view-model → UI contract                         |
| [docs/TOKENS.md](docs/TOKENS.md)                         | Design token source of truth                                  |
| [ARCHITECTURE.md](ARCHITECTURE.md)                       | Runtime, routes, boundaries, design tokens                    |
| [SUPABASE.md](SUPABASE.md)                               | Clients, RLS, Storage                                         |
| [ENVIRONMENT.md](ENVIRONMENT.md)                         | Validated environment variables                               |

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

## Non-negotiables

1. **Stack only** — Next.js App Router, React, TypeScript strict, Tailwind, Supabase, Stripe, Railway, Zod, RHF, Playwright, Vitest/RTL. No major new frameworks without proven need.
2. **Feature order** — `Database → Storage → Backend → Frontend → Tests` (skip only when unaffected).
3. **Never guess** — inspect real schema, migrations, RLS, Storage, and existing contracts before editing.
4. **No hardcoding / no production mocks** — business content and rules come from typed backend contracts; empty DB → real empty UI.
5. **Server-authoritative** — prices, availability, authz, and payments verified server-side; never disable RLS or expose privileged keys.
6. **Multilingual** — every enabled locale via the central registry; language switch preserves route and booking context.
7. **Design system** — CostaPulse tokens + reusable primitives; presentational UI takes view models, not Supabase.
8. **Tests are gates** — never remove, weaken, or skip tests to make checks pass.

## Definition of done (summary)

Coherent DB/Storage/Backend/Frontend contract · migrations/RLS correct · no production mocks · all enabled locales · design-system UI · no DB calls in presentational components · `npm run check` (and relevant e2e) green · no secrets or unrelated churn.

In the final report: what changed, which layers were inspected, which tests ran, and what could not be verified.
