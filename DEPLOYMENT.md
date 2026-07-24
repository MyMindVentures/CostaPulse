# Deployment

## Release flow

1. Set Railway variables according to `ENVIRONMENT.md`.
2. Connect the production service to the intended GitHub branch.
3. Railway builds the root `Dockerfile` as configured by `railway.json`.
4. The container starts `node server.js`, binds to `0.0.0.0`, and uses Railway's injected `PORT`.
5. Railway waits for `GET /api/health` to return HTTP 200 before switching traffic.
6. Verify `/`, `/admin`, `/api/health`, `/sitemap.xml`, and `/robots.txt` on the generated domain.
7. Add the custom domains and copy the exact Railway-generated DNS records into the DNS provider. Do not guess targets.

## Pre-deployment gate

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t costapulse:local .
docker run --rm -p 3000:3000 -e PORT=3000 costapulse:local
curl --fail http://localhost:3000/api/health
```

## Rollback

Use Railway deployment history to redeploy the last known-good image. Keep restart policy for process failures; do not use restarts to hide deterministic startup failures.

A production deployment requires project access and provisioned secrets. Repository validation cannot prove DNS, TLS, Supabase connectivity, or a Railway rollout by itself.
