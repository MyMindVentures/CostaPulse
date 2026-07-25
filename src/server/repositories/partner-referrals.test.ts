import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => null)
}));

import { listOwnedPartners } from "./partner-referrals";

describe("listOwnedPartners", () => {
  it("returns a truthful empty state when Supabase is unavailable", async () => {
    await expect(
      listOwnedPartners("11111111-1111-4111-8111-111111111111")
    ).resolves.toEqual([]);
  });
});
