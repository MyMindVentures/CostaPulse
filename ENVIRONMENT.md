# Environment variables

Copy `.env.example` to `.env.local` for development. Never commit real values.

| Variable | Phase | Visibility | Required | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Build | Public | Production | Canonical metadata and sitemap origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Build | Public | When Supabase enabled | Project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build | Public | When Supabase enabled | RLS-bound public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime | Secret | Privileged jobs only | Bypasses RLS; server only |
| `STRIPE_SECRET_KEY` | Runtime | Secret | Payments only | Stripe server client |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Build | Public | Client payments only | Stripe.js initialization |
| `STRIPE_WEBHOOK_SECRET` | Runtime | Secret | Webhooks only | Signature verification |
| `RESEND_API_KEY` | Runtime | Secret | Email only | Transactional email |
| `NEXT_PUBLIC_SENTRY_DSN` | Build | Public | Optional | Error event destination |
| `SENTRY_AUTH_TOKEN` | Build | Secret | Source-map upload only | Build authentication |
| `NEXT_PUBLIC_POSTHOG_KEY` | Build | Public | Optional | Consent-gated analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | Build | Public | Optional | Regional PostHog host |
| `PORT` | Runtime | Platform | Railway | Injected listening port |

Public values are not secrets. Server credentials must never use `NEXT_PUBLIC_`. Optional integrations fail closed: missing keys produce no client rather than crashing the landing page. Rotate any value that reaches logs, Git history or browser bundles unexpectedly.
