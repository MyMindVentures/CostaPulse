# Railway

Railway is the production host for CostaPulse. Production deployments track the repository's default branch, `main`, and use Railway Railpack. Docker is not used.

## Repository contract

Railway reads `railway.json` from the repository root. The committed configuration explicitly selects `RAILPACK`, keeps health and restart policy in config-as-code, and relies on Railpack's Node detection plus the `package.json` scripts for build and start behavior.

Because Railway automatically uses a root `Dockerfile` when one exists, this repository must not contain a deployment Dockerfile.

## Dashboard settings

Configure the CostaPulse service as follows:

- Source: GitHub repository `MyMindVentures/CostaPulse`
- Production branch: `main`
- Root directory: `/`
- Config file path: `/railway.json`
- Builder: Railpack
- Dockerfile path: empty
- Build command: empty; let Railpack detect `npm run build`
- Start command: empty; let Railpack detect the `start` script from `package.json`
- Health-check path: `/api/health`
- Serverless mode: disabled for the persistent Next.js web service

If the dashboard contains old Docker builder, Dockerfile path, build-command, or start-command overrides, remove them so they cannot conflict with the repository configuration.

## Runtime

Next.js produces standalone output. The `start` script in `package.json` launches `.next/standalone/server.js`, and Railpack uses that script automatically. Railway injects `PORT`; do not define it manually. The standalone server reads Railway's `PORT` and defaults its hostname appropriately for the platform.

Railway should continue probing `GET /api/health` as a liveness check. Use `GET /api/ready` as an operator-facing readiness check for required public variables and partially configured optional integrations; do not point the Railway health check at `/api/ready`.

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
