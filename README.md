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
npm ci
npm run dev
```

The landing page and health endpoint work without integration credentials. Add only the values needed for integrations being developed. Run the complete local gate with `npm run check`.

## Production

CostaPulse is hosted exclusively on **Railway**. Railway builds the repository `Dockerfile`, runs the Next.js standalone server, injects `PORT`, performs the `/api/health` deployment check, and terminates public TLS.

See [DEPLOYMENT.md](DEPLOYMENT.md), [RAILWAY.md](RAILWAY.md), [ENVIRONMENT.md](ENVIRONMENT.md), and [SUPABASE.md](SUPABASE.md).
