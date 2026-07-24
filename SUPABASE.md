# Supabase

## Keys and clients

Use the project URL and current publishable key in browser/user-scoped SSR clients. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; it bypasses Row Level Security and must never be exposed. The admin factory imports `server-only`, disables persistence and refresh, and is not used by public rendering.

The SSR factory uses `@supabase/ssr`, the Next.js cookie store, `getAll`, and `setAll`. Authentication is not activated in this initialization because there is no sign-in page. Before connecting operational dashboard data, implement a Next.js proxy that refreshes sessions using `supabase.auth.getClaims()`, protects `/admin`, and checks a database-backed admin role server-side.

## Database baseline

Before any exposed tables are created:

1. Create migrations under `supabase/migrations`.
2. Enable RLS on every table reachable through the Data API.
3. Use deny-by-default policies based on `auth.uid()` and ownership/role relations.
4. Put privileged mutations in trusted server code or carefully reviewed security-definer functions.
5. Add indexes used by policy predicates.
6. Test anonymous, authenticated, owner, operator and admin access.

Storage buckets need explicit object policies. Realtime tables must have RLS and only be added to publications when live updates are operationally required.

## Verification

A connection cannot be proven without provisioned credentials. After configuration, execute a user-scoped server query against a dedicated read-only health table and verify that anonymous access is denied unless deliberately allowed. Do not make the public health endpoint depend on Supabase; infrastructure health and dependency readiness are distinct.

Official references: [Next.js SSR auth](https://supabase.com/docs/guides/auth/server-side/nextjs), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage security](https://supabase.com/docs/guides/storage/security/access-control), and [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization).
