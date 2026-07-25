import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminArea, type AppRole } from "./role-access";

type AdminSessionContext =
  | { status: "missing_config" }
  | { status: "unauthenticated" }
  | { status: "forbidden"; userId: string; roles: AppRole[] }
  | { status: "authorized"; userId: string; roles: AppRole[] };

export async function getAdminSessionContext(): Promise<AdminSessionContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "missing_config" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);

  if (error) {
    return { status: "forbidden", userId: user.id, roles: [] };
  }

  const roles = userRoles.map((entry) => entry.role);
  if (!canAccessAdminArea(roles)) {
    return { status: "forbidden", userId: user.id, roles };
  }

  return { status: "authorized", userId: user.id, roles };
}

export async function requireAdminAccess() {
  const context = await getAdminSessionContext();

  if (context.status !== "authorized") {
    redirect("/login?auth=required");
  }

  return context;
}
