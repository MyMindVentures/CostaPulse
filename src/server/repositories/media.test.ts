import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedMediaPlacements } from "./media";

describe("getPublishedMediaPlacements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty map for an empty scope key list", async () => {
    await expect(
      getPublishedMediaPlacements("experience", [])
    ).resolves.toEqual(new Map());
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns an empty map when Supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(
      getPublishedMediaPlacements("experience", ["boat-experience"])
    ).resolves.toEqual(new Map());
  });
});
