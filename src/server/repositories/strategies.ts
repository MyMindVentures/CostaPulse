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
  rpc: (
    functionName: "get_public_strategy_cards",
    parameters: { requested_locale: string }
  ) => Promise<{ data: unknown; error: unknown }>;
};

/** Public, RLS-scoped strategy read model. Malformed JSON never crosses this boundary. */
export async function getPublicStrategies(
  locale: string
): Promise<StrategiesResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error" };

  // The localized RPC is newer than the checked-in generated types. Zod remains
  // the runtime contract until the next generated-types sync.
  const queryClient = supabase as unknown as StrategyQueryClient;
  const { data, error } = await queryClient.rpc("get_public_strategy_cards", {
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
