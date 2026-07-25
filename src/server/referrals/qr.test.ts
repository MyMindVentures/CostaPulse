import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generatePartnerQrSvg, getPartnerReferralUrl } from "./qr";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("partner QR generation", () => {
  it("targets the server referral entry route", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club/";
    expect(getPartnerReferralUrl("ABC 123")).toBe(
      "https://www.costapulse.club/r/ABC%20123"
    );
  });

  it("generates an SVG locally", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club";
    const svg = await generatePartnerQrSvg("PARTNER-1");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0');
  });
});
