import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => null)
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null)
}));

import {
  createBookingStory,
  findBookingFootageAsset,
  getBookingFootageUploadPolicy
} from "./admin-booking-stories";

describe("admin booking stories repository", () => {
  it("fails closed when privileged Supabase access is unavailable", async () => {
    await expect(getBookingFootageUploadPolicy()).rejects.toThrow(
      "Supabase admin access is not configured"
    );
  });

  it("rejects media lookups outside the booking footage bucket", async () => {
    await expect(
      findBookingFootageAsset("experience-media", "story/cover.jpg")
    ).resolves.toBeNull();
  });

  it("returns a truthful mutation error when Supabase is unavailable", async () => {
    await expect(
      createBookingStory({
        p_booking_id: "11111111-1111-4111-8111-111111111111",
        p_title: "Summer at sea"
      })
    ).resolves.toEqual({
      ok: false,
      message: "Supabase is not configured"
    });
  });
});
