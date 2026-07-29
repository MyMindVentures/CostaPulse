import { z } from "zod";

export const availabilityStatuses = [
  "available",
  "limited",
  "on_request",
  "partially_booked",
  "fully_booked",
  "unavailable",
  "travelling",
  "confirmed_assignment",
  "cancelled"
] as const;

export const availabilityEntryTypes = [
  "professional_service",
  "experience",
  "manual_availability",
  "manual_block",
  "travel",
  "confirmed_assignment"
] as const;

export const availabilityCtaTypes = [
  "request_availability",
  "request_service",
  "book_experience",
  "view_details",
  "none"
] as const;

export const availabilityServiceFilters = [
  "crewing_maritime",
  "yacht_services",
  "watersports",
  "costapulse_experiences"
] as const;

export const availabilityStatusSchema = z.enum(availabilityStatuses);
export const availabilityEntryTypeSchema = z.enum(availabilityEntryTypes);
export const availabilityCtaTypeSchema = z.enum(availabilityCtaTypes);
export const availabilityServiceFilterSchema = z.enum(
  availabilityServiceFilters
);

export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
export type AvailabilityEntryType = z.infer<typeof availabilityEntryTypeSchema>;
export type AvailabilityCtaType = z.infer<typeof availabilityCtaTypeSchema>;
export type AvailabilityServiceFilter = z.infer<
  typeof availabilityServiceFilterSchema
>;

const publicAvailabilityEntrySchema = z
  .object({
    id: z.string().uuid(),
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    timezone: z.string().min(1),
    isAllDay: z.boolean(),
    status: availabilityStatusSchema,
    entryType: availabilityEntryTypeSchema,
    title: z.string().min(1),
    summary: z.string().nullable(),
    locationLabel: z.string().nullable(),
    geographicScope: z.string().nullable(),
    travelAvailable: z.boolean(),
    capacityTotal: z.number().int().positive().nullable(),
    capacityReserved: z.number().int().nonnegative(),
    capacityRemaining: z.number().int().nonnegative().nullable(),
    service: z
      .object({
        id: z.string().uuid(),
        slug: z.string().min(1),
        category: z.string().min(1),
        audience: z.array(z.string())
      })
      .nullable(),
    experience: z
      .object({
        id: z.string().uuid(),
        slug: z.string().min(1),
        variantId: z.string().uuid().nullable()
      })
      .nullable(),
    cta: z.object({
      type: availabilityCtaTypeSchema,
      label: z.string().min(1),
      path: z.string().startsWith("/").nullable()
    })
  })
  .strict();

export type PublicAvailabilityEntry = z.infer<
  typeof publicAvailabilityEntrySchema
>;

export function parsePublicAvailabilityEntries(
  value: unknown
): PublicAvailabilityEntry[] {
  return z.array(publicAvailabilityEntrySchema).parse(value);
}

export const availabilityStatusSemantics = {
  available: {
    labelKey: "status.available",
    icon: "check",
    className: "availability-status--available",
    precedence: 9
  },
  limited: {
    labelKey: "status.limited",
    icon: "gauge",
    className: "availability-status--limited",
    precedence: 6
  },
  on_request: {
    labelKey: "status.onRequest",
    icon: "message",
    className: "availability-status--on-request",
    precedence: 7
  },
  partially_booked: {
    labelKey: "status.partiallyBooked",
    icon: "users",
    className: "availability-status--partially-booked",
    precedence: 5
  },
  fully_booked: {
    labelKey: "status.fullyBooked",
    icon: "lock",
    className: "availability-status--fully-booked",
    precedence: 4
  },
  unavailable: {
    labelKey: "status.unavailable",
    icon: "ban",
    className: "availability-status--unavailable",
    precedence: 3
  },
  travelling: {
    labelKey: "status.travelling",
    icon: "plane",
    className: "availability-status--travelling",
    precedence: 8
  },
  confirmed_assignment: {
    labelKey: "status.confirmedAssignment",
    icon: "anchor",
    className: "availability-status--confirmed-assignment",
    precedence: 2
  },
  cancelled: {
    labelKey: "status.cancelled",
    icon: "x",
    className: "availability-status--cancelled",
    precedence: 1
  }
} as const satisfies Record<
  AvailabilityStatus,
  {
    labelKey: string;
    icon: string;
    className: string;
    precedence: number;
  }
>;

export function getAvailabilityStatusSemantic(status: AvailabilityStatus) {
  switch (status) {
    case "available":
    case "limited":
    case "on_request":
    case "partially_booked":
    case "fully_booked":
    case "unavailable":
    case "travelling":
    case "confirmed_assignment":
    case "cancelled":
      return availabilityStatusSemantics[status];
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
