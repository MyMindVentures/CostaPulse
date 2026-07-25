import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/protected-area", () => ({
  requireAreaAccess: vi.fn()
}));

vi.mock("@/server/auth/role-access", () => ({
  canMutateAdminContent: vi.fn()
}));

vi.mock("@/server/repositories/admin-booking-stories", () => ({
  archiveBookingStory: vi.fn(),
  attachBookingStoryMedia: vi.fn(),
  createBookingStory: vi.fn(),
  findBookingFootageAsset: vi.fn(),
  publishBookingStory: vi.fn(),
  removeBookingStoryMedia: vi.fn(),
  setBookingStoryCover: vi.fn(),
  updateBookingStory: vi.fn()
}));

import { revalidatePath } from "next/cache";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canMutateAdminContent } from "@/server/auth/role-access";
import { createBookingStory } from "@/server/repositories/admin-booking-stories";
import { createBookingStoryAction } from "./actions-booking-stories";

describe("booking story admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAreaAccess).mockResolvedValue({
      userId: "user-1",
      roles: ["content_manager"]
    });
    vi.mocked(canMutateAdminContent).mockReturnValue(true);
  });

  it("rejects invalid story form data without calling the repository", async () => {
    const form = new FormData();
    form.set("bookingId", "not-a-uuid");
    form.set("title", "");

    await expect(createBookingStoryAction(form)).resolves.toEqual({
      ok: false,
      message: "Invalid story"
    });
    expect(createBookingStory).not.toHaveBeenCalled();
  });

  it("creates a valid story and revalidates the admin listing", async () => {
    vi.mocked(createBookingStory).mockResolvedValue({
      ok: true,
      data: { id: "story-1" }
    } as never);
    const form = new FormData();
    form.set("bookingId", "11111111-1111-4111-8111-111111111111");
    form.set("title", "  Summer at sea  ");

    await expect(createBookingStoryAction(form)).resolves.toMatchObject({
      ok: true
    });
    expect(createBookingStory).toHaveBeenCalledWith({
      p_booking_id: "11111111-1111-4111-8111-111111111111",
      p_title: "Summer at sea"
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/booking-stories");
  });

  it("rejects callers without content mutation permission", async () => {
    vi.mocked(canMutateAdminContent).mockReturnValue(false);
    const form = new FormData();
    form.set("bookingId", "11111111-1111-4111-8111-111111111111");
    form.set("title", "Summer at sea");

    await expect(createBookingStoryAction(form)).rejects.toThrow("Forbidden");
  });
});
