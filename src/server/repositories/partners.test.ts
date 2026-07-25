import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicPartnerDirectory } from "./partners";

describe("partners repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports unavailable when Supabase is not configured", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(getPublicPartnerDirectory("nl")).resolves.toEqual({
      ok: false,
      error: "unavailable"
    });
  });

  it("reports a failed directory RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "database unavailable" }
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(getPublicPartnerDirectory("es")).resolves.toEqual({
      ok: false,
      error: "query_failed"
    });
    expect(rpc).toHaveBeenCalledWith("get_public_partner_directory", {
      p_locale: "es"
    });
  });

  it("maps an empty directory response", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(getPublicPartnerDirectory("en")).resolves.toEqual({
      ok: true,
      data: {
        items: [],
        totals: { partners: 0, scans: 0, bookings: 0 },
        categories: [],
        areas: []
      }
    });
  });
});
