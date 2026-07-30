import { describe, expect, it } from "vitest";
import { getDefaultCredentialExpiry } from "./access-expiry";

describe("getDefaultCredentialExpiry", () => {
  it("calculates the seven-day default exactly", () => {
    expect(
      getDefaultCredentialExpiry(new Date("2026-07-30T12:00:00.000Z"))
    ).toBe("2026-08-06T12:00:00.000Z");
  });
});
