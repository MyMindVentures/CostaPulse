# CostaPulse Project References

## Purpose

This document provides the canonical references for the CostaPulse project infrastructure and development environments.

Use this file as the first reference point when configuring local development, CI, Supabase, Vercel, Stripe, or other integrations.

## GitHub Repository

- **Repository:** `MyMindVentures/CostaPulse`
- **Clone URL:** `https://github.com/MyMindVentures/CostaPulse.git`
- **Default branch:** `main`
- **Current initialization branch:** `feat/initialize-premium-stack`

Recommended clone command:

```bash
git clone https://github.com/MyMindVentures/CostaPulse.git
cd CostaPulse
```

## Supabase Project

- **Project name:** `CostaPulse`
- **Project reference ID:** `fbxhevctqrkulmaehrcw`

The public Supabase API URL follows this pattern:

```text
https://fbxhevctqrkulmaehrcw.supabase.co
```

Add the following values to the local `.env.local` file:

```text
NEXT_PUBLIC_SUPABASE_URL=https://fbxhevctqrkulmaehrcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
```

Never commit the anon key, service-role key, database password, access tokens, or other credentials to GitHub.

## Supabase CLI Linking

After installing and authenticating the Supabase CLI, link the local repository to the project:

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

Review all generated migrations before pushing them to the remote project.

## Environment Files

Use:

```text
.env.example
.env.local
```

- `.env.example` contains variable names only and is committed.
- `.env.local` contains real local credentials and must never be committed.

The current environment template includes references for:

- Application URL
- Supabase
- Stripe
- Resend
- Sentry
- PostHog
- Mapbox

## Application Stack References

The architectural stack is documented in:

```text
docs/PREMIUM-STACK.md
```

The authorization model is documented in:

```text
docs/USER-ROLES-AND-CAPABILITIES.md
```

## Deployment References

The recommended deployment architecture is:

- **Frontend and Next.js server:** Vercel
- **Database and authentication:** Supabase
- **Payments:** Stripe
- **Transactional email:** Resend
- **Product analytics:** PostHog
- **Error monitoring:** Sentry

When the Vercel project is created, add its project and team identifiers to this document.

## Future References to Add

Add the following once provisioned:

- Production domain
- Vercel project name and project ID
- Stripe account and webhook endpoint IDs
- Resend domain and sender identities
- PostHog project reference
- Sentry organization and project slug
- Mapbox account reference
- Google Search Console property
- Analytics property IDs
- Support email addresses
- Legal company and tax references

## Security Notes

This document may contain public project identifiers, but it must never contain secrets.

Do not store:

- API secrets
- Database passwords
- Private keys
- Service-role values
- Personal access tokens
- Webhook signing secrets
- OAuth client secrets

Secrets belong in secure environment-variable stores such as local `.env.local`, Vercel Environment Variables, Supabase Secrets, or the relevant integration's secret manager.
