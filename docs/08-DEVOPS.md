# CostaPulse — DevOps

## Purpose

This document contains durable development, deployment and infrastructure knowledge for CostaPulse. It is a memory aid and technical runbook, not a store for live operational business data.

## Project references

- Repository: `MyMindVentures/CostaPulse`
- Default branch: `main`
- Production URL: `https://www.costapulse.club`
- Apex domain: `https://costapulse.club`
- DNS provider: Namecheap
- Production host: Railway
- Supabase project reference: `fbxhevctqrkulmaehrcw`
- Supabase project URL: `https://fbxhevctqrkulmaehrcw.supabase.co`

Clone with:

```bash
git clone https://github.com/MyMindVentures/CostaPulse.git
cd CostaPulse
```

## Environments

Maintain clear separation between local development, preview or staging, and production. Each environment must have explicit configuration, database targets, secrets and deployment ownership.

Use `.env.example` as the committed inventory and `.env.local` for real local credentials. Never commit `.env.local`.

## Environment variable inventory

| Variable                               | Phase   | Visibility | Required             | Purpose                               |
| -------------------------------------- | ------- | ---------- | -------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Build   | Public     | Production           | Canonical metadata and sitemap origin |
| `NEXT_PUBLIC_SUPABASE_URL`             | Build   | Public     | Supabase enabled     | Project API URL                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build   | Public     | Supabase enabled     | RLS-bound public key                  |
| `SUPABASE_SERVICE_ROLE_KEY`            | Runtime | Secret     | Privileged jobs only | Bypasses RLS; server only             |
| `STRIPE_SECRET_KEY`                    | Runtime | Secret     | Payments             | Stripe server client                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Build   | Public     | Client payments      | Stripe.js initialization              |
| `STRIPE_WEBHOOK_SECRET`                | Runtime | Secret     | Webhooks             | Signature verification                |
| `RESEND_API_KEY`                       | Runtime | Secret     | Email                | Transactional email                   |
| `RESEND_FROM_EMAIL`                    | Runtime | Secret     | Email                | Verified sender                       |
| `NEXT_PUBLIC_SENTRY_DSN`               | Build   | Public     | Optional             | Error destination                     |
| `SENTRY_AUTH_TOKEN`                    | Build   | Secret     | Source maps          | Build authentication                  |
| `NEXT_PUBLIC_POSTHOG_KEY`              | Build   | Public     | Optional             | Consent-gated analytics               |
| `NEXT_PUBLIC_POSTHOG_HOST`             | Build   | Public     | Optional             | Regional PostHog host                 |
| `PORT`                                 | Runtime | Platform   | Railway              | Injected listening port               |

Public values are not secrets. Server credentials must never use `NEXT_PUBLIC_`. Optional integrations fail closed. Rotate any value exposed through logs, Git history or browser bundles.

## Local commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run format
npm run format:check
npm run guardrails
npm run build
npm run check
npm run production:check
npm run storybook
```

Do not remove, weaken or bypass quality gates to make CI pass.

## Git hooks and CI

Husky local gates:

| Hook         | Responsibility                                                 |
| ------------ | -------------------------------------------------------------- |
| `pre-commit` | Secrets, staged formatting/lint and fast repository guardrails |
| `commit-msg` | Conventional Commits through commitlint                        |
| `pre-push`   | Typecheck and tests                                            |

CI remains authoritative for formatting verification, coverage, repository-wide linting, production build and Storybook. Skipping hooks is for genuine emergencies only and must be disclosed.

## Supabase workflow

Link the repository after authenticating the Supabase CLI:

```bash
supabase link --project-ref fbxhevctqrkulmaehrcw
```

Common commands:

```bash
supabase start
supabase db pull
supabase db push
supabase migration new <migration_name>
supabase functions serve
```

Review generated migrations before pushing. After schema or RPC changes, regenerate `src/types/database.ts` and update Zod schemas and view-model parsers in the same change set.

## Railway production deployment

Railway is the production host. Production tracks `main` and uses Railpack through root `railway.json`. Docker is not part of the deployment path, and the repository must not contain a root deployment Dockerfile because Railway automatically prefers it when present.

### Railway service settings

- Source: `MyMindVentures/CostaPulse`
- Production branch: `main`
- Root directory: `/`
- Config file: `/railway.json`
- Builder: Railpack
- Dockerfile path: empty
- Build command: empty; allow Railpack to detect `npm run build`
- Start command: empty; allow Railpack to detect the `start` script
- Health-check path: `/api/health`
- Health-check timeout: `300`
- Restart policy: on failure, maximum 5 retries
- Serverless mode: disabled

Remove stale dashboard overrides for Docker, build or start commands so they cannot conflict with repository configuration.

### Runtime

Next.js produces standalone output. `start-standalone.cjs` launches `.next/standalone/server.js`, forces `HOSTNAME=0.0.0.0`, and uses Railway's injected `PORT`. Do not define `PORT` manually.

`GET /api/health` is the Railway liveness check. `GET /api/ready` is an operator-facing dependency/configuration check and must not replace the liveness endpoint.

The service is stateless. Store uploads and operational data in Supabase Database and Storage, never on the application filesystem.

### Release flow

1. Merge a reviewed change into `main`.
2. Railway detects the commit.
3. Railpack installs dependencies and runs the Next.js build.
4. Railway starts the standalone server.
5. Railway waits for `/api/health` to return HTTP 200.
6. Verify `/`, `/admin`, `/api/health`, `/api/ready`, `/sitemap.xml` and `/robots.txt`.

### Pre-deployment gate

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
PORT=3000 npm run start
```

In another shell:

```bash
curl --fail http://localhost:3000/api/health
curl --fail http://localhost:3000/api/ready
```

Repository validation cannot prove deployed DNS, TLS, credentials, external service connectivity or the final Railway rollout.

### Domains and DNS

Add both `www.costapulse.club` and `costapulse.club` to the same Railway service. Copy Railway's generated DNS and verification records exactly into Namecheap Advanced DNS. Do not guess target values. Railway terminates TLS, and the application redirects the apex host to the canonical `www` host.

### Rollback

Use Railway deployment history to redeploy the last known-good release. Do not use automatic restarts to conceal deterministic build or startup failures.

## Git workflow

- Keep changes small and atomic.
- Use GitHub Issues for concrete work.
- Do not mix unrelated refactors and features.
- Record database changes through migrations.
- Prefer reversible changes and explicit rollback notes.

## Backups and recovery

Document what is backed up, where, how often and how restoration is tested. Include database, storage and critical configuration. Do not store backup contents in `/docs`.

## Monitoring and troubleshooting

Use Railway logs for build and startup failures, Sentry for application errors, Stripe/Supabase logs for workflow failures and `/api/ready` for operator checks. Temporary incidents belong in Issues; durable lessons belong here.

## AI coding agents

`AGENTS.md` is the binding entry point for Cursor, Codex and other coding agents. It directs agents to the twelve approved documentation files and prohibits new loose documentation.
