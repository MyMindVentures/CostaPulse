import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => null)
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null)
}));

import { getPublicExperienceBookingStories } from "./booking-stories";

describe("public booking stories repository", () => {
  it("returns a truthful empty page when Supabase is unavailable", async () => {
    await expect(
      getPublicExperienceBookingStories({
        experienceSlug: "sunset-cruise",
        limit: 6,
        offset: 0
      })
    ).resolves.toEqual({
      items: [],
      nextOffset: null
    });
  });
});
