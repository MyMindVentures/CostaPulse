import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestPortalMagicLinkAction } from "./actions";

describe("requestPortalMagicLinkAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("rejects invalid email format", async () => {
    const result = await requestPortalMagicLinkAction({
      email: "not-an-email"
    });

    expect(result).toEqual({
      ok: false,
      message: "Enter a valid email address."
    });
  });

  it("returns configuration error when supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    const result = await requestPortalMagicLinkAction({
      email: "agency@example.com"
    });

    expect(result).toEqual({
      ok: false,
      message: "Authentication is not configured."
    });
  });

  it("requests magic link with callback url", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.costapulse.test");

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { signInWithOtp }
    } as never);

    const result = await requestPortalMagicLinkAction({
      email: "Agency@Example.com"
    });

    expect(result.ok).toBe(true);
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "agency@example.com",
      options: {
        shouldCreateUser: true,
        emailRedirectTo:
          "https://app.costapulse.test/auth/callback?next=/portal/credentials"
      }
    });
  });

  it("returns non-enumerating success response on otp errors", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({
      error: { message: "rate limit" }
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { signInWithOtp }
    } as never);

    const result = await requestPortalMagicLinkAction({
      email: "agency@example.com"
    });

    expect(result).toEqual({
      ok: true,
      message:
        "If this address is eligible for access, a fresh magic link has been sent."
    });
  });
});
