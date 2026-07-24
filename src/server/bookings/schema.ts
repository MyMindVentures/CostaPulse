import { z } from "zod";

export const createBookingInputSchema = z.object({
  availabilitySlotId: z.string().uuid(),
  partySize: z.int().min(1).max(50),
  customerEmail: z.email(),
  contactFirstName: z.string().trim().min(1).max(80),
  contactLastName: z.string().trim().min(1).max(80),
  customerPhone: z.string().trim().min(5).max(40).optional(),
  preferredLanguage: z
    .string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "preferredLanguage must be a locale code")
    .default("en"),
  specialRequests: z.string().trim().max(1000).optional(),
  termsAccepted: z.literal(true),
  idempotencyKey: z.string().uuid(),
  anonymousSessionId: z.string().uuid().optional(),
  referralCode: z.string().trim().max(64).optional(),
  participants: z
    .array(
      z.object({
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().max(80).optional(),
        email: z.email().optional(),
        phone: z.string().trim().max(40).optional(),
        isLead: z.boolean().optional(),
        dietaryNotes: z.string().trim().max(500).optional(),
        medicalNotes: z.string().trim().max(500).optional(),
        accessibilityNotes: z.string().trim().max(500).optional()
      })
    )
    .optional()
});

export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;

export const setParticipantsInputSchema = z.object({
  participants: z.array(
    z.object({
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().max(80).optional(),
      email: z.email().optional(),
      phone: z.string().trim().max(40).optional(),
      isLead: z.boolean().optional(),
      dietaryNotes: z.string().trim().max(500).optional(),
      medicalNotes: z.string().trim().max(500).optional(),
      accessibilityNotes: z.string().trim().max(500).optional()
    })
  )
});

export type SetParticipantsInput = z.infer<typeof setParticipantsInputSchema>;

export const BOOKING_RPC_ERROR_CODES = [
  "INVALID_PARTY_SIZE",
  "CUSTOMER_EMAIL_REQUIRED",
  "TERMS_NOT_ACCEPTED",
  "SLOT_NOT_FOUND",
  "SLOT_NOT_BOOKABLE",
  "SLOT_ALREADY_STARTED",
  "BOOKING_CUTOFF_PASSED",
  "VARIANT_NOT_FOUND",
  "EXPERIENCE_NOT_AVAILABLE",
  "PARTY_SIZE_OUT_OF_RANGE",
  "INSUFFICIENT_CAPACITY",
  "BOOKING_NOT_FOUND",
  "NOT_AUTHORIZED",
  "PARTICIPANTS_MUST_BE_ARRAY",
  "PARTICIPANT_COUNT_MISMATCH",
  "INVALID_BOOKING_STATUS",
  "BOOKING_EXPIRED"
] as const;

export type BookingRpcErrorCode = (typeof BOOKING_RPC_ERROR_CODES)[number];

export function mapBookingRpcError(message: string): {
  code: BookingRpcErrorCode | "BOOKING_RPC_FAILED";
  status: 400 | 404 | 409 | 403 | 503;
} {
  const match = BOOKING_RPC_ERROR_CODES.find((code) => message.includes(code));
  if (!match) {
    return { code: "BOOKING_RPC_FAILED", status: 503 };
  }

  switch (match) {
    case "SLOT_NOT_FOUND":
    case "VARIANT_NOT_FOUND":
    case "EXPERIENCE_NOT_AVAILABLE":
    case "BOOKING_NOT_FOUND":
      return { code: match, status: 404 };
    case "INSUFFICIENT_CAPACITY":
    case "SLOT_NOT_BOOKABLE":
    case "SLOT_ALREADY_STARTED":
    case "BOOKING_CUTOFF_PASSED":
    case "BOOKING_EXPIRED":
    case "INVALID_BOOKING_STATUS":
      return { code: match, status: 409 };
    case "NOT_AUTHORIZED":
      return { code: match, status: 403 };
    default:
      return { code: match, status: 400 };
  }
}
