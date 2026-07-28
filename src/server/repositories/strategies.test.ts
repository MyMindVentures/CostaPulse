import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStrategies } from "./strategies";

describe("strategies repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a truthful error when Supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);
    await expect(getPublicStrategies("nl")).resolves.toEqual({
      status: "error"
    });
  });

  it("passes the active locale to the localized RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(getPublicStrategies("fr")).resolves.toEqual({
      status: "success",
      page: {
        strategies: [],
        founderStrategy: null,
        roleStrategies: [],
        primaryMission: null
      }
    });
    expect(rpc).toHaveBeenCalledWith("get_public_strategy_cards", {
      requested_locale: "fr"
    });
  });

  it("contains malformed RPC data at the repository boundary", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ audience_key: "partner" }],
      error: null
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(getPublicStrategies("en")).resolves.toEqual({
      status: "error"
    });
  });
});
