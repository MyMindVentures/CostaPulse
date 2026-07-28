-- Keep role-specific public workflow copy with the rest of each strategy translation.
-- Existing translated content is deliberately left untouched.
alter table if exists public.strategy_translations
  add column if not exists simple_workflow_steps jsonb not null default '[]'::jsonb;

create or replace function public.is_nonempty_text_array(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(value) = 'array'
    and not exists (
      select 1
      from jsonb_array_elements(value) as element(item)
      where jsonb_typeof(element.item) <> 'string'
        or btrim(element.item #>> '{}') = ''
    );
$$;

alter table if exists public.strategy_translations
  drop constraint if exists strategy_translations_simple_workflow_steps_check;

alter table if exists public.strategy_translations
  add constraint strategy_translations_simple_workflow_steps_check
  check (public.is_nonempty_text_array(simple_workflow_steps)) not valid;

-- Do not rewrite production rows: validate only after all existing translations
-- satisfy the new contract. New and updated rows are checked immediately.
do $$
begin
  if to_regclass('public.strategy_translations') is not null
     and not exists (
       select 1
       from public.strategy_translations
       where not public.is_nonempty_text_array(simple_workflow_steps)
     ) then
    alter table public.strategy_translations
      validate constraint strategy_translations_simple_workflow_steps_check;
  end if;
end
$$;

revoke execute on function public.is_nonempty_text_array(jsonb) from public;
grant execute on function public.is_nonempty_text_array(jsonb) to postgres, service_role;
