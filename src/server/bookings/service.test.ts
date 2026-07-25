import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => null)
}));

import { createExperienceBooking } from "./service";

describe("createExperienceBooking", () => {
  it("fails truthfully when the privileged backend is unavailable", async () => {
    await expect(
      createExperienceBooking({
        availabilitySlotId: "11111111-1111-4111-8111-111111111111",
        partySize: 2,
        customerEmail: "guest@example.com",
        contactFirstName: "Guest",
        contactLastName: "One",
        preferredLanguage: "en",
        termsAccepted: true,
        idempotencyKey: "22222222-2222-4222-8222-222222222222"
      })
    ).resolves.toMatchObject({
      ok: false,
      code: "SUPABASE_NOT_CONFIGURED"
    });
  });
});
