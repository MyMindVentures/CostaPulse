"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  bulkAvailabilityInputSchema,
  teamMemberAvailabilityInputSchema,
  type TeamMemberAvailabilityInput
} from "./admin-schema";

export type AvailabilityActionResult =
  | { ok: true; id?: string; data?: unknown }
  | { ok: false; message: string; status?: number; data?: unknown };

function revalidateAvailabilityPaths(dateKey?: string) {
  revalidatePath("/availability");
  revalidatePath("/admin/availability");
  revalidatePath("/team/[slug]/availability", "page");
  if (dateKey) revalidatePath(`/availability/${dateKey}`);
}

function mutationPayload(
  input: TeamMemberAvailabilityInput,
  createdBy: string
) {
  const { id: _id, ...payload } = input;
  return {
    ...payload,
    professional_service_id: payload.professional_service_id ?? null,
    experience_id: payload.experience_id ?? null,
    experience_variant_id: payload.experience_variant_id ?? null,
    availability_slot_id: payload.availability_slot_id ?? null,
    public_title: payload.public_title ?? null,
    public_summary: payload.public_summary ?? null,
    public_location_label: payload.public_location_label ?? null,
    location_id: payload.location_id ?? null,
    geographic_scope: payload.geographic_scope ?? null,
    capacity_total: payload.capacity_total ?? null,
    cta_type: payload.cta_type ?? null,
    cta_path: payload.cta_path ?? null,
    internal_notes: payload.internal_notes ?? null,
    created_by: createdBy,
    metadata: payload.metadata as Json
  };
}

export async function saveTeamMemberAvailabilityAction(
  input: TeamMemberAvailabilityInput
): Promise<AvailabilityActionResult> {
  const { userId } = await requireAreaAccess("admin");
  const parsed = teamMemberAvailabilityInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid availability entry"
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is unavailable" };

  const { data: conflicts, error: conflictError } = await supabase.rpc(
    "check_team_member_availability_conflicts",
    {
      p_team_member_id: parsed.data.team_member_id,
      p_starts_at: parsed.data.starts_at,
      p_ends_at: parsed.data.ends_at,
      p_exclude_id: parsed.data.id ?? undefined
    }
  );
  if (conflictError) {
    return { ok: false, message: conflictError.message };
  }
  if (conflicts?.length) {
    return {
      ok: false,
      status: 409,
      message: "Availability conflicts with an existing entry",
      data: conflicts
    };
  }

  const payload = mutationPayload(parsed.data, userId);
  const mutation = parsed.data.id
    ? supabase
        .from("team_member_availability")
        .update(payload)
        .eq("id", parsed.data.id)
        .select("id")
        .single()
    : supabase
        .from("team_member_availability")
        .insert(payload)
        .select("id")
        .single();
  const { data, error } = await mutation;
  if (error) return { ok: false, message: error.message };

  revalidateAvailabilityPaths(parsed.data.starts_at.slice(0, 10));
  return { ok: true, id: data.id };
}

export async function deleteTeamMemberAvailabilityAction(
  id: string
): Promise<AvailabilityActionResult> {
  await requireAreaAccess("admin");
  const parsed = teamMemberAvailabilityInputSchema.shape.id.safeParse(id);
  if (!parsed.success || !parsed.data) {
    return { ok: false, message: "Invalid availability identifier" };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is unavailable" };
  const { error } = await supabase
    .from("team_member_availability")
    .delete()
    .eq("id", parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidateAvailabilityPaths();
  return { ok: true };
}

export async function setTeamMemberAvailabilityVisibilityAction(
  id: string,
  visibility: "public" | "authenticated" | "private"
): Promise<AvailabilityActionResult> {
  await requireAreaAccess("admin");
  const parsedId = teamMemberAvailabilityInputSchema.shape.id.safeParse(id);
  if (!parsedId.success || !parsedId.data) {
    return { ok: false, message: "Invalid availability identifier" };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is unavailable" };
  const { error } = await supabase
    .from("team_member_availability")
    .update({ visibility })
    .eq("id", parsedId.data);
  if (error) return { ok: false, message: error.message };
  revalidateAvailabilityPaths();
  return { ok: true };
}

export async function bulkCreateTeamMemberAvailabilityAction(
  entries: Omit<TeamMemberAvailabilityInput, "id">[]
): Promise<AvailabilityActionResult> {
  const { userId } = await requireAreaAccess("admin");
  const parsed = bulkAvailabilityInputSchema.safeParse({ entries });
  if (!parsed.success) {
    return { ok: false, message: "Invalid bulk availability payload" };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is unavailable" };

  for (const entry of parsed.data.entries) {
    const { data: conflicts, error: conflictError } = await supabase.rpc(
      "check_team_member_availability_conflicts",
      {
        p_team_member_id: entry.team_member_id,
        p_starts_at: entry.starts_at,
        p_ends_at: entry.ends_at
      }
    );
    if (conflictError) return { ok: false, message: conflictError.message };
    if (conflicts?.length) {
      return {
        ok: false,
        status: 409,
        message: "One or more dates conflict with existing availability",
        data: conflicts
      };
    }
  }

  const payload = parsed.data.entries.map((entry) =>
    mutationPayload({ ...entry, id: null }, userId)
  );
  const { error } = await supabase
    .from("team_member_availability")
    .insert(payload);
  if (error) return { ok: false, message: error.message };
  revalidateAvailabilityPaths();
  return { ok: true };
}

export async function bulkBlockTeamMemberDatesAction(input: {
  team_member_id: string;
  dates: string[];
  timezone: string;
  public_title: string;
  internal_notes?: string | null;
  visibility: "public" | "authenticated" | "private";
}): Promise<AvailabilityActionResult> {
  const entries = input.dates.map((date) => {
    const startsAt = new Date(`${date}T00:00:00.000Z`);
    const endsAt = new Date(startsAt);
    endsAt.setUTCDate(endsAt.getUTCDate() + 1);
    return {
      team_member_id: input.team_member_id,
      professional_service_id: null,
      experience_id: null,
      experience_variant_id: null,
      availability_slot_id: null,
      entry_type: "manual_block" as const,
      status: "unavailable" as const,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      timezone: input.timezone,
      is_all_day: true,
      public_title: input.public_title,
      public_summary: null,
      public_location_label: null,
      location_id: null,
      geographic_scope: null,
      travel_available: false,
      capacity_total: null,
      capacity_reserved: 0,
      visibility: input.visibility,
      cta_type: "none" as const,
      cta_path: null,
      internal_notes: input.internal_notes ?? null,
      metadata: {}
    };
  });
  return bulkCreateTeamMemberAvailabilityAction(entries);
}

export async function bulkBlockTeamMemberDateRangeAction(input: {
  team_member_id: string;
  start_date: string;
  end_date: string;
  timezone: string;
  public_title: string;
  internal_notes?: string | null;
  visibility: "public" | "authenticated" | "private";
}): Promise<AvailabilityActionResult> {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !datePattern.test(input.start_date) ||
    !datePattern.test(input.end_date) ||
    input.end_date < input.start_date
  ) {
    return { ok: false, message: "Invalid date range" };
  }

  const cursor = new Date(`${input.start_date}T00:00:00.000Z`);
  const last = new Date(`${input.end_date}T00:00:00.000Z`);
  const dates: string[] = [];
  while (cursor <= last && dates.length < 93) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  if (cursor <= last || dates.length === 0) {
    return { ok: false, message: "Date range must contain at most 92 days" };
  }

  return bulkBlockTeamMemberDatesAction({
    team_member_id: input.team_member_id,
    dates,
    timezone: input.timezone,
    public_title: input.public_title,
    internal_notes: input.internal_notes,
    visibility: input.visibility
  });
}
