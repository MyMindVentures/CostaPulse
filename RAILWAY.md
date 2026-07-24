# Railway

Railway is the production host for the CostaPulse Next.js application and the repository's only deployment path.

## Repository contract

Railway uses the root `Dockerfile` through `railway.json`. The Dockerfile uses dependency, build and runtime stages, installs reproducibly with `npm ci`, copies Next.js standalone output, runs as a non-root user, and leaves runtime `PORT` overridable. The health check is `/api/health`, with a 300-second deployment timeout and bounded on-failure restarts.

## Variables

Railway variables are available at build and runtime, but Next.js `NEXT_PUBLIC_*` values are embedded during `next build`. Changing one requires a rebuild. Secrets must be Railway variables, never Docker `ARG`, committed files, or public-prefixed variables. Railway injects `PORT`; do not define it manually.

## Networking and domains

Generate a public domain for initial verification. For `www.costapulse.club` and the apex domain, add each domain in Railway and copy the exact displayed CNAME/apex-equivalent and verification records. Railway terminates TLS; the container serves HTTP. Configure the canonical redirect in Railway edge/domain settings before launch.

## Operations

Inspect build and deploy logs in Railway. Use the CLI only after authenticating locally; never commit CLI tokens. The container is stateless, so do not use its filesystem for uploads. Use Supabase Storage. Add a Railway volume only for a future workload with a documented persistence requirement.

Official references: [Dockerfiles](https://docs.railway.com/guides/dockerfiles), [Healthchecks](https://docs.railway.com/guides/healthchecks), [Variables](https://docs.railway.com/reference/variables), [Public networking](https://docs.railway.com/guides/public-networking), and [Config as code](https://docs.railway.com/guides/config-as-code).
