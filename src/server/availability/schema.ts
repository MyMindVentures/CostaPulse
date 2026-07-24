import { z } from "zod";

export const availabilityQuerySchema = z.object({
  variantId: z.string().uuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  partySize: z.coerce.number().int().min(1).max(50)
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const availabilitySlotSchema = z.object({
  id: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  localStartLabel: z.string().min(1),
  capacityRemaining: z.number().int().nonnegative(),
  isInstantConfirmation: z.boolean()
});

export const availabilityOkResponseSchema = z.object({
  status: z.literal("ok"),
  timezone: z.string().min(1),
  slots: z.array(availabilitySlotSchema)
});

export type AvailabilityOkResponse = z.infer<typeof availabilityOkResponseSchema>;
