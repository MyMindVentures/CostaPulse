import { afterEach, describe, expect, it } from "vitest";
import { getServerEnvReport } from "./report";

const originalEnv = { ...process.env };

const relevantKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST"
] as const;

function resetRelevantEnv() {
  for (const key of relevantKeys) {
    delete process.env[key];
  }
}

describe("getServerEnvReport", () => {
  afterEach(() => {
    resetRelevantEnv();

    for (const key of relevantKeys) {
      const originalValue = originalEnv[key];
      if (typeof originalValue === "string") {
        process.env[key] = originalValue;
      }
    }
  });

  it("is ready when the required site URL is configured and optional integrations are disabled", () => {
    resetRelevantEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club";

    const report = getServerEnvReport();

    expect(report.ready).toBe(true);
    expect(
      report.checks.find((check) => check.name === "siteUrl")
    ).toMatchObject({
      status: "configured",
      missingKeys: []
    });
    expect(
      report.checks.find((check) => check.name === "supabasePublic")
    ).toMatchObject({
      status: "disabled"
    });
  });

  it("is not ready when the required site URL is missing", () => {
    resetRelevantEnv();

    const report = getServerEnvReport();

    expect(report.ready).toBe(false);
    expect(
      report.checks.find((check) => check.name === "siteUrl")
    ).toMatchObject({
      status: "disabled",
      missingKeys: ["NEXT_PUBLIC_SITE_URL"]
    });
  });

  it("is not ready when an optional integration is partially configured", () => {
    resetRelevantEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

    const report = getServerEnvReport();

    expect(report.ready).toBe(false);
    expect(
      report.checks.find((check) => check.name === "supabasePublic")
    ).toMatchObject({
      status: "invalid",
      missingKeys: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
    });
  });
});
