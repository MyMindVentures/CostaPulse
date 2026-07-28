import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseStrategyRows,
  type StrategyCardViewModel
} from "@/features/strategies/strategy-view-model";

export type StrategiesResult =
  | { status: "success"; strategies: StrategyCardViewModel[] }
  | { status: "error" };

/** Public, RLS-scoped strategy read model. Malformed JSON never crosses this boundary. */
export async function getPublicStrategies(): Promise<StrategiesResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error" };

  // The issue-specified public view is absent from the checked-in generated
  // types. Keep this narrow adapter here; Zod validates every field before the
  // result can cross the repository boundary.
  const from = supabase.from as unknown as (relation: string) => {
    select: (columns: string) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{ data: unknown; error: unknown }>;
    };
  };
  const { data, error } = await from("strategy_cards_public")
    .select(
      "audience_key,user_role,stakeholder_key,title,summary,description,objective,target_audience,channels,success_metrics,action_plan,win_win,mission_statements,sort_order,status,priority,metadata"
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
  return parsed
    ? { status: "success", strategies: parsed }
    : { status: "error" };
}
