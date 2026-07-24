import { z } from "zod";

export const createDraftBookingInputSchema = z.object({
  experienceId: z.string().uuid(),
  experienceVariantId: z.string().uuid(),
  availabilitySlotId: z.string().uuid().optional(),
  customerEmail: z.email(),
  partySize: z.int().min(1).max(50),
  participantNotes: z.string().trim().max(500).optional(),
  referralCode: z.string().trim().max(64).optional()
});

export type CreateDraftBookingInput = z.infer<
  typeof createDraftBookingInputSchema
>;
