import { z } from "zod";
import {
  availabilityCtaTypeSchema,
  availabilityEntryTypeSchema,
  availabilityStatusSchema
} from "@/lib/view-models/team-member-availability";

const optionalUuid = z.string().uuid().nullable().optional();
const optionalText = z.string().trim().max(2000).nullable().optional();

export const teamMemberAvailabilityInputSchema = z
  .object({
    id: optionalUuid,
    team_member_id: z.string().uuid(),
    professional_service_id: optionalUuid,
    experience_id: optionalUuid,
    experience_variant_id: optionalUuid,
    availability_slot_id: optionalUuid,
    entry_type: availabilityEntryTypeSchema,
    status: availabilityStatusSchema,
    starts_at: z.string().datetime({ offset: true }),
    ends_at: z.string().datetime({ offset: true }),
    timezone: z.string().trim().min(1).max(64),
    is_all_day: z.boolean(),
    public_title: z.string().trim().min(1).max(200).nullable().optional(),
    public_summary: optionalText,
    public_location_label: z.string().trim().max(200).nullable().optional(),
    location_id: optionalUuid,
    geographic_scope: z.string().trim().max(200).nullable().optional(),
    travel_available: z.boolean(),
    capacity_total: z.number().int().positive().nullable().optional(),
    capacity_reserved: z.number().int().nonnegative(),
    visibility: z.enum(["public", "authenticated", "private"]),
    cta_type: availabilityCtaTypeSchema.nullable().optional(),
    cta_path: z.string().startsWith("/").max(500).nullable().optional(),
    internal_notes: optionalText,
    metadata: z.record(z.string(), z.unknown())
  })
  .superRefine((value, context) => {
    if (Date.parse(value.ends_at) <= Date.parse(value.starts_at)) {
      context.addIssue({
        code: "custom",
        path: ["ends_at"],
        message: "End must be after start"
      });
    }
    if (
      value.capacity_total !== null &&
      value.capacity_total !== undefined &&
      value.capacity_reserved > value.capacity_total
    ) {
      context.addIssue({
        code: "custom",
        path: ["capacity_reserved"],
        message: "Reserved capacity exceeds total capacity"
      });
    }
    if (
      value.entry_type === "professional_service" &&
      !value.professional_service_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["professional_service_id"],
        message: "Professional service is required"
      });
    }
    if (value.entry_type === "experience" && !value.experience_id) {
      context.addIssue({
        code: "custom",
        path: ["experience_id"],
        message: "Experience is required"
      });
    }
  });

export type TeamMemberAvailabilityInput = z.infer<
  typeof teamMemberAvailabilityInputSchema
>;

export const bulkAvailabilityInputSchema = z.object({
  entries: z
    .array(teamMemberAvailabilityInputSchema.omit({ id: true }))
    .min(1)
    .max(92)
});
