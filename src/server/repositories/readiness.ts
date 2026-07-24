import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DependencyCheck } from "@/server/readiness/report";

export async function getSupabaseDependencyCheck(): Promise<DependencyCheck> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      name: "supabase",
      status: "disabled",
      detail: "Supabase admin credentials are not fully configured."
    };
  }

  const { data, error } = await supabase
    .from("app_healthchecks")
    .select("name, description")
    .eq("name", "supabase")
    .maybeSingle();

  if (error) {
    return {
      name: "supabase",
      status: "failed",
      detail: "Supabase connectivity probe failed."
    };
  }

  if (!data) {
    return {
      name: "supabase",
      status: "failed",
      detail: "Supabase healthcheck row is missing."
    };
  }

  return {
    name: data.name,
    status: "configured",
    detail: data.description
  };
}
