import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/protected-area", () => ({
  requireAreaAccess: vi.fn()
}));

vi.mock("@/server/repositories/admin-ops", () => ({
  updateAdminBookingStatus: vi.fn(),
  upsertAdminSlot: vi.fn(),
  assignAdminSlotTeam: vi.fn()
}));

import { requireAreaAccess } from "@/server/auth/protected-area";
import { updateBookingStatusAction } from "./actions";

describe("updateBookingStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects callers without booking mutation permission", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["customer"]
    });

    await expect(
      updateBookingStatusAction({
        bookingId: "11111111-1111-4111-8111-111111111111",
        status: "confirmed"
      })
    ).resolves.toEqual({ ok: false, message: "Forbidden", status: 403 });
  });

  it("rejects invalid booking ids", async () => {
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["operations_staff"]
    });

    await expect(
      updateBookingStatusAction({
        bookingId: "not-a-uuid",
        status: "confirmed"
      })
    ).resolves.toEqual({ ok: false, message: "Invalid booking status update" });
  });
});
