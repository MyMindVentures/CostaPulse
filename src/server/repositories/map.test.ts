import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getExperienceMapForFilters,
  getExperienceMapItems,
  listMapFilterOptions
} from "./map";

describe("map repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports unavailable when Supabase is not configured", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(getExperienceMapItems({ locale: "nl" })).resolves.toEqual({
      ok: false,
      error: "unavailable"
    });
  });

  it("returns empty filter options when the map query is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(listMapFilterOptions("nl")).resolves.toEqual({
      experienceTypes: [],
      teamMembers: [],
      locations: []
    });
  });

  it("propagates unavailable through filter loading", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(
      getExperienceMapForFilters(
        {
          date: null,
          experienceType: null,
          teamMember: null,
          location: null
        },
        "nl"
      )
    ).resolves.toEqual({ ok: false, error: "unavailable" });
  });
});
