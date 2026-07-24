import { afterEach, describe, expect, it } from "vitest";
import { getSentryDsn, isSentryEnabled } from "./config";

const originalDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

describe("sentry config", () => {
  afterEach(() => {
    if (typeof originalDsn === "string") {
      process.env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
    } else {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    }
  });

  it("treats a missing DSN as disabled", () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    expect(getSentryDsn()).toBeNull();
    expect(isSentryEnabled()).toBe(false);
  });

  it("treats a blank DSN as disabled", () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "   ";

    expect(getSentryDsn()).toBeNull();
    expect(isSentryEnabled()).toBe(false);
  });

  it("enables Sentry when a DSN is configured", () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://examplePublicKey@o0.ingest.sentry.io/0";

    expect(getSentryDsn()).toBe(
      "https://examplePublicKey@o0.ingest.sentry.io/0"
    );
    expect(isSentryEnabled()).toBe(true);
  });
});
