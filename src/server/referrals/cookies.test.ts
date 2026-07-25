import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createOpaqueToken, hashReferralToken } from "./cookies";

describe("referral token helpers", () => {
  it("creates unpredictable URL-safe opaque tokens", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("stores only a deterministic SHA-256 representation", () => {
    expect(hashReferralToken("secret")).toBe(
      "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b"
    );
    expect(hashReferralToken("secret")).not.toContain("secret");
  });
});
