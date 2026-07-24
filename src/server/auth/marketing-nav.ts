import "server-only";
import type { NavAudience } from "@/config/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveNavAudience, type AppRole } from "./role-access";

export type MarketingNavContext = {
  audience: NavAudience;
  userId?: string;
};

/**
 * Resolves navbar audience from the current session when available.
 * Does not invent auth flows — guests remain guests when unauthenticated
 * or when Supabase is not configured.
 */
export async function getMarketingNavContext(): Promise<MarketingNavContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { audience: "guest" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { audience: "guest" };
  }

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);

  if (error || !userRoles) {
    return { audience: "customer", userId: user.id };
  }

  const roles = userRoles.map((entry) => entry.role as AppRole);
  return {
    audience: resolveNavAudience(roles),
    userId: user.id
  };
}
