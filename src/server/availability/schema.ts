import { z } from "zod";

export const availabilityQuerySchema = z
  .object({
    variantId: z.string().uuid(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
      .optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
      .optional(),
    partySize: z.coerce.number().int().min(1).max(50)
  })
  .superRefine((value, ctx) => {
    const hasDate = Boolean(value.date);
    const hasRange = Boolean(value.from) || Boolean(value.to);

    if (!hasDate && !hasRange) {
      ctx.addIssue({
        code: "custom",
        message: "Provide date, or from and to.",
        path: ["date"]
      });
    }

    if (hasDate && hasRange) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either date or from/to, not both.",
        path: ["date"]
      });
    }

    if ((value.from && !value.to) || (!value.from && value.to)) {
      ctx.addIssue({
        code: "custom",
        message: "from and to are both required for a calendar range.",
        path: ["from"]
      });
    }

    if (value.from && value.to && value.from > value.to) {
      ctx.addIssue({
        code: "custom",
        message: "from must be on or before to.",
        path: ["from"]
      });
    }
  });

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const availabilitySlotSchema = z.object({
  id: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  localStartLabel: z.string().min(1),
  capacityRemaining: z.number().int().nonnegative(),
  capacityTotal: z.number().int().positive(),
  isInstantConfirmation: z.boolean(),
  locationId: z.string().uuid().nullable()
});

export const calendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  level: z.enum(["good", "limited", "full", "none"]),
  capacityAvailable: z.number().int().nonnegative(),
  capacityTotal: z.number().int().nonnegative(),
  slotCount: z.number().int().nonnegative()
});

export const availabilityOkResponseSchema = z.object({
  status: z.literal("ok"),
  timezone: z.string().min(1),
  slots: z.array(availabilitySlotSchema).optional(),
  days: z.array(calendarDaySchema).optional()
});

export type AvailabilityOkResponse = z.infer<
  typeof availabilityOkResponseSchema
>;
