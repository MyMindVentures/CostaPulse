# Data contracts

Canonical UI data path for CostaPulse:

```text
supabase (schema / RLS / RPC)
  → src/server/repositories (query + Zod)
  → src/lib/view-models (pure mappers) when shared across surfaces
  → Server Component / feature composition
  → presentational components (typed props only)
```

## Rules

1. Generated types live in `src/types/database.ts`. Do not hand-copy row shapes into UI files.
2. Repositories own Supabase access and authorization-sensitive reads/writes.
3. View models expose only what the UI needs, with consistent nullability.
4. `src/components/**` and `src/features/**/components/**` must not import `@/lib/supabase/*`, `@supabase/*`, `@/server/*`, or `@/types/database`.
5. Public map/calendar consume `get_experience_map` / `get_experience_calendar` contracts via repositories + view-models.
6. After migrations, regenerate types and update Zod/view-model parsers in the same change set.

## Type sync checklist

1. Add/adjust migration under `supabase/migrations`.
2. Apply migration in the target environment.
3. Regenerate `src/types/database.ts`.
4. Update repository selects, Zod schemas, and view-model mappers.
5. Run `npm run typecheck` and relevant unit tests.

See also: [AGENT-PLAYBOOK.md](AGENT-PLAYBOOK.md), [ARCHITECTURE-INDEX.md](ARCHITECTURE-INDEX.md), [SUPABASE.md](../SUPABASE.md).
