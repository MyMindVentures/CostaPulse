import { describe, expect, it } from "vitest";
import { createBookingInputSchema, mapBookingRpcError } from "./schema";

describe("createBookingInputSchema", () => {
  it("accepts a valid booking payload", () => {
    const payload = createBookingInputSchema.parse({
      availabilitySlotId: "31619442-e548-4ceb-8657-f63ef81cbc41",
      customerEmail: "guest@example.com",
      contactFirstName: "Ada",
      contactLastName: "Lovelace",
      partySize: 4,
      termsAccepted: true,
      idempotencyKey: "8a112c5d-0a11-4a88-b2ef-7f07d77f14cd",
      preferredLanguage: "en",
      specialRequests: "Two guests need vegetarian options.",
      referralCode: "REF-123456ABCD"
    });

    expect(payload.partySize).toBe(4);
    expect(payload.customerEmail).toBe("guest@example.com");
    expect(payload.termsAccepted).toBe(true);
  });

  it("rejects missing terms acceptance and invalid party sizes", () => {
    const result = createBookingInputSchema.safeParse({
      availabilitySlotId: "not-a-uuid",
      customerEmail: "guest@example.com",
      contactFirstName: "Ada",
      contactLastName: "Lovelace",
      partySize: 0,
      termsAccepted: false,
      idempotencyKey: "8a112c5d-0a11-4a88-b2ef-7f07d77f14cd"
    });

    expect(result.success).toBe(false);
  });
});

describe("mapBookingRpcError", () => {
  it("maps capacity errors to conflict", () => {
    expect(mapBookingRpcError("INSUFFICIENT_CAPACITY")).toEqual({
      code: "INSUFFICIENT_CAPACITY",
      status: 409
    });
  });

  it("maps unknown errors to service unavailable", () => {
    expect(mapBookingRpcError("boom")).toEqual({
      code: "BOOKING_RPC_FAILED",
      status: 503
    });
  });
});
