import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/server/repositories/media", () => ({
  getPublishedMediaPlacements: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getPublishedExperienceBySlug,
  getPublishedExperienceCards
} from "./catalog";

describe("catalog repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty card list when Supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(getPublishedExperienceCards(3, "nl")).resolves.toEqual([]);
  });

  it("returns null for detail when Supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(
      getPublishedExperienceBySlug("boat-experience", "nl")
    ).resolves.toBeNull();
  });
});
