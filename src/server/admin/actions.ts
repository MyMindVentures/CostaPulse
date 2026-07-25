"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assignAdminSlotTeam,
  updateAdminBookingStatus,
  upsertAdminSlot
} from "@/server/repositories/admin-ops";
import {
  AdminApiError,
  availabilityStatusSchema,
  bookingStatusSchema
} from "@/server/admin/schemas";
import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  canMutateAdminSlots,
  canMutateBookingStatus
} from "@/server/auth/role-access";

export type AdminActionResult =
  | { ok: true; id?: string; data?: unknown }
  | { ok: false; message: string; status?: number };

function toActionError(error: unknown): AdminActionResult {
  if (error instanceof AdminApiError) {
    return { ok: false, message: error.message, status: error.status };
  }
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }
  return { ok: false, message: "Unexpected error" };
}

const updateStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: bookingStatusSchema,
  reason: z.string().trim().max(500).optional()
});

export async function updateBookingStatusAction(
  input: z.infer<typeof updateStatusSchema>
): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateBookingStatus(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid booking status update" };
  }

  try {
    await updateAdminBookingStatus({
      bookingId: parsed.data.bookingId,
      status: parsed.data.status,
      reason: parsed.data.reason ?? null
    });
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const upsertSlotSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  experienceId: z.string().uuid(),
  experienceVariantId: z.string().uuid(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  timezone: z.string().trim().min(1).max(64).default("Europe/Madrid"),
  capacityTotal: z.coerce.number().int().positive().max(500),
  status: availabilityStatusSchema.default("scheduled"),
  notes: z.string().trim().max(2000).optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  bookingCutoffAt: z.string().optional().nullable(),
  isInstantConfirmation: z.boolean().optional()
});

export async function upsertSlotAction(
  input: z.infer<typeof upsertSlotSchema>
): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminSlots(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }

  const parsed = upsertSlotSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid slot payload" };
  }

  try {
    await upsertAdminSlot({
      id: parsed.data.id,
      payload: {
        experience_id: parsed.data.experienceId,
        experience_variant_id: parsed.data.experienceVariantId,
        starts_at: parsed.data.startsAt,
        ends_at: parsed.data.endsAt,
        timezone: parsed.data.timezone,
        capacity_total: parsed.data.capacityTotal,
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        location_id: parsed.data.locationId ?? null,
        booking_cutoff_at: parsed.data.bookingCutoffAt ?? null,
        is_instant_confirmation: parsed.data.isInstantConfirmation ?? false
      }
    });
    revalidatePath("/admin/calendar");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const assignTeamSchema = z.object({
  slotId: z.string().uuid(),
  teamMemberIds: z.array(z.string().uuid()).max(20),
  primaryTeamMemberId: z.string().uuid().optional().nullable()
});

export async function assignSlotTeamAction(
  input: z.infer<typeof assignTeamSchema>
): Promise<AdminActionResult> {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminSlots(roles)) {
    return { ok: false, message: "Forbidden", status: 403 };
  }

  const parsed = assignTeamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid team assignment" };
  }

  try {
    await assignAdminSlotTeam({
      slotId: parsed.data.slotId,
      teamMembers: parsed.data.teamMemberIds.map((id) => ({
        team_member_id: id,
        role_label: "Host",
        is_primary: parsed.data.primaryTeamMemberId === id
      }))
    });
    revalidatePath("/admin/calendar");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
