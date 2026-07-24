# CostaPulse Project References

## Purpose

This document provides the canonical references for the CostaPulse project infrastructure and development environments.

Use this file as the first reference point when configuring local development, CI, Supabase, Railway, Stripe, or other integrations.

## GitHub Repository

- **Repository:** `MyMindVentures/CostaPulse`
- **Clone URL:** `https://github.com/MyMindVentures/CostaPulse.git`
- **Default branch:** `main`

Recommended clone command:

```bash
git clone https://github.com/MyMindVentures/CostaPulse.git
cd CostaPulse
```

## Production Website

- **Canonical production URL:** `https://www.costapulse.club`
- **Apex domain:** `https://costapulse.club`
- **Domain registrar and DNS provider:** Namecheap
- **Canonical host policy:** apex redirects permanently to `www.costapulse.club`

## Railway Project

- **Railway project name:** `CostaPulse`
- **Hosting platform:** Railway
- **Builder:** repository-root `Dockerfile`
- **Application healthcheck:** `/api/health`
- **Application runtime:** Next.js standalone Node.js server
- **Runtime bind address:** `0.0.0.0`
- **Runtime port:** Railway-provided `PORT`

Railway deployment configuration is committed in:

```text
railway.json
Dockerfile
.dockerignore
```

The service must define these public environment variables:

```text
NEXT_PUBLIC_APP_URL=https://www.costapulse.club
NEXT_PUBLIC_SITE_URL=https://www.costapulse.club
NEXT_PUBLIC_SUPABASE_URL=https://fbxhevctqrkulmaehrcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
```

The remaining server-side secrets must also be added in Railway Variables when their integrations are enabled.

Do not manually hardcode `PORT`. Railway injects it automatically.

## Namecheap and Railway Domain Connection

Add both custom domains to the same Railway service:

```text
www.costapulse.club
costapulse.club
```

Railway supplies the exact DNS records for each custom domain. Add those records in Namecheap Advanced DNS exactly as Railway displays them.

For `www.costapulse.club`, this normally includes:

- A `CNAME` record for host `www`
- A Railway verification `TXT` record

For the apex domain, use the DNS record type supported and requested by Railway and Namecheap. Do not guess the destination value; copy the generated value from Railway.

Both the routing record and Railway verification TXT record are required. The application itself redirects the apex domain to the canonical `www` domain.

Railway automatically provisions TLS after domain verification and DNS propagation.

## Supabase Project

- **Project name:** `CostaPulse`
- **Project reference ID:** `fbxhevctqrkulmaehrcw`
- **Project URL:** `https://fbxhevctqrkulmaehrcw.supabase.co`

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

- `.env.example` contains variable names and non-secret public references and is committed.
- `.env.local` contains real local credentials and must never be committed.
- Railway Variables contains production credentials and configuration.

The current environment template includes references for:

- Production application URL
- Railway deployment behavior
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

Detailed Railway deployment guidance is documented in:

```text
docs/RAILWAY-DEPLOYMENT.md
```

## Deployment Architecture

- **Frontend and Next.js server:** Railway
- **Database and authentication:** Supabase
- **Payments:** Stripe
- **Transactional email:** Resend
- **Product analytics:** PostHog
- **Error monitoring:** Sentry
- **DNS:** Namecheap

## Future References to Add

Add the following once provisioned:

- Railway service identifier
- Railway environment identifier
- Exact Railway-generated DNS targets
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

Secrets belong in secure environment-variable stores such as local `.env.local`, Railway Variables, Supabase Secrets, or the relevant integration's secret manager.
