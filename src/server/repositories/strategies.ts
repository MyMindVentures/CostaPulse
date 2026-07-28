import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseStrategyRows,
  type StrategyPageViewModel
} from "@/features/strategies/strategy-view-model";

export type StrategiesResult =
  | { status: "success"; page: StrategyPageViewModel }
  | { status: "error" };

type StrategyQueryClient = {
  from: (relation: string) => {
    select: (columns: string) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{ data: unknown; error: unknown }>;
    };
  };
};

/** Public, RLS-scoped strategy read model. Malformed JSON never crosses this boundary. */
export async function getPublicStrategies(): Promise<StrategiesResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error" };

  // The deployed public view is newer than the checked-in generated types. Zod
  // remains the runtime contract until the next generated-types sync. Cast the
  // client, not the `from` method, so Supabase keeps the method's `this` binding.
  const queryClient = supabase as unknown as StrategyQueryClient;
  const { data, error } = await queryClient
    .from("strategy_cards_public")
    .select(
      "slug,audience_key,user_role,stakeholder_key,title,summary,description,strategy_type,status,priority,objective,target_audience,channels,success_metrics,action_plan,win_win,mission_statements,sort_order,metadata"
    )
    .order("sort_order", { ascending: true });

  if (error) return { status: "error" };
  const parsed = (() => {
    try {
      return parseStrategyRows(data);
    } catch {
      return null;
    }
  })();
  return parsed ? { status: "success", page: parsed } : { status: "error" };
}
