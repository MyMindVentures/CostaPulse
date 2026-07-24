# Architecture

## Runtime

CostaPulse is a Next.js 16 App Router application using React 19, strict TypeScript, Tailwind CSS 4 and next-intl. Pages are Server Components by default. The current UI has exactly two page routes: `/` and `/admin`; operational endpoints and metadata routes are not pages.

`next.config.ts` enables standalone output for the multi-stage Docker image, compression, optimized images and baseline response headers. The runtime image runs as an unprivileged `nextjs` user.

## Hosting

Railway is the sole application hosting platform. It builds the root `Dockerfile` according to `railway.json`, runs the standalone Next.js Node.js server, injects the runtime port, checks `/api/health`, and exposes the container through Railway networking. Supabase remains the managed database, authentication, and storage provider; it does not host the Next.js application.

## Boundaries

- `src/app` contains thin route and layout modules.
- `src/lib/supabase/server.ts` creates a cookie-aware user-scoped client and never reads the service key.
- `src/lib/supabase/admin.ts` is server-only and creates a non-persistent privileged client only when explicitly called.
- `src/lib/integrations.ts` exposes lazy, nullable server clients for Stripe and Resend. Missing keys do not break public rendering.
- Public analytics/error reporting keys are optional. Analytics must not initialize until consent has been captured.

## Security status

The dashboard contains placeholder, non-sensitive data only. It must be protected with Supabase authentication and a server/database-enforced admin role before operational data or mutations are added. The service-role key may only be used in trusted server code. CSP currently permits the declared Supabase, PostHog and Sentry endpoints; narrow it when exact regional hosts are provisioned.

## Rendering and caching

The landing page is statically renderable. The health route is explicitly dynamic. Availability, identity, customer data and booking state must never use public caching when those domains are implemented.

## Official references reviewed

Implementation choices follow the official Next.js App Router, deployment, metadata and standalone output documentation; React 19 reference; TypeScript handbook; Tailwind CSS Next.js guide; shadcn/ui Next.js guide; next-intl App Router guide; and official vendor guides linked in the deployment documents. Documentation review attempted on 2026-07-24; this execution environment blocked outbound documentation access, so production owners must re-run the linked verification before launch.
