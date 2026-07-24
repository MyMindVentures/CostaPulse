# CostaPulse

Production-oriented foundation for CostaPulse, a premium Costa Blanca experience platform.

## Routes

- `/` — public landing page
- `/admin` — non-indexed dashboard shell (placeholder data only)
- `/api/health` — Railway health probe
- `/sitemap.xml` and `/robots.txt` — search-engine controls

No booking or payment feature is implemented in this initialization.

## Local development

Requirements: Node.js 22 and npm 10 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The landing page and health endpoint work without integration credentials. Add only the values needed for integrations being developed. Run the complete local gate with `npm run check`.

The repository currently has no committed npm lockfile. Generate and commit `package-lock.json` from a trusted development environment, then use `npm ci` for reproducible installs.

## Production

CostaPulse is hosted exclusively on **Railway** using **Railpack**, not Docker. Railway reads `railway.json`, runs `npm run build`, starts the standalone Next.js server with `npm run start`, injects `PORT`, checks `/api/health`, and terminates public TLS.

The repository default branch and Railway production deployment branch are both `main`.

See [DEPLOYMENT.md](DEPLOYMENT.md), [RAILWAY.md](RAILWAY.md), [ENVIRONMENT.md](ENVIRONMENT.md), and [SUPABASE.md](SUPABASE.md).
