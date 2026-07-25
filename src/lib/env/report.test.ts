import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerEnvReport } from "./report";

describe("getServerEnvReport", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks resend as invalid when only one of the required keys is set", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "");

    const report = getServerEnvReport();
    const resend = report.checks.find((check) => check.name === "resend");

    expect(resend?.status).toBe("invalid");
    expect(resend?.missingKeys).toContain("RESEND_FROM_EMAIL");
  });
});
