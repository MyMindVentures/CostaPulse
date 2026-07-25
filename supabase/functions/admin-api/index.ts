import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

const groups = {
  staff: [
    "operations_staff",
    "customer_support",
    "finance_manager",
    "content_manager",
    "administrator",
    "super_administrator"
  ],
  operations: ["operations_staff", "administrator", "super_administrator"],
  support: ["customer_support", "administrator", "super_administrator"],
  finance: ["finance_manager", "administrator", "super_administrator"],
  content: ["content_manager", "administrator", "super_administrator"],
  admin: ["administrator", "super_administrator"]
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user)
    return json({ error: "Invalid session" }, 401);

  const actorId = authData.user.id;
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: { headers: { "x-admin-actor-id": actorId } }
  });
  const { data: roleRows, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("profile_id", actorId);
  if (roleError) return json({ error: roleError.message }, 500);
  const roles = new Set((roleRows ?? []).map((row) => row.role));
  const hasAny = (allowed: string[]) => allowed.some((role) => roles.has(role));
  if (!hasAny(groups.staff)) return json({ error: "Forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const rpc = async (name: string, args: Record<string, unknown> = {}) => {
    const client = createClient(url, serviceKey, {
      auth: { persistSession: false },
      global: { headers: { "x-admin-actor-id": actorId } }
    });
    const { data, error } = await client.rpc(name, args);
    if (error) throw error;
    return data;
  };

  try {
    switch (action) {
      case "reference_data":
        return json({ data: await rpc("admin_reference_data") });
      case "dashboard_overview":
        return json({
          data: await rpc("admin_dashboard_overview", {
            p_from: body.from ?? undefined,
            p_to: body.to ?? undefined
          })
        });
      case "list_bookings":
        return json({
          data: await rpc("admin_list_bookings", {
            p_page: body.page ?? 1,
            p_page_size: body.page_size ?? 25,
            p_search: body.search ?? null,
            p_status: body.status ?? null,
            p_payment_status: body.payment_status ?? null,
            p_experience_id: body.experience_id ?? null,
            p_location_id: body.location_id ?? null,
            p_from: body.from ?? null,
            p_to: body.to ?? null
          })
        });
      case "booking_detail":
        return json({
          data: await rpc("admin_booking_detail", {
            p_booking_id: body.booking_id
          })
        });
      case "update_booking_status":
        if (!hasAny([...groups.operations, "customer_support"])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_update_booking_status", {
            p_booking_id: body.booking_id,
            p_new_status: body.status,
            p_reason: body.reason ?? null
          })
        });
      case "list_calendar":
        return json({
          data: await rpc("admin_list_calendar", {
            p_from: body.from,
            p_to: body.to,
            p_experience_id: body.experience_id ?? null,
            p_location_id: body.location_id ?? null,
            p_team_member_id: body.team_member_id ?? null
          })
        });
      case "upsert_slot":
        if (!hasAny(groups.operations))
          return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_slot", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "assign_slot_team":
        if (!hasAny(groups.operations))
          return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_assign_slot_team", {
            p_slot_id: body.slot_id,
            p_team_members: body.team_members ?? []
          })
        });
      case "list_customers":
        return json({
          data: await rpc("admin_list_customers", {
            p_page: body.page ?? 1,
            p_page_size: body.page_size ?? 25,
            p_search: body.search ?? null
          })
        });
      case "customer_detail":
        return json({
          data: await rpc("admin_customer_detail", {
            p_customer_id: body.customer_id
          })
        });
      case "list_experiences":
        return json({
          data: await rpc("admin_list_experiences", {
            p_search: body.search ?? null,
            p_status: body.status ?? null
          })
        });
      case "experience_detail":
        return json({
          data: await rpc("admin_experience_detail", {
            p_experience_id: body.experience_id
          })
        });
      case "upsert_experience":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_experience", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "upsert_variant":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_variant", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "replace_experience_collection":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_replace_experience_collection", {
            p_experience_id: body.experience_id,
            p_collection: body.collection,
            p_items: body.items ?? []
          })
        });
      case "upsert_addon":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_addon", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "list_locations": {
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        const { data, error } = await admin
          .from("locations")
          .select("*")
          .order("city")
          .order("name");
        if (error) throw error;
        return json({ data: data ?? [] });
      }
      case "upsert_location":
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_upsert_location", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "list_partners": {
        if (
          !hasAny([...groups.operations, ...groups.content, ...groups.finance])
        ) {
          return json({ error: "Forbidden" }, 403);
        }
        const { data, error } = await admin
          .from("partners")
          .select("*")
          .order("name");
        if (error) throw error;
        return json({ data: data ?? [] });
      }
      case "partner_detail": {
        if (
          !hasAny([...groups.operations, ...groups.content, ...groups.finance])
        ) {
          return json({ error: "Forbidden" }, 403);
        }
        const { data: partner, error } = await admin
          .from("partners")
          .select("*")
          .eq("id", body.partner_id)
          .maybeSingle();
        if (error) throw error;
        if (!partner) return json({ error: "Partner not found" }, 404);
        const { data: media } = await admin
          .from("media_assets")
          .select("*")
          .eq("scope_type", "partner")
          .eq("scope_key", partner.slug)
          .order("display_order");
        const { data: performance } = await admin
          .from("admin_partner_performance")
          .select("*")
          .eq("partner_id", partner.id)
          .maybeSingle();
        return json({
          data: {
            ...partner,
            media: media ?? [],
            performance: performance ?? null
          }
        });
      }
      case "upsert_partner":
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_upsert_partner", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "redeem_voucher":
        if (
          !hasAny([...groups.operations, ...groups.support, ...groups.finance])
        ) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_redeem_voucher", {
            p_voucher_id: body.voucher_id,
            p_notes: body.notes ?? null
          })
        });
      case "moderate_review":
        if (!hasAny([...groups.support, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_moderate_review", {
            p_review_id: body.review_id,
            p_status: body.status,
            p_reason: body.reason ?? null
          })
        });
      case "list_team_members": {
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        const { data, error } = await admin
          .from("team_members")
          .select("*")
          .order("display_order")
          .order("first_name");
        if (error) throw error;
        return json({ data: data ?? [] });
      }
      case "team_member_detail":
        return json({
          data: await rpc("admin_team_member_detail", {
            p_team_member_id: body.team_member_id
          })
        });
      case "upsert_team_member":
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_upsert_team_member", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "replace_team_collection":
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_replace_team_collection", {
            p_team_member_id: body.team_member_id,
            p_collection: body.collection,
            p_items: body.items ?? []
          })
        });
      case "navigation_tree":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({ data: await rpc("admin_navigation_tree") });
      case "upsert_navigation_item":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_navigation_item", {
            p_id: body.id ?? null,
            p_payload: body.payload ?? {}
          })
        });
      case "finance_summary":
        if (!hasAny(groups.finance)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_finance_summary", {
            p_from: body.from,
            p_to: body.to
          })
        });
      case "set_user_roles":
        if (!hasAny(groups.admin)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_set_user_roles", {
            p_profile_id: body.profile_id,
            p_roles: body.roles ?? []
          })
        });
      case "delete_entity":
        if (!hasAny(groups.admin)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_delete_entity", {
            p_entity_type: body.entity_type,
            p_entity_id: body.entity_id,
            p_reason: body.reason ?? null
          })
        });
      case "system_health":
        if (!hasAny(groups.admin)) return json({ error: "Forbidden" }, 403);
        return json({ data: await rpc("admin_system_health") });
      case "list_media":
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        return json({
          data: await rpc("admin_list_media", {
            p_search: body.search ?? null,
            p_media_type: body.media_type ?? null,
            p_usage: body.usage ?? null,
            p_scope_type: body.scope_type ?? null,
            p_page: body.page ?? 1,
            p_page_size: body.page_size ?? 24
          })
        });
      case "upsert_media_asset":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_upsert_media_asset", {
            p_id: body.id,
            p_payload: body.payload ?? {}
          })
        });
      case "link_media_to_scope":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_link_media_to_scope", {
            p_scope_type: body.scope_type,
            p_scope_key: body.scope_key,
            p_role: body.role,
            p_items: body.items ?? []
          })
        });
      case "delete_media":
        if (!hasAny(groups.content)) return json({ error: "Forbidden" }, 403);
        return json({
          data: await rpc("admin_delete_media", {
            p_id: body.id,
            p_reason: body.reason ?? null
          })
        });
      case "create_signed_upload": {
        if (!hasAny([...groups.operations, ...groups.content])) {
          return json({ error: "Forbidden" }, 403);
        }
        const bucket = body.bucket ?? "admin-documents";
        const path = String(body.path ?? "");
        if (!path) return json({ error: "path is required" }, 400);
        const { data, error } = await admin.storage
          .from(bucket)
          .createSignedUploadUrl(path);
        if (error) throw error;
        return json({ data });
      }
      case "create_signed_download": {
        const bucket = body.bucket ?? "admin-documents";
        const path = String(body.path ?? "");
        if (!path) return json({ error: "path is required" }, 400);
        const { data, error } = await admin.storage
          .from(bucket)
          .createSignedUrl(
            path,
            Math.min(Number(body.expires_in ?? 900), 3600)
          );
        if (error) throw error;
        return json({ data });
      }
      case "export_bookings_csv": {
        if (!hasAny(groups.finance)) return json({ error: "Forbidden" }, 403);
        const payload = await rpc("admin_list_bookings", {
          p_page: 1,
          p_page_size: 100,
          p_search: body.search ?? null,
          p_status: body.status ?? null,
          p_payment_status: body.payment_status ?? null,
          p_experience_id: body.experience_id ?? null,
          p_location_id: body.location_id ?? null,
          p_from: body.from ?? null,
          p_to: body.to ?? null
        });
        const items = Array.isArray(payload?.items) ? payload.items : [];
        const headers = [
          "booking_reference",
          "status",
          "payment_status",
          "customer_email",
          "contact_first_name",
          "contact_last_name",
          "party_size",
          "currency",
          "total_amount_minor",
          "experience_title_snapshot",
          "variant_name_snapshot",
          "location_name_snapshot",
          "starts_at_snapshot",
          "created_at"
        ];
        const esc = (value: unknown) =>
          `"${String(value ?? "").replaceAll('"', '""')}"`;
        const csv = [
          headers.join(","),
          ...items.map((item: Record<string, unknown>) =>
            headers.map((h) => esc(item[h])).join(",")
          )
        ].join("\n");
        return new Response(csv, {
          status: 200,
          headers: {
            ...cors,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              "attachment; filename=costapulse-bookings.csv"
          }
        });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (error) {
    console.error("admin-api", action, error);
    const e = error as { message?: string; code?: string };
    return json(
      { error: e.message ?? "Unexpected error", code: e.code },
      e.code === "42501" ? 403 : 400
    );
  }
});
