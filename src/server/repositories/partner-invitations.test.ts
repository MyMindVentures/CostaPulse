import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicPartnerInvitation } from "./partner-invitations";

describe("partner invitations repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns unavailable invitations as null", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);
    await expect(
      getPublicPartnerInvitation("unknown", "en")
    ).resolves.toBeNull();
  });

  it("uses only the public invitation RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(
      getPublicPartnerInvitation("restaurant", "nl")
    ).resolves.toBeNull();
    expect(rpc).toHaveBeenCalledWith("get_public_partner_invitation", {
      p_partner_slug: "restaurant",
      p_locale: "nl"
    });
  });

  it("does not expose query failures", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "database unavailable" }
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      getPublicPartnerInvitation("restaurant", "fr")
    ).resolves.toBeNull();
  });
});
