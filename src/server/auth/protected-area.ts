import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminArea, isTeamRole, type AppRole } from "./role-access";

export type ProtectedArea = "account" | "partner" | "admin";

export async function requireAreaAccess(area: ProtectedArea) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/?auth=required");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/?auth=required");

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);
  const roles = (data ?? []).map(({ role }) => role as AppRole);

  const authorized =
    !error &&
    (area === "account" ||
      (area === "partner" && roles.some(isTeamRole)) ||
      (area === "admin" && canAccessAdminArea(roles)));
  if (!authorized) redirect("/?auth=forbidden");

  return { userId: user.id, roles };
}
