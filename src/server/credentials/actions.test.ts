import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCredentialGrantAndSendMagicLinkAction,
  createCredentialShareLinkAction,
  resendCredentialMagicLinkAction,
  revokeCredentialGrantAction
} from "./actions";

describe("credential actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("rejects invalid create grant payload", async () => {
    const result = await createCredentialGrantAndSendMagicLinkAction({
      recipientEmail: "invalid",
      recipientAgencyLabel: null,
      documentIds: [],
      selectedFileRoles: ["primary"],
      accessExpiresAt: null,
      permissionViewFiles: true,
      permissionDownloadFiles: true,
      permissionIncludeHistory: false,
      permissionIncludeDocumentNumber: false,
      message: null
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid credential invitation payload."
    });
  });

  it("returns not configured when Supabase is unavailable", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    const result = await createCredentialGrantAndSendMagicLinkAction({
      recipientEmail: "reviewer@example.com",
      recipientAgencyLabel: null,
      documentIds: ["11111111-1111-4111-8111-111111111111"],
      selectedFileRoles: ["primary"],
      accessExpiresAt: null,
      permissionViewFiles: true,
      permissionDownloadFiles: false,
      permissionIncludeHistory: false,
      permissionIncludeDocumentNumber: false,
      message: null
    });

    expect(result).toEqual({
      ok: false,
      message: "Authentication is not configured."
    });
  });

  it("creates a share link with configured site origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.costapulse.test");

    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: "share-id", error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc
    } as never);

    const result = await createCredentialShareLinkAction({
      grantId: "11111111-1111-4111-8111-111111111111",
      expiresAt: "2027-01-01T00:00:00.000Z",
      recipientEmail: null,
      recipientAgencyLabel: null,
      maxViews: null,
      maxDownloads: null
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.shareId).toBe("share-id");
      expect(
        result.shareUrl.startsWith(
          "https://app.costapulse.test/shared/credentials/"
        )
      ).toBe(true);
    }

    expect(rpc).toHaveBeenCalledWith(
      "create_credential_share_link",
      expect.objectContaining({
        p_grant_id: "11111111-1111-4111-8111-111111111111",
        p_expires_at: "2027-01-01T00:00:00.000Z"
      })
    );

    vi.unstubAllEnvs();
  });

  it("revoke action returns rpc error message", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "GRANT_NOT_FOUND" }
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc
    } as never);

    const result = await revokeCredentialGrantAction({
      grantId: "11111111-1111-4111-8111-111111111111",
      reason: null
    });

    expect(result).toEqual({ ok: false, message: "GRANT_NOT_FOUND" });
  });

  it("resend action marks magic link after otp", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { signInWithOtp },
      rpc
    } as never);

    const result = await resendCredentialMagicLinkAction({
      grantId: "11111111-1111-4111-8111-111111111111",
      recipientEmail: "REVIEWER@example.com"
    });

    expect(result).toEqual({ ok: true });
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "reviewer@example.com" })
    );
    expect(rpc).toHaveBeenCalledWith("mark_credential_magic_link_sent", {
      p_grant_id: "11111111-1111-4111-8111-111111111111"
    });
  });
});
