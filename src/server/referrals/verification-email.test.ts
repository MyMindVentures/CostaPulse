import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { renderReferralVerificationEmail } from "./verification-email";

describe("renderReferralVerificationEmail", () => {
  it.each(["en", "nl", "fr", "es", "de"] as const)(
    "renders localized HTML for %s",
    (locale) => {
      const result = renderReferralVerificationEmail({
        locale,
        firstName: "Ana",
        partnerName: "La Marina",
        verificationUrl:
          "https://www.costapulse.club/api/referrals/verify?token=abc"
      });
      expect(result.subject.length).toBeGreaterThan(10);
      expect(result.html).toContain("La Marina");
      expect(result.html).toContain("token=abc");
    }
  );

  it("escapes customer and partner values", () => {
    const result = renderReferralVerificationEmail({
      locale: "en",
      firstName: "<Ana>",
      partnerName: 'Marina "One"',
      verificationUrl: "https://example.com/?token=<unsafe>"
    });
    expect(result.html).not.toContain("<Ana>");
    expect(result.html).toContain("&lt;Ana&gt;");
    expect(result.html).toContain("&quot;One&quot;");
    expect(result.html).toContain("&lt;unsafe&gt;");
  });
});
