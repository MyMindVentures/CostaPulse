import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminApiError, adminApiErrorSchema } from "./schemas";

export type AdminApiAction =
  | "reference_data"
  | "dashboard_overview"
  | "list_bookings"
  | "booking_detail"
  | "update_booking_status"
  | "list_calendar"
  | "upsert_slot"
  | "assign_slot_team"
  | "list_customers"
  | "customer_detail"
  | "list_experiences"
  | "experience_detail"
  | "upsert_experience"
  | "upsert_variant"
  | "replace_experience_collection"
  | "upsert_addon"
  | "list_locations"
  | "upsert_location"
  | "list_partners"
  | "partner_detail"
  | "upsert_partner"
  | "list_team_members"
  | "team_member_detail"
  | "upsert_team_member"
  | "replace_team_collection"
  | "list_media"
  | "upsert_media_asset"
  | "link_media_to_scope"
  | "delete_media"
  | "create_signed_upload"
  | "delete_entity";

type AdminApiBody = {
  action: AdminApiAction;
} & Record<string, unknown>;

type CallAdminApiOptions<T> = {
  body: AdminApiBody;
  schema: z.ZodType<T>;
  /** When true, accept empty/null data as null without failing parse. */
  allowNull?: boolean;
};

async function getAccessToken(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new AdminApiError("Supabase is not configured", 503);
  }

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new AdminApiError("Authentication required", 401);
  }

  return session.access_token;
}

function getAdminApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new AdminApiError("Supabase URL is not configured", 503);
  }
  return `${base.replace(/\/$/, "")}/functions/v1/admin-api`;
}

function getPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new AdminApiError("Supabase publishable key is not configured", 503);
  }
  return key;
}

/**
 * Calls the deployed Supabase Edge Function `admin-api` with the signed-in
 * user's JWT. Never exposes the service role to the browser.
 */
export async function callAdminApi<T>({
  body,
  schema,
  allowNull = false
}: CallAdminApiOptions<T>): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(getAdminApiUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: getPublishableKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload: unknown = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const parsed = adminApiErrorSchema.safeParse(payload);
    throw new AdminApiError(
      parsed.success
        ? parsed.data.error
        : `Admin API error (${response.status})`,
      response.status,
      parsed.success ? parsed.data.code : undefined
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
  ) {
    const parsed = adminApiErrorSchema.parse(payload);
    throw new AdminApiError(parsed.error, response.status, parsed.code);
  }

  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (data == null && allowNull) {
    return null as T;
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new AdminApiError(
      `Invalid admin API response for ${body.action}: ${parsed.error.message}`,
      502
    );
  }

  return parsed.data;
}
