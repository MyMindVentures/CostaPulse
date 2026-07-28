import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseStrategyRows,
  type StrategyPageViewModel
} from "@/features/strategies/strategy-view-model";

export type StrategiesResult =
  | { status: "success"; page: StrategyPageViewModel }
  | { status: "error" };

/** Public, RLS-scoped strategy read model. Malformed JSON never crosses this boundary. */
export async function getPublicStrategies(
  locale: string
): Promise<StrategiesResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error" };

  const { data, error } = await supabase.rpc("get_public_strategy_cards", {
    requested_locale: locale
  });

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
