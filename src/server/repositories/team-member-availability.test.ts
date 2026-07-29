import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AvailabilityRepositoryError,
  getPublicTeamMemberAvailability
} from "./team-member-availability";

describe("team-member availability repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses one range RPC and maps backend-owned filters", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(
      getPublicTeamMemberAvailability({
        teamMemberSlug: "kevin-de-vlieger",
        rangeStart: "2026-08-01T00:00:00.000Z",
        rangeEnd: "2026-09-01T00:00:00.000Z",
        locale: "en",
        serviceCategory: "watersports",
        status: "limited",
        availableOnly: true,
        location: "Alicante"
      })
    ).resolves.toEqual([]);

    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith(
      "get_public_team_member_availability",
      expect.objectContaining({
        p_team_member_slug: "kevin-de-vlieger",
        p_service_category: "",
        p_service_filter: "watersports",
        p_status: "limited",
        p_available_only: true,
        p_location: "Alicante"
      })
    );
  });

  it("fails closed when the server client is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);
    await expect(
      getPublicTeamMemberAvailability({
        teamMemberSlug: "kevin-de-vlieger",
        rangeStart: "2026-08-01T00:00:00.000Z",
        rangeEnd: "2026-09-01T00:00:00.000Z",
        locale: "en"
      })
    ).rejects.toBeInstanceOf(AvailabilityRepositoryError);
  });
});
