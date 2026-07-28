import { describe, expect, it } from "vitest";
import {
  ANALYTICS_CONSENT_COOKIE,
  isAnalyticsConsent,
  parseAnalyticsConsentCookie
} from "./consent";

describe("analytics consent", () => {
  it("accepts only granted and denied values", () => {
    expect(isAnalyticsConsent("granted")).toBe(true);
    expect(isAnalyticsConsent("denied")).toBe(true);
    expect(isAnalyticsConsent("maybe")).toBe(false);
    expect(isAnalyticsConsent(null)).toBe(false);
  });

  it("parses the consent cookie from a header string", () => {
    expect(
      parseAnalyticsConsentCookie(
        `theme=light; ${ANALYTICS_CONSENT_COOKIE}=granted; locale=en`
      )
    ).toBe("granted");
    expect(
      parseAnalyticsConsentCookie(`${ANALYTICS_CONSENT_COOKIE}=denied`)
    ).toBe("denied");
  });

  it("returns null when the cookie is missing or invalid", () => {
    expect(parseAnalyticsConsentCookie("theme=light")).toBeNull();
    expect(
      parseAnalyticsConsentCookie(`${ANALYTICS_CONSENT_COOKIE}=maybe`)
    ).toBeNull();
    expect(parseAnalyticsConsentCookie(null)).toBeNull();
  });

  it("does not throw for malformed percent encoding", () => {
    const malformed = `${ANALYTICS_CONSENT_COOKIE}=%E0%A4%A`;

    expect(() => parseAnalyticsConsentCookie(malformed)).not.toThrow();
    expect(parseAnalyticsConsentCookie(malformed)).toBeNull();
  });
});
