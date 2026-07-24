# CostaPulse Railway Deployment

## Production References

- Railway project: `CostaPulse`
- Production domain: `https://www.costapulse.club`
- Apex domain: `https://costapulse.club`
- DNS provider: Namecheap
- Healthcheck endpoint: `/api/health`

## Repository Configuration

Railway uses these committed files:

```text
Dockerfile
railway.json
.dockerignore
```

The Docker image builds the Next.js standalone server and starts it with:

```text
node server.js
```

The server binds to:

```text
HOSTNAME=0.0.0.0
PORT=<Railway-provided PORT>
```

Do not add a fixed `PORT` variable in Railway unless a specific operational reason requires it.

## Railway Service Configuration

Connect the service to:

```text
MyMindVentures/CostaPulse
```

Use `main` as the production branch.

The repository-level `railway.json` selects the root `Dockerfile` and configures:

- `/api/health` healthcheck
- 300-second healthcheck timeout
- restart on failure
- five restart attempts

The healthcheck must return HTTP 200 before Railway makes a new deployment active.

## Required Railway Variables

Add these variables in the production environment:

```text
NEXT_PUBLIC_APP_URL=https://www.costapulse.club
NEXT_PUBLIC_SITE_URL=https://www.costapulse.club
NEXT_PUBLIC_SUPABASE_URL=https://fbxhevctqrkulmaehrcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<value from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<server-only value from Supabase>
RAILWAY_HEALTHCHECK_TIMEOUT_SEC=300
RAILWAY_DEPLOYMENT_DRAINING_SECONDS=30
```

Add these when their integrations are activated:

```text
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
MAPBOX_ACCESS_TOKEN=
```

Never expose server-only secrets with the `NEXT_PUBLIC_` prefix.

## Railway Custom Domains

Add both domains to the CostaPulse Railway service:

```text
www.costapulse.club
costapulse.club
```

Railway displays the exact DNS records required for each domain. Current Railway custom-domain setup requires both:

- A routing record, normally a CNAME or provider-supported apex equivalent
- A TXT record for ownership verification

Copy the values exactly from Railway. Do not create guessed Railway targets.

The application redirects:

```text
https://costapulse.club/*
```

permanently to:

```text
https://www.costapulse.club/*
```

## Namecheap DNS

Open:

```text
Namecheap Dashboard → Domain List → costapulse.club → Advanced DNS
```

For the `www` host, create the CNAME and verification TXT records shown by Railway.

For the apex host, use the exact record type and target Railway provides. Namecheap capabilities and Railway's generated values determine whether an ALIAS-like or CNAME-compatible setup is used.

Remove conflicting records for the same host, including old parking, redirect, A, AAAA, or CNAME records that would override the Railway configuration.

DNS propagation and certificate issuance may take time. Railway should show a verified status before the custom domain is considered ready.

## TLS and HTTPS

Railway provisions and renews TLS certificates after the custom domain is verified.

The public application URL must always use:

```text
https://www.costapulse.club
```

Do not configure TLS inside the Next.js container. Railway terminates HTTPS at its edge.

## Build-Time Public Variables

Next.js embeds `NEXT_PUBLIC_*` values during the build. The Dockerfile therefore declares the supported public variables as Docker build arguments.

Changing a public environment variable requires a fresh deployment so the Next.js bundle is rebuilt.

Server-only variables remain runtime secrets and must not be embedded into the image or client bundle.

## Deployment Verification

After each production deployment, verify:

```text
https://www.costapulse.club/api/health
https://www.costapulse.club
https://costapulse.club
https://www.costapulse.club/sitemap.xml
https://www.costapulse.club/robots.txt
```

Expected behavior:

- `/api/health` returns HTTP 200 and JSON with `status: ok`
- `www.costapulse.club` renders CostaPulse
- `costapulse.club` redirects with HTTP 308 to `www.costapulse.club`
- sitemap and robots endpoints are reachable

## Common Failures

### Build fails during dependency installation

Confirm that the committed package versions are compatible and that `package.json` is valid. Avoid changing production dependencies back to uncontrolled `latest` versions.

### Build succeeds but deployment fails healthcheck

Check that:

- the server starts without runtime errors
- it listens on Railway's `PORT`
- it binds to `0.0.0.0`
- `/api/health` returns HTTP 200
- the healthcheck timeout is sufficient

### Domain returns 404

Confirm that both Railway-provided DNS records are present. A working CNAME without the verification TXT record can still result in a Railway 404.

### Domain does not resolve

Check for conflicting Namecheap records and wait for DNS propagation.

### Environment variable appears unchanged

Trigger a new deployment when changing any `NEXT_PUBLIC_*` variable, because these values are compiled into the frontend bundle.
