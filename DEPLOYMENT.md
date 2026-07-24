# Deployment

CostaPulse deploys to Railway from the repository's `main` branch using Railway Railpack. Docker is not part of the deployment path.

## Railway service settings

The committed `railway.json` is the source of truth and overrides conflicting dashboard values for each deployment.

Use these Railway service settings:

- Source repository: `MyMindVentures/CostaPulse`
- Production branch: `main`
- Root directory: `/`
- Config file path: `/railway.json`
- Builder: Railpack
- Build command: `npm run build`
- Start command: `npm run start`
- Health-check path: `/api/health`
- Health-check timeout: `300`
- Restart policy: on failure, maximum 5 retries
- Dockerfile path: empty
- Watch paths: empty unless intentionally configured later

Do not set a Dockerfile builder or Dockerfile path in the Railway dashboard.

## Release flow

1. Merge a reviewed pull request into `main`.
2. Railway detects the GitHub change.
3. Railpack detects Node.js and installs dependencies with npm.
4. Railway runs `npm run build`.
5. Railway starts the application with `npm run start`.
6. Next.js runs the standalone server and listens on Railway's injected `PORT`.
7. Railway waits for `GET /api/health` to return HTTP 200 before switching traffic.
8. Verify `/`, `/admin`, `/api/health`, `/sitemap.xml`, and `/robots.txt`.

## Required variables

Set production values in Railway Variables. Do not define `PORT`; Railway injects it.

At minimum, configure the variables required by the enabled integrations. Use `ENVIRONMENT.md` as the canonical inventory.

Public `NEXT_PUBLIC_*` variables are embedded during `next build`; changing them requires a redeployment.

## Pre-deployment gate

```bash
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
PORT=3000 npm run start
curl --fail http://localhost:3000/api/health
```

The project currently has no committed npm lockfile, so Railpack cannot use `npm ci`. Add and commit `package-lock.json` from a trusted development environment; after that, use `npm ci` consistently.

## Security gate

Railway may block deployment when dependency vulnerabilities are detected. Next.js 16.0.x must be at least `16.0.10` for the December 2025 React Server Components security fixes.

## Rollback

Use Railway deployment history to redeploy the last known-good deployment. Do not use automatic restarts to hide deterministic build or startup failures.

Repository validation cannot prove DNS, TLS, external service credentials, Supabase connectivity, or the final Railway rollout without access to those deployed resources.
