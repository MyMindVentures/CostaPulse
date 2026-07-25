import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parsePartnerDirectoryRows,
  type PartnerDirectoryData
} from "@/lib/view-models/partner-directory";

export type PartnerDirectoryResult =
  | { ok: true; data: PartnerDirectoryData }
  | { ok: false; error: "unavailable" | "query_failed" };

export async function getPublicPartnerDirectory(
  locale: string
): Promise<PartnerDirectoryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "unavailable" };

  const { data, error } = await supabase.rpc("get_public_partner_directory", {
    p_locale: locale
  });
  if (error) {
    console.error("[getPublicPartnerDirectory]", error.message);
    return { ok: false, error: "query_failed" };
  }

  return {
    ok: true,
    data: parsePartnerDirectoryRows(data, process.env.NEXT_PUBLIC_SUPABASE_URL)
  };
}
