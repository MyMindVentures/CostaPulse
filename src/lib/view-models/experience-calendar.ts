import { z } from "zod";
import {
  parseTeamMemberSummaries,
  type TeamMemberSummary
} from "@/lib/view-models/team-member";

const availabilityStatusSchema = z.enum([
  "scheduled",
  "sold_out",
  "unavailable",
  "cancelled",
  "completed"
]);

/** Raw row shape from `get_experience_calendar`. */
export const experienceCalendarRpcRowSchema = z.object({
  slot_id: z.string().uuid(),
  experience_id: z.string().uuid(),
  experience_variant_id: z.string().uuid(),
  variant_name: z.string().min(1),
  location_id: z.string().uuid().nullable(),
  location_name: z.string().nullable(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  starts_at: z.string().min(1),
  ends_at: z.string().min(1),
  timezone: z.string().min(1),
  capacity_total: z.number().int().nonnegative(),
  capacity_reserved: z.number().int().nonnegative(),
  capacity_available: z.number().int().nonnegative(),
  status: availabilityStatusSchema,
  booking_cutoff_at: z.string().nullable(),
  is_instant_confirmation: z.boolean(),
  assigned_team_members: z.unknown().nullable()
});

export type ExperienceCalendarRpcRow = z.infer<
  typeof experienceCalendarRpcRowSchema
>;

export type ExperienceCalendarSlot = {
  slotId: string;
  experienceId: string;
  variant: {
    id: string;
    name: string;
  };
  location: {
    id: string | null;
    name: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  startsAt: string;
  endsAt: string;
  timezone: string;
  capacity: {
    total: number;
    reserved: number;
    available: number;
  };
  status: z.infer<typeof availabilityStatusSchema>;
  bookingCutoffAt: string | null;
  isInstantConfirmation: boolean;
  teamMembers: TeamMemberSummary[];
};

export function mapExperienceCalendarRow(
  row: ExperienceCalendarRpcRow
): ExperienceCalendarSlot {
  return {
    slotId: row.slot_id,
    experienceId: row.experience_id,
    variant: {
      id: row.experience_variant_id,
      name: row.variant_name
    },
    location: {
      id: row.location_id,
      name: row.location_name,
      latitude: row.latitude,
      longitude: row.longitude
    },
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    capacity: {
      total: row.capacity_total,
      reserved: row.capacity_reserved,
      available: row.capacity_available
    },
    status: row.status,
    bookingCutoffAt: row.booking_cutoff_at,
    isInstantConfirmation: row.is_instant_confirmation,
    teamMembers: parseTeamMemberSummaries(row.assigned_team_members)
  };
}

export function parseExperienceCalendarRows(
  rows: unknown
): ExperienceCalendarSlot[] {
  if (!Array.isArray(rows)) return [];

  const slots: ExperienceCalendarSlot[] = [];
  for (const row of rows) {
    const parsed = experienceCalendarRpcRowSchema.safeParse(row);
    if (!parsed.success) continue;
    slots.push(mapExperienceCalendarRow(parsed.data));
  }
  return slots;
}
