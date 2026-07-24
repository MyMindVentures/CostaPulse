import { describe, expect, it } from "vitest";
import { createDraftBookingInputSchema } from "./schema";

describe("createDraftBookingInputSchema", () => {
  it("accepts a valid draft booking payload", () => {
    const payload = createDraftBookingInputSchema.parse({
      experienceId: "8a112c5d-0a11-4a88-b2ef-7f07d77f14cd",
      experienceVariantId: "0b84d55d-a9d1-4efe-8304-7269c24ce943",
      availabilitySlotId: "31619442-e548-4ceb-8657-f63ef81cbc41",
      customerEmail: "guest@example.com",
      partySize: 4,
      participantNotes: "Two guests need vegetarian options.",
      referralCode: "REF-123456ABCD"
    });

    expect(payload.partySize).toBe(4);
    expect(payload.customerEmail).toBe("guest@example.com");
  });

  it("rejects invalid party sizes and malformed ids", () => {
    const result = createDraftBookingInputSchema.safeParse({
      experienceId: "not-a-uuid",
      experienceVariantId: "also-not-a-uuid",
      customerEmail: "guest@example.com",
      partySize: 0
    });

    expect(result.success).toBe(false);
  });
});
