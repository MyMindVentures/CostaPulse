# Railway

Railway is the production host for CostaPulse. Production deployments track the repository's default branch, `main`, and use Railway Railpack. Docker is not used.

## Repository contract

Railway reads `railway.json` from the repository root. The committed configuration explicitly selects `RAILPACK`, runs `npm run build`, starts with `npm run start`, checks `/api/health`, and applies bounded restart and deployment teardown settings.

Because Railway automatically uses a root `Dockerfile` when one exists, this repository must not contain a deployment Dockerfile.

## Dashboard settings

Configure the CostaPulse service as follows:

- Source: GitHub repository `MyMindVentures/CostaPulse`
- Production branch: `main`
- Root directory: `/`
- Config file path: `/railway.json`
- Builder: Railpack
- Dockerfile path: empty
- Build command: allow `railway.json` to provide `npm run build`
- Start command: allow `railway.json` to provide `npm run start`
- Health-check path: `/api/health`
- Serverless mode: disabled for the persistent Next.js web service

If the dashboard contains old Docker builder, Dockerfile path, build-command, or start-command overrides, remove them so they cannot conflict with the repository configuration.

## Runtime

Next.js produces standalone output. `npm run start` launches `.next/standalone/server.js`. Railway injects `PORT`; do not define it manually. The standalone server reads Railway's `PORT` and defaults its hostname appropriately for the platform.

The service is stateless. Do not store uploads or operational data on the application filesystem. Use Supabase Database and Supabase Storage.

## Variables

Railway variables are available during build and runtime. Next.js `NEXT_PUBLIC_*` values are embedded during `next build`; changing one requires a new deployment.

Secrets must be Railway variables and must never be committed, passed as public-prefixed variables, or exposed to browser code.

## Networking and domains

Generate a Railway domain for initial verification. Add `www.costapulse.club` and the apex domain through Railway Networking and copy the exact DNS records Railway provides. Railway terminates TLS; the application serves HTTP internally.

## Security

Railway can block builds when vulnerable dependencies are detected. Keep Next.js and related framework packages patched. The minimum safe version for the current Next.js 16.0 line is `16.0.10`.

## Operations

Inspect build and deploy logs in Railway. Roll back through Railway deployment history when necessary. Do not use automatic restarts to conceal deterministic build or startup failures.

Official Railway references: Railpack, build and start commands, health checks, variables, public networking, and config as code.
