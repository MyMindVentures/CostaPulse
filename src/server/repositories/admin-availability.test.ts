import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAdminTeamMemberAvailability } from "./admin-availability";

describe("admin availability repository", () => {
  it("fails closed without an authenticated Supabase server client", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);
    await expect(
      fetchAdminTeamMemberAvailability({
        from: "2026-08-01T00:00:00.000Z",
        to: "2026-09-01T00:00:00.000Z"
      })
    ).rejects.toThrow("Supabase is unavailable");
  });
});
