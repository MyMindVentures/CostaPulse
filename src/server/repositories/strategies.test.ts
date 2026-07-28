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
    await expect(getPublicStrategies()).resolves.toEqual({ status: "error" });
  });

  it("returns an empty success state for a valid empty read model", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ from } as never);

    await expect(getPublicStrategies()).resolves.toEqual({
      status: "success",
      strategies: []
    });
    expect(from).toHaveBeenCalledWith("strategy_cards_public");
  });

  it("contains malformed JSON at the repository boundary", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ audience_key: "partner" }],
      error: null
    });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ from } as never);

    await expect(getPublicStrategies()).resolves.toEqual({ status: "error" });
  });
});
