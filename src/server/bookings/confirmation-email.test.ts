import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn()
}));

vi.mock("@/lib/resend", () => ({
  sendTransactionalEmail: vi.fn()
}));

vi.mock("@/i18n/load-messages", () => ({
  loadMessages: vi.fn(async () => ({}))
}));

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendBookingPaymentReceivedEmail } from "./confirmation-email";

describe("sendBookingPaymentReceivedEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns admin_disabled when the admin client is unavailable", async () => {
    vi.mocked(createSupabaseAdminClient).mockReturnValue(null);

    await expect(
      sendBookingPaymentReceivedEmail("11111111-1111-4111-8111-111111111111")
    ).resolves.toEqual({ ok: false, reason: "admin_disabled" });
  });
});
